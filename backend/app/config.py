import os

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY")
    REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
    REDIS_PORT = 6379
    SESSION_DURATION = 3600  # 1 sat
