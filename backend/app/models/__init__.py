from flask import Flask
from .config import Config
from .extensions import db, sess, socketio, mail, redis_client

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    app.config["SESSION_REDIS"] = redis_client

    db.init_app(app)
    sess.init_app(app)
    socketio.init_app(app)
    mail.init_app(app)

    from .routes.auth_routes import auth_bp
    from .routes.user_routes import user_bp
    from .routes.course_routes import course_bp

    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(user_bp, url_prefix="/users")
    app.register_blueprint(course_bp, url_prefix="/courses")

    return app
