from werkzeug.security import check_password_hash
from uuid import uuid4

from app.models.user import User
from app.services.redis_service import redis_service
from app import db


def login(email, password):
    if not email or not password:
        return None, "Email and password are required"

    user = User.query.filter_by(email=email).first()

    if not user:
        return None, "Invalid credentials"

    if not check_password_hash(user.password, password):
        return None, "Invalid credentials"

    session_id = str(uuid4())

    # Kreiranje sesije u Redis-u (TTL = 1 sat)
    redis_service.create_session(session_id, user.id)

    return session_id, None


def logout(session_id):
    redis_service.delete_session(session_id)


def get_user_from_session(session_id):
    if not session_id:
        return None

    user_id = redis_service.get_session_user(session_id)

    if not user_id:
        return None

    return User.query.get(int(user_id))
