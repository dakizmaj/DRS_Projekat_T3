from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO
from flask_mail import Mail
import redis
import os

db = SQLAlchemy()
socketio = SocketIO(cors_allowed_origins="*")
mail = Mail()

redis_client = redis.Redis(
    host=os.getenv("REDIS_HOST", "redis"),
    port=6379,
    decode_responses=True
)


