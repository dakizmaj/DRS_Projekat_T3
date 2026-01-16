from flask import Blueprint, request, jsonify, make_response
from app.models.user import User
from app.utils.session import create_session, delete_session

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json

    user = User.query.filter_by(email=data["email"]).first()
    if not user or not user.check_password(data["password"]):
        return jsonify({"error": "Invalid credentials"}), 401

    session_id = create_session(user.id)

    response = make_response(jsonify({
        "message": "Logged in",
        "role": user.role
    }))
    response.set_cookie(
        "session_id",
        session_id,
        httponly=True,
        samesite="Lax"
    )
    return response


@auth_bp.route("/logout", methods=["POST"])
def logout():
    delete_session()
    response = make_response(jsonify({"message": "Logged out"}))
    response.delete_cookie("session_id")
    return response
