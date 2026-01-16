from functools import wraps
from flask import request, jsonify
from app.services.auth_service import get_user_from_session


def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        # Pokušaj da dobiješ session_id iz cookie-ja ili Authorization header-a
        session_id = request.cookies.get("session_id") or request.headers.get("Authorization")
        
        print(f"DEBUG: session_id from cookie: {request.cookies.get('session_id')}")
        print(f"DEBUG: session_id from header: {request.headers.get('Authorization')}")
        print(f"DEBUG: final session_id: {session_id}")
        
        user = get_user_from_session(session_id)
        print(f"DEBUG: user from session: {user}")

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
