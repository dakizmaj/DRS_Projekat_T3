from flask import Blueprint, request, jsonify, make_response
from app.services.auth_service import login, logout

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/login", methods=["POST"])
def login_route():
    data = request.json
    session_id, user, error = login(data.get("email"), data.get("password"))

    if error:
        return jsonify({"message": error}), 401

    response = make_response(jsonify({
        "message": "Login successful",
        "session_id": session_id,
        "user": {
            "id": user.id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "role": user.role,
            "date_of_birth": str(user.date_of_birth) if user.date_of_birth else None,
            "gender": user.gender,
            "country": user.country,
            "street": user.street,
            "street_number": user.street_number,
            "profile_image": user.profile_image
        }
    }))
    response.set_cookie(
        "session_id",
        session_id,
        httponly=False,
        max_age=3600,
        samesite='Lax',
        path='/'
    )
    print(f"DEBUG: Created session {session_id} for user {user.email}")
    return response


@auth_bp.route("/logout", methods=["POST"])
def logout_route():
    session_id = request.cookies.get("session_id")

    if session_id:
        logout(session_id)

    response = make_response(jsonify({"message": "Logged out"}))
    response.delete_cookie("session_id")
    return response
