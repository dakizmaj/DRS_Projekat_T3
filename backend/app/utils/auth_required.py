from functools import wraps
from flask import request, jsonify
from app.extensions import redis_client

def auth_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        session_id = request.cookies.get("session_id")
        if not session_id:
            return jsonify({"error": "Unauthorized"}), 401

        user_id = redis_client.get(f"session:{session_id}")
        if not user_id:
            return jsonify({"error": "Session expired"}), 401

        request.user_id = int(user_id)
        return f(*args, **kwargs)

    return wrapper
