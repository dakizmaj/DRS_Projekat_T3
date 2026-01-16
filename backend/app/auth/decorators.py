from functools import wraps
from flask import jsonify, g

def login_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        if not hasattr(g, "user") or g.user is None:
            return jsonify({"error": "Unauthorized"}), 401
        return f(*args, **kwargs)
    return wrapper


def role_required(*roles):
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            if not hasattr(g, "role") or g.role not in roles:
                return jsonify({"error": "Forbidden"}), 403
            return f(*args, **kwargs)
        return wrapper
    return decorator
