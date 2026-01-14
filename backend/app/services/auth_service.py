import uuid
from werkzeug.security import check_password_hash

from app.models.user import User
from app.extensions import redis_client

SESSION_TTL = 3600  # 1 sat


def authenticate_user(email, password):
    if not email or not password:
        return None

    user = User.query.filter_by(email=email).first()
    if not user:
        return None

    if not check_password_hash(user.password, password):
        return None

    return user


def create_session(user):
    session_id = str(uuid.uuid4())

    redis_client.hset(
        f"session:{session_id}",
        mapping={
            "user_id": user.id,
            "role": user.role,
            "email": user.email
        }
    )

    redis_client.expire(f"session:{session_id}", SESSION_TTL)

    return session_id


def delete_session(session_id):
    redis_client.delete(f"session:{session_id}")
