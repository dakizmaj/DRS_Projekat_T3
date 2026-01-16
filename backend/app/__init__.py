from flask import Flask, g, request
from app.extensions import db
from app.routes.auth_routes import auth_bp
from app.routes.task_routes import task_bp
from app.routes.course_routes import course_bp
from app.routes.user_routes import user_bp
from app.utils.session import get_session_data

def create_app():
    app = Flask(__name__)
    app.config.from_object("app.config.Config")

    db.init_app(app)

    @app.before_request
    def load_user_from_session():
        session_id = request.cookies.get("session_id")

        if not session_id:
            g.user = None
            return

        session_data = get_session_data(session_id)

        if not session_data:
            g.user = None
            return

        # session_data je dict
        g.user = session_data
        g.user_id = session_data["user_id"]
        g.role = session_data["role"]
        g.email = session_data["email"]

    app.register_blueprint(auth_bp)
    app.register_blueprint(user_bp)
    app.register_blueprint(course_bp)
    app.register_blueprint(task_bp)

    with app.app_context():
        db.create_all()

    return app
