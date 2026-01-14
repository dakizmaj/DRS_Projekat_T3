from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO
from flask_mail import Mail
import redis

db = SQLAlchemy()
socketio = SocketIO(cors_allowed_origins="*")
mail = Mail()

redis_client = redis.Redis(
    host="localhost",
    port=6379,
    decode_responses=True
)

