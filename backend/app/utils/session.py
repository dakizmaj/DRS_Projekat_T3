import uuid
from app.services.redis_service import redis_service

def create_session(user_id):
    session_id = str(uuid.uuid4())
    redis_service.create_session(session_id, user_id)
    return session_id

def get_user_from_session(session_id):
    return redis_service.get_session_user(session_id)

def delete_session(session_id):
    redis_service.delete_session(session_id)
