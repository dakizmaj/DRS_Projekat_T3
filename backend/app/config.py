import os

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY")

    REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
    REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
    REDIS_DB = 0  # sesije

    SESSION_DURATION = 3600  # 1 sat

