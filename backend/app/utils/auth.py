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


def require_role(required_role):
    def decorator(func):
        def wrapper(*args, **kwargs):
            user = get_current_user()
            if not user or user["role"] != required_role:
                return jsonify({"message": "Unauthorized"}), 403
            return func(*args, **kwargs)
        return wrapper
    return decorator

