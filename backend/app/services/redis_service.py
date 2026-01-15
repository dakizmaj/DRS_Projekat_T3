import redis
import os

class RedisService:
    def __init__(self):
        self.client = redis.Redis(
            host=os.getenv("REDIS_HOST", "localhost"),
            port=int(os.getenv("REDIS_PORT", 6379)),
            db=0,
            decode_responses=True
        )

    SESSION_PREFIX = "session:"
    SESSION_TTL = 3600  # 1 sat

    def create_session(self, session_id, user_id):
        self.client.setex(
            f"{self.SESSION_PREFIX}{session_id}",
            self.SESSION_TTL,
            user_id
        )

    def get_session_user(self, session_id):
        if not session_id:
            return None
        return self.client.get(f"{self.SESSION_PREFIX}{session_id}")

    def delete_session(self, session_id):
        if session_id:
            self.client.delete(f"{self.SESSION_PREFIX}{session_id}")


redis_service = RedisService()
