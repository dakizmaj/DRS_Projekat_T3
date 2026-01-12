from flask import jsonify
from app.utils.auth import get_current_user

# MOCK baza korisnika
USERS = [
    {"id": 1, "email": "admin@test.com", "role": "ADMIN"},
    {"id": 2, "email": "prof@test.com", "role": "PROFESOR"},
]

def create_user(data):
    new_user = {
        "id": len(USERS) + 1,
        "email": data["email"],
        "role": data["role"]
    }
    USERS.append(new_user)
    return jsonify(new_user), 201


def get_all_users():
    return jsonify(USERS), 200


def delete_user(user_id):
    global USERS
    USERS = [u for u in USERS if u["id"] != user_id]
    return jsonify({"message": "User deleted"}), 200


def update_profile(data):
    current_user = get_current_user()
    if not current_user:
        return jsonify({"message": "Unauthorized"}), 401

    # samo simulacija izmene
    return jsonify({
        "message": "Profile updated",
        "data": data
    }), 200
