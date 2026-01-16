from flask import Blueprint, request, jsonify, g, current_app
from werkzeug.security import generate_password_hash
from werkzeug.utils import secure_filename
from app.models.user import User
from app.extensions import db
from app.auth.decorators import login_required, role_required
import os

user_bp = Blueprint("users", __name__, url_prefix="/users")

# -----------------------------
# ADMIN: KREIRANJE KORISNIKA
# -----------------------------
@user_bp.route("/", methods=["POST"])
@login_required
@role_required("admin")
def create_user():
    data = request.json

    required_fields = [
        "first_name", "last_name", "email",
        "password", "role", "date_of_birth",
        "gender", "country", "street", "number"
    ]

    if not data or not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400

    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"error": "Email already exists"}), 409

    user = User(
        first_name=data["first_name"],
        last_name=data["last_name"],
        email=data["email"],
        password=generate_password_hash(data["password"]),
        role=data["role"],
        date_of_birth=data["date_of_birth"],
        gender=data["gender"],
        country=data["country"],
        street=data["street"],
        number=data["number"]
    )

    db.session.add(user)
    db.session.commit()

    return jsonify({"message": "User created"}), 201


# -----------------------------
# ADMIN: LISTANJE KORISNIKA
# -----------------------------
@user_bp.route("/", methods=["GET"])
@login_required
@role_required("admin")
def get_users():
    users = User.query.all()

    return jsonify([
        {
            "id": u.id,
            "first_name": u.first_name,
            "last_name": u.last_name,
            "email": u.email,
            "role": u.role
        }
        for u in users
    ]), 200


# -----------------------------
# ADMIN: BRISANJE KORISNIKA
# -----------------------------
@user_bp.route("/<int:user_id>", methods=["DELETE"])
@login_required
@role_required("admin")
def delete_user(user_id):
    if g.user_id == user_id:
        return jsonify({"error": "Admin cannot delete himself"}), 400

    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    db.session.delete(user)
    db.session.commit()

    return jsonify({"message": "User deleted"}), 200


# -----------------------------
# KORISNIK: IZMENA SOPSTVENOG PROFILA
# -----------------------------
@user_bp.route("/me", methods=["PUT"])
@login_required
def update_profile():
    user = User.query.get(g.user_id)
    data = request.json

    if not data:
        return jsonify({"error": "No data provided"}), 400

    allowed_fields = [
        "first_name", "last_name", "date_of_birth",
        "gender", "country", "street", "number"
    ]

    for field in allowed_fields:
        if field in data:
            setattr(user, field, data[field])

    db.session.commit()
    return jsonify({"message": "Profile updated"}), 200


# -----------------------------
# KORISNIK: UPLOAD PROFILNE SLIKE
# -----------------------------
@user_bp.route("/me/profile-image", methods=["POST"])
@login_required
def upload_profile_image():
    if "image" not in request.files:
        return jsonify({"error": "No image provided"}), 400

    file = request.files["image"]

    if file.filename == "":
        return jsonify({"error": "Empty filename"}), 400

    filename = secure_filename(file.filename)

    upload_dir = os.path.join(
        current_app.root_path,
        "uploads",
        "profile_images"
    )
    os.makedirs(upload_dir, exist_ok=True)

    file_path = os.path.join(upload_dir, filename)
    file.save(file_path)

    # čuvamo RELATIVNU putanju
    user = User.query.get(g.user_id)
    user.profile_image = f"uploads/profile_images/{filename}"
    db.session.commit()

    return jsonify({"message": "Profile image uploaded"}), 200
