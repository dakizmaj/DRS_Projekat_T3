from flask import Blueprint, request, jsonify
from app.auth.decorators import login_required, role_required
from app.services.user_service import (
    create_user,
    get_all_users,
    delete_user,
    update_user
)

user_bp = Blueprint("users", __name__)


@user_bp.route("/", methods=["POST"])
@login_required
@role_required("admin")
def create_user_route():
    user = create_user(request.json)
    return jsonify({"message": "User created", "id": user.id})


@user_bp.route("/", methods=["GET"])
@login_required
@role_required("admin")
def list_users():
    users = get_all_users()
    return jsonify([
        {
            "id": u.id,
            "first_name": u.first_name,
            "last_name": u.last_name,
            "email": u.email,
            "role": u.role
        } for u in users
    ])


@user_bp.route("/<int:user_id>", methods=["DELETE"])
@login_required
@role_required("admin")
def delete_user_route(user_id):
    if delete_user(user_id):
        return jsonify({"message": "User deleted"})
    return jsonify({"message": "User not found"}), 404


@user_bp.route("/me", methods=["PUT"])
@login_required
def update_profile():
    user = request.user
    update_user(user, request.json)
    return jsonify({"message": "Profile updated"})
