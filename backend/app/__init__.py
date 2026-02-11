from flask import Flask, g, request
from flask_cors import CORS
from app.extensions import db, socketio, mail
from app.routes.auth_routes import auth_bp
from app.routes.course_routes import course_bp
from app.routes.user_routes import user_bp
from app.routes.task_routes import task_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object("app.config.Config")

    # CORS konfiguracija - dozvoli sve localhost portove za razvoj
    CORS(app, 
         origins=["http://localhost:5173", "http://127.0.0.1:5173", 
                  "http://localhost:5174", "http://127.0.0.1:5174", 
                  "http://localhost:5175", "http://127.0.0.1:5175"],
         supports_credentials=True,
         allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
         expose_headers=["Content-Disposition"]
    )

    db.init_app(app)
    mail.init_app(app)

    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(user_bp, url_prefix='/users')
    app.register_blueprint(course_bp, url_prefix='/courses')
    app.register_blueprint(task_bp, url_prefix='/tasks')

    # Dodaj CORS headere na svaki response
    @app.after_request
    def after_request(response):
        origin = request.headers.get('Origin')
        if origin in ["http://localhost:5173", "http://127.0.0.1:5173", 
                      "http://localhost:5174", "http://127.0.0.1:5174",
                      "http://localhost:5175", "http://127.0.0.1:5175"]:
            response.headers['Access-Control-Allow-Origin'] = origin
            response.headers['Access-Control-Allow-Credentials'] = 'true'
            response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With'
            response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
            response.headers['Access-Control-Expose-Headers'] = 'Content-Disposition'
        return response

    socketio.init_app(app)

    with app.app_context():
        db.create_all()

    return app
