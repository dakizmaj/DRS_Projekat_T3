import uuid
import json
import redis
from flask import jsonify, request

r = redis.Redis(host="localhost", port=6379, decode_responses=True)

# MOCK users (privremeno, dok ne povežem bazu)
USERS = {
    "admin@test.com": {"id": 1, "password": "admin123", "role": "ADMIN"},
    "prof@test.com": {"id": 2, "password": "prof123", "role": "PROFESOR"},
}

def login_user(data):
    email = data.get("email")
    password = data.get("password")

    user = USERS.get(email)

    if not user or user["password"] != password:
        return jsonify({"message": "Invalid credentials"}), 401

    session_id = str(uuid.uuid4())

    r.setex(
        session_id,
        3600,
        json.dumps({
            "user_id": user["id"],
            "role": user["role"]
        })
    )

    response = jsonify({"message": "Login successful"})
    response.set_cookie("session_id", session_id)

    return response, 200


def logout_user():
    session_id = request.cookies.get("session_id")

    if session_id:
        r.delete(session_id)

    response = jsonify({"message": "Logged out"})
    response.delete_cookie("session_id")
    return response, 200

