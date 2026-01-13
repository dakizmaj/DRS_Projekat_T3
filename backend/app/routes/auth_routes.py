from flask import Blueprint, request
from app.services.auth_service import login_user, logout_user

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json
    return login_user(data)

@auth_bp.route("/logout", methods=["POST"])
def logout():
    return logout_user()

