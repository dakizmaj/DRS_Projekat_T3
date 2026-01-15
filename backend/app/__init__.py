from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_session import Session
from flask_cors import CORS

db = SQLAlchemy()
session = Session()

def create_app():
    app = Flask(__name__)
    app.config.from_object("app.config.Config")

    CORS(app, supports_credentials=True)

    db.init_app(app)
    session.init_app(app)

    from app.routes.auth_routes import auth_bp
    from app.routes.user_routes import users_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(users_bp, url_prefix="/api/users")

    from app.routes.task_routes import task_bp
    app.register_blueprint(task_bp)


    with app.app_context():
        db.create_all()

    return app
