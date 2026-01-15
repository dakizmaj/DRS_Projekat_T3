from flask import Blueprint, request, jsonify, make_response
from werkzeug.security import check_password_hash
from app.models.user import User
from app.utils.session import create_session, delete_session

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json

    user = User.query.filter_by(email=data.get("email")).first()
    if not user or not check_password_hash(user.password, data.get("password")):
        return jsonify({"message": "Neispravni kredencijali"}), 401

    session_id = create_session(user.id)

    response = make_response(jsonify({
        "message": "Uspešna prijava",
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
    session_id = request.cookies.get("session_id")
    delete_session(session_id)

    response = make_response(jsonify({"message": "Uspešna odjava"}))
    response.delete_cookie("session_id")
    return response


