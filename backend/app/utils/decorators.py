from functools import wraps
from flask import request, jsonify
from app.utils.session import get_session

def login_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        session_id = request.headers.get("X-Session-Id")
        session = get_session(session_id)

        if not session:
            return jsonify({"error": "Unauthorized"}), 401

        request.user_id = int(session["user_id"])
        request.user_role = session["role"]

        return f(*args, **kwargs)
    return wrapper


def role_required(role):
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            if request.user_role != role:
                return jsonify({"error": "Forbidden"}), 403
            return f(*args, **kwargs)
        return wrapper
    return decorator
