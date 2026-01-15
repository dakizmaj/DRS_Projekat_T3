from flask import Blueprint, request, send_from_directory
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


@user_bp.route('/<int:user_id>/upload', methods=['POST'])
@login_required
def upload_profile_image(user_id):
    from flask import request, jsonify, current_app
    from app.models import User
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404
    if request.user_id != user.id:
        return jsonify({'message': 'Unauthorized'}), 403
    if 'file' not in request.files:
        return jsonify({'message': 'No file'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'message': 'No selected file'}), 400
    import os
    filename = f'user_{user.id}_profile.png'
    upload_folder = os.path.join(current_app.root_path, '..', 'instance', 'profile_images')
    os.makedirs(upload_folder, exist_ok=True)
    filepath = os.path.join(upload_folder, filename)
    file.save(filepath)
    user.profile_image = filename
    from app import db
    db.session.commit()
    return jsonify({'profile_image': filename})


@user_bp.route('/profile_images/<filename>')
def profile_image(filename):
    import os
    folder = os.path.join(os.path.dirname(__file__), '../../instance/profile_images')
    return send_from_directory(folder, filename)
