from flask import Flask, g, request
from flask_cors import CORS
from app.extensions import db, socketio, mail
from app.routes.auth_routes import auth_bp
from app.routes.course_routes import course_bp
from app.routes.user_routes import user_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object("app.config.Config")

    # CORS konfiguracija
    CORS(app, 
         origins=["http://localhost:5173", "http://127.0.0.1:5173"],
         supports_credentials=True,
         allow_headers=["Content-Type", "Authorization"],
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    )

    db.init_app(app)
    mail.init_app(app)

    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(user_bp, url_prefix='/users')
    app.register_blueprint(course_bp, url_prefix='/courses')

    socketio.init_app(app)

    with app.app_context():
        db.create_all()

    return app
