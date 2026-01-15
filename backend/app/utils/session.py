import redis
import uuid

redis_client = redis.Redis(
    host="localhost",
    port=6379,
    db=0,
    decode_responses=True
)

SESSION_TTL = 60 * 60  # 1 sat

def create_session(user_id, role):
    session_id = str(uuid.uuid4())
    key = f"session:{session_id}"

    redis_client.hset(key, mapping={
        "user_id": user_id,
        "role": role
    })
    redis_client.expire(key, SESSION_TTL)

    return session_id

def get_session(session_id):
    if not session_id:
        return None

    key = f"session:{session_id}"
    if not redis_client.exists(key):
        return None

    return redis_client.hgetall(key)

def delete_session(session_id):
    key = f"session:{session_id}"
    redis_client.delete(key)
