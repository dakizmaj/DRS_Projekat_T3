from flask import Blueprint, request, jsonify
from werkzeug.security import check_password_hash
from app.models.user import User
from app.extensions import db
from app.utils.session import create_session, delete_session

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json

    # VALIDACIJA
    if not data or "email" not in data or "password" not in data:
        return jsonify({"error": "Email i lozinka su obavezni"}), 400

    user = User.query.filter_by(email=data["email"]).first()

    if not user or not check_password_hash(user.password, data["password"]):
        return jsonify({"error": "Invalid credentials"}), 401

    # KREIRANJE SESIJE U REDIS-U
    session_id = create_session(user.id, user.role, user.email)

    return jsonify({
        "message": "Uspešna prijava",
        "session_id": session_id,
        "role": user.role,
        "email": user.email
    }), 200


@auth_bp.route("/logout", methods=["POST"])
def logout():
    session_id = request.headers.get("X-Session-Id")

    if not session_id:
        return jsonify({"error": "Session ID missing"}), 400

    delete_session(session_id)
    return jsonify({"message": "Uspešna odjava"}), 200
