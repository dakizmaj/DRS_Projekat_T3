from functools import wraps
from flask import request, jsonify, g
from app.extensions import redis_client

SESSION_PREFIX = "session:"
SESSION_TTL = 3600  # 1 sat


def login_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        # SESSION ID SE UVEK ČITA IZ HEADERA
        session_id = request.headers.get("X-Session-Id")

        if not session_id:
            return jsonify({"error": "Unauthorized"}), 401

        session_key = SESSION_PREFIX + session_id
        session = redis_client.hgetall(session_key)

        if not session:
            return jsonify({"error": "Session expired or invalid"}), 401

        # PODACI IZ REDIS-A
        g.user_id = int(session[b"user_id"])
        g.role = session[b"role"].decode()
        g.email = session[b"email"].decode()

        return f(*args, **kwargs)
    return wrapper


def role_required(*roles):
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            if g.role not in roles:
                return jsonify({"error": "Forbidden"}), 403
            return f(*args, **kwargs)
        return wrapper
    return decorator
