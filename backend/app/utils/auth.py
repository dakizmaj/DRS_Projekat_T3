import redis
import json
from flask import request, jsonify

r = redis.Redis(host="localhost", port=6379, decode_responses=True)

def get_current_user():
    session_id = request.cookies.get("session_id")
    if not session_id:
        return None

    data = r.get(session_id)
    if not data:
        return None

    return json.loads(data)


def get_current_user():
    session_id = request.cookies.get("session_id")
    if not session_id:
        return None
    data = r.get(session_id)
    return json.loads(data) if data else None

def require_role(role):
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            user = get_current_user()
            if not user or user["role"] != role:
                return jsonify({"message": "Forbidden"}), 403
            return f(*args, **kwargs)
        return wrapper
    return decorator


