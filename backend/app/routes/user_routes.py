from flask import Blueprint, jsonify, session
from app.models.user import User

users_bp = Blueprint("users", __name__)

@users_bp.route("/me", methods=["GET"])
def current_user():
    user_id = session.get("user_id")

    if not user_id:
        return jsonify({"error": "Niste prijavljeni"}), 401

    user = User.query.get(user_id)

    return jsonify({
        "id": user.id,
        "ime": user.ime,
        "prezime": user.prezime,
        "email": user.email,
        "uloga": user.uloga
    })
