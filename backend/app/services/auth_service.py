import uuid
from flask import jsonify, request, make_response
from werkzeug.security import check_password_hash
import redis

from app.config import Config
from app.models.user import User
from app import db  # ako već koristiš SQLAlchemy


# Redis konekcija (preko Config-a)
redis_client = redis.Redis(
    host=Config.REDIS_HOST,
    port=Config.REDIS_PORT,
    decode_responses=True
)


def login_user(data):
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"message": "Email and password are required"}), 400

    # User iz baze
    user = User.query.filter_by(email=email).first()

    if not user or not check_password_hash(user.password, password):
        return jsonify({"message": "Invalid credentials"}), 401

    session_id = str(uuid.uuid4())

    # Session u Redis-u (session-based auth)
    redis_client.setex(
        f"session:{session_id}",
        Config.SESSION_DURATION,
        user.id
    )

    response = make_response(jsonify({
        "message": "Login successful",
        "role": user.role
    }))
    response.set_cookie(
        "session_id",
        session_id,
        httponly=True
    )

    return response, 200


def logout_user():
    session_id = request.cookies.get("session_id")

    if session_id:
        redis_client.delete(f"session:{session_id}")

    response = make_response(jsonify({"message": "Logged out"}))
    response.delete_cookie("session_id")

    return response, 200
