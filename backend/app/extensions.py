from flask_sqlalchemy import SQLAlchemy
from flask_session import Session
from flask_socketio import SocketIO
from flask_mail import Mail
import redis

db = SQLAlchemy()
sess = Session()
socketio = SocketIO(cors_allowed_origins="*")
mail = Mail()

redis_client = redis.Redis(host="redis", port=6379, decode_responses=True)
