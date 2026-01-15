import os
from datetime import timedelta
import redis

class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "super-secret-key")

    SQLALCHEMY_DATABASE_URI = (
        os.environ.get("DATABASE_URL")
        or "postgresql://postgres:postgres@localhost:5432/drs_platforma"
    )

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # SESSION CONFIG (REDIS)
    SESSION_TYPE = "redis"
    SESSION_PERMANENT = True
    SESSION_USE_SIGNER = True
    PERMANENT_SESSION_LIFETIME = timedelta(hours=1)

    SESSION_REDIS = redis.from_url(
        os.environ.get("REDIS_URL") or "redis://localhost:6379"
    )

