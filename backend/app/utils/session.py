import uuid
from app.extensions import redis_client

SESSION_PREFIX = "session:"
SESSION_TTL = 3600  # 1 sat


def create_session(user_id, role, email):
    session_id = str(uuid.uuid4())
    session_key = SESSION_PREFIX + session_id

    redis_client.hset(session_key, mapping={
        "user_id": user_id,
        "role": role,
        "email": email
    })
    redis_client.expire(session_key, SESSION_TTL)

    return session_id


def get_session_data(session_id):
    session_key = SESSION_PREFIX + session_id
    session = redis_client.hgetall(session_key)

    if not session:
        return None

    return {
        "user_id": int(session[b"user_id"]),
        "role": session[b"role"].decode(),
        "email": session[b"email"].decode()
    }


def delete_session(session_id):
    if session_id:
        redis_client.delete(SESSION_PREFIX + session_id)
