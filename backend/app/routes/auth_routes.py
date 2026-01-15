from flask import Blueprint, request, jsonify
from app.services.auth_service import login_user, logout_user

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")


@auth_bp.route("/login", methods=["POST"])
def login():
    if not request.is_json:
        return jsonify({"message": "Request must be JSON"}), 400

    data = request.get_json()
    email = data.get("email")
    password = data.get("password")
    user, session_id = login_user(email, password)
    if not user:
        return jsonify({"message": "Pogrešan email ili lozinka"}), 401
    return jsonify({
        "message": "Uspešna prijava",
        "user": user.to_dict(),
        "session_id": session_id
    })


@auth_bp.route("/logout", methods=["POST"])
def logout():
    return logout_user()


