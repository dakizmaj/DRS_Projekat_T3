from functools import wraps
from flask import request, jsonify
from app.extensions import redis_client


def get_session_id():
    # Prvo pokušaj iz headera, pa iz cookie-ja
    return request.headers.get("X-Session-Id") or request.cookies.get("session_id")


def login_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        session_id = get_session_id()
        if not session_id:
            return jsonify({"error": "Unauthorized"}), 401
        user_id = redis_client.hget(f"session:{session_id}", "user_id")
        if not user_id:
            return jsonify({"error": "Session expired"}), 401
        request.user_id = int(user_id)
        return f(*args, **kwargs)
    return wrapper


def role_required(role):
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            session_id = get_session_id()
            if not session_id:
                return jsonify({"error": "Unauthorized"}), 401
            role_in_session = redis_client.hget(f"session:{session_id}", "role")
            if role_in_session != role:
                return jsonify({"error": "Forbidden"}), 403
            return f(*args, **kwargs)
        return wrapper
    return decorator


def admin_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        session_id = get_session_id()
        if not session_id:
            return jsonify({"error": "Unauthorized"}), 401
        role = redis_client.hget(f"session:{session_id}", "role")
        if role != "ADMIN":
            return jsonify({"error": "Forbidden"}), 403
        return f(*args, **kwargs)
    return wrapper
