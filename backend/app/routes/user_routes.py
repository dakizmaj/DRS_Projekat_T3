from flask import Blueprint, request
from app.services.user_service import (
    create_user,
    get_all_users,
    delete_user,
    update_profile
)
from app.utils.decorators import login_required, admin_required

user_bp = Blueprint("users", __name__, url_prefix="/users")


@user_bp.route("/", methods=["POST"])
@admin_required
def create():
    data = request.get_json()
    return create_user(data)


@user_bp.route("/", methods=["GET"])
@admin_required
def list_users():
    return get_all_users()


@user_bp.route("/<int:user_id>", methods=["DELETE"])
@admin_required
def remove(user_id):
    return delete_user(user_id)


@user_bp.route("/<int:user_id>", methods=["PUT"])
@login_required
def update(user_id):
    data = request.get_json()
    return update_profile(user_id, data)
