import uuid
from flask import request, current_app

SESSION_TTL = 3600  # 1 sat

def create_session(user_id):
    session_id = str(uuid.uuid4())
    current_app.redis.setex(
        f"session:{session_id}",
        SESSION_TTL,
        user_id
    )
    return session_id


def get_current_user_id():
    session_id = request.cookies.get("session_id")
    if not session_id:
        return None
    return current_app.redis.get(f"session:{session_id}")


def delete_session():
    session_id = request.cookies.get("session_id")
    if session_id:
        current_app.redis.delete(f"session:{session_id}")
