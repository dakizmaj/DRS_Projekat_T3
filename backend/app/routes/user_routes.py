from flask import Blueprint, jsonify, request
from app.models.user import User
from app.db import db
from app.auth.decorators import login_required, admin_required

user_bp = Blueprint("users", __name__)

@user_bp.route("/", methods=["GET"])
@login_required
@admin_required
def get_all_users(current_user_id):
    users = User.query.all()
    return jsonify([
        {
            "id": u.id,
            "email": u.email,
            "role": u.role
        } for u in users
    ])


@user_bp.route("/", methods=["POST"])
@login_required
@admin_required
def create_user(current_user_id):
    data = request.json

    user = User(
        first_name=data["first_name"],
        last_name=data["last_name"],
        email=data["email"],
        role=data["role"],
        date_of_birth=data["date_of_birth"],
        gender=data["gender"],
        country=data["country"],
        street=data["street"],
        street_number=data["street_number"]
    )
    user.set_password(data["password"])

    db.session.add(user)
    db.session.commit()

    return jsonify({"message": "User created"}), 201
