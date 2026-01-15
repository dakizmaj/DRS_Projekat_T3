from functools import wraps
from flask import request, jsonify
from app.utils.session import get_user_from_session
from app.models.user import User

def login_required(role=None):
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            session_id = request.cookies.get("session_id")
            user_id = get_user_from_session(session_id)

            if not user_id:
                return jsonify({"message": "Niste prijavljeni"}), 401

            user = User.query.get(user_id)
            if not user:
                return jsonify({"message": "Sesija nije validna"}), 401

            if role and user.role != role:
                return jsonify({"message": "Nemate dozvolu"}), 403

            request.user = user
            return f(*args, **kwargs)
        return wrapper
    return decorator
