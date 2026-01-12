from flask import Blueprint, request
from app.services.user_service import (
    create_user,
    get_all_users,
    delete_user,
    update_profile
)
from app.utils.auth import require_role

user_bp = Blueprint("users", __name__)

# ADMIN – kreiranje korisnika
@user_bp.route("/users", methods=["POST"])
@require_role("ADMIN")
def add_user():
    data = request.json
    return create_user(data)

# ADMIN – listanje korisnika
@user_bp.route("/users", methods=["GET"])
@require_role("ADMIN")
def list_users():
    return get_all_users()

# ADMIN – brisanje korisnika
@user_bp.route("/users/<int:user_id>", methods=["DELETE"])
@require_role("ADMIN")
def remove_user(user_id):
    return delete_user(user_id)

# PROFESOR / STUDENT – izmena profila
@user_bp.route("/users/me", methods=["PUT"])
def edit_profile():
    data = request.json
    return update_profile(data)
