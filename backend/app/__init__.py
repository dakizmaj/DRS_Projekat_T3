from flask import Flask
from flask_socketio import SocketIO
from .config import Config

socketio = SocketIO()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    socketio.init_app(app, cors_allowed_origins="*")

    from .routes.auth_routes import auth_bp
    from .routes.user_routes import user_bp
    from .routes.course_routes import course_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(user_bp)
    app.register_blueprint(course_bp)

    return app
