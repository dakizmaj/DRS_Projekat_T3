from werkzeug.security import check_password_hash
from uuid import uuid4
from datetime import datetime, timedelta

from app.services.redis_service import redis_client
from app.models.user import User
from app import db

SESSION_PREFIX = "session:"
SESSION_TTL_SECONDS = 3600  # 1 sat


def login(email, password):
    user = User.query.filter_by(email=email).first()

    if not user:
        return None, "Invalid credentials"

    if not check_password_hash(user.password, password):
        return None, "Invalid credentials"

    session_id = str(uuid4())

    redis_client.setex(
        SESSION_PREFIX + session_id,
        SESSION_TTL_SECONDS,
        user.id
    )

    return session_id, None


def logout(session_id):
    redis_client.delete(SESSION_PREFIX + session_id)


def get_user_from_session(session_id):
    if not session_id:
        return None

    user_id = redis_client.get(SESSION_PREFIX + session_id)

    if not user_id:
        return None

    return User.query.get(int(user_id))
