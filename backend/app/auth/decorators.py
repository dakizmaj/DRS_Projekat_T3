from functools import wraps
from flask import jsonify
from app.utils.session import get_current_user_id
from app.models.user import User

def login_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        user_id = get_current_user_id()
        if not user_id:
            return jsonify({"error": "Unauthorized"}), 401
        return fn(user_id, *args, **kwargs)
    return wrapper


def admin_required(fn):
    @wraps(fn)
    def wrapper(current_user_id, *args, **kwargs):
        user = User.query.get(current_user_id)
        if user.role != "admin":
            return jsonify({"error": "Forbidden"}), 403
        return fn(current_user_id, *args, **kwargs)
    return wrapper


def professor_required(fn):
    @wraps(fn)
    def wrapper(current_user_id, *args, **kwargs):
        user = User.query.get(current_user_id)
        if user.role != "profesor":
            return jsonify({"error": "Forbidden"}), 403
        return fn(current_user_id, *args, **kwargs)
    return wrapper
