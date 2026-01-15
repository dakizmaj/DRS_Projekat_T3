from flask import Blueprint, request, jsonify
from werkzeug.security import check_password_hash
from app.models.user import User
from app.extensions import db
from app.utils.session import create_session, delete_session

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json
    user = User.query.filter_by(email=data["email"]).first()

    if not user or not check_password_hash(user.password, data["password"]):
        return jsonify({"error": "Invalid credentials"}), 401

    session_id = create_session(user.id, user.role)
    return jsonify({"session_id": session_id})

@auth_bp.route("/logout", methods=["POST"])
def logout():
    session_id = request.headers.get("X-Session-Id")
    delete_session(session_id)
    return jsonify({"message": "Logged out"})

