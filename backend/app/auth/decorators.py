from functools import wraps
from flask import request, jsonify
from app.services.auth_service import get_user_from_session


def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        session_id = request.cookies.get("session_id")
        user = get_user_from_session(session_id)

        if not user:
            return jsonify({"message": "Unauthorized"}), 401

        request.user = user
        return f(*args, **kwargs)
    return decorated


def role_required(role):
    def wrapper(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            if request.user.role != role:
                return jsonify({"message": "Forbidden"}), 403
            return f(*args, **kwargs)
        return decorated
    return wrapper
