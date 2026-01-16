from flask import Blueprint, request, jsonify, make_response
from app.services.auth_service import login, logout

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/login", methods=["POST"])
def login_route():
    data = request.json
    session_id, error = login(data.get("email"), data.get("password"))

    if error:
        return jsonify({"message": error}), 401

    response = make_response(jsonify({"message": "Login successful"}))
    response.set_cookie(
        "session_id",
        session_id,
        httponly=True,
        max_age=3600
    )
    return response


@auth_bp.route("/logout", methods=["POST"])
def logout_route():
    session_id = request.cookies.get("session_id")

    if session_id:
        logout(session_id)

    response = make_response(jsonify({"message": "Logged out"}))
    response.delete_cookie("session_id")
    return response
