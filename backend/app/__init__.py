from flask import Flask
from app.extensions import db
from app.routes.auth_routes import auth_bp
from app.routes.task_routes import task_bp
from app.routes.course_routes import course_bp
from app.routes.user_routes import user_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object("app.config.Config")

    db.init_app(app)

    app.register_blueprint(auth_bp)
    app.register_blueprint(user_bp)
    app.register_blueprint(course_bp)
    app.register_blueprint(task_bp)

    with app.app_context():
        db.create_all()

    return app
