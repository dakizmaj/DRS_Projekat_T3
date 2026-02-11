from flask import Blueprint, request, jsonify
from app.auth.decorators import login_required, role_required
from app.services.user_service import (
    create_user,
    get_all_users,
    delete_user,
    update_user
)
from app.models.user import User
from app import db

user_bp = Blueprint("users", __name__)


@user_bp.route("/", methods=["POST"])
@login_required
@role_required("admin")
def create_user_route():
    data = request.json

    if not data:
        return jsonify({"error": "Nema podataka u zahtevu"}), 400

    required_fields = [
        "first_name", "last_name", "email", "password",
        "role", "date_of_birth", "gender"
    ]

    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Nedostaje polje: {field}"}), 400

    user = create_user(data)
    return jsonify({"message": "User created", "id": user.id}), 201


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


@user_bp.route("/me", methods=["GET"])
@login_required
def get_profile():
    user = request.user
    
    return jsonify({
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
    }), 200


@user_bp.route("/me", methods=["PUT"])
@login_required
def update_profile():
    data = request.json
    user = request.user

    if not data:
        return jsonify({"error": "Nema podataka za izmenu"}), 400

    # Samo role, password i id ne smeju da se menjaju
    forbidden_fields = ["role", "password", "id"]

    for field in forbidden_fields:
        if field in data:
            return jsonify({"error": f"Polje '{field}' nije dozvoljeno za izmenu"}), 403

    update_user(user, data)
    
    # Vrati ažurirane podatke
    return jsonify({
        "message": "Profile updated",
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
    })


@user_bp.route("/students", methods=["GET"])
@login_required
@role_required("professor")
def list_students():
    """Lista svih studenata - dostupno profesorima"""
    users = get_all_users()
    students = [u for u in users if u.role == 'student']
    return jsonify([
        {
            "id": s.id,
            "first_name": s.first_name,
            "last_name": s.last_name,
            "email": s.email,
            "role": s.role,
            "profile_image": s.profile_image
        } for s in students
    ])


@user_bp.route("/<int:user_id>/upload", methods=["POST"])
@login_required
def upload_profile_image(user_id):
    """Upload profilne slike"""
    import os
    import uuid
    
    # Proveri da li korisnik može da menja svoj profil
    if request.user.id != user_id and request.user.role != 'admin':
        return jsonify({"message": "Forbidden"}), 403
    
    if 'file' not in request.files:
        return jsonify({"message": "No file provided"}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({"message": "No file selected"}), 400
    
    # Proveri da li je slika
    allowed_extensions = {'.png', '.jpg', '.jpeg', '.gif'}
    file_ext = os.path.splitext(file.filename)[1].lower()
    
    if file_ext not in allowed_extensions:
        return jsonify({"message": "Only image files allowed"}), 400
    
    # Kreiraj jedinstveno ime fajla
    filename = f"{user_id}_{uuid.uuid4().hex}{file_ext}"
    upload_folder = os.path.join('uploads', 'profile_images')
    os.makedirs(upload_folder, exist_ok=True)
    
    file_path = os.path.join(upload_folder, filename)
    file.save(file_path)
    
    # Ažuriraj user-a
    user = User.query.get(user_id)
    if user:
        # Obriši staru sliku ako postoji
        if user.profile_image:
            old_path = os.path.join(upload_folder, user.profile_image)
            if os.path.exists(old_path):
                try:
                    os.remove(old_path)
                except:
                    pass
        
        user.profile_image = filename
        db.session.commit()
    
    return jsonify({
        "message": "Profile image uploaded",
        "profile_image": filename
    }), 200


@user_bp.route("/profile_images/<filename>", methods=["GET"])
def serve_profile_image(filename):
    """Servira profilne slike"""
    from flask import send_from_directory
    import os
    
    upload_folder = os.path.join(os.getcwd(), 'uploads', 'profile_images')
    
    return send_from_directory(upload_folder, filename)
