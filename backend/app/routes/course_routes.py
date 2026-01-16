from flask import Blueprint, request, jsonify, g
from app.auth.decorators import login_required, role_required
from app.services.course_service import (
    create_course_request,
    approve_course,
    reject_course,
    get_my_requests
)

course_bp = Blueprint("courses", __name__, url_prefix="/courses")


# PROFESOR: ZAHTEV ZA KURS
@course_bp.post("/")
@login_required
@role_required("professor")
def request_course():
    data = request.get_json()

    if not data or "name" not in data or "description" not in data:
        return jsonify({"error": "Name and description required"}), 400

    return create_course_request(data, g.user_id)


# PROFESOR: MOJI ZAHTEVI + STATUS
@course_bp.get("/my")
@login_required
@role_required("professor")
def my_requests():
    return get_my_requests(g.user_id)


# ADMIN: ODOBRAVANJE
@course_bp.post("/<int:course_id>/approve")
@login_required
@role_required("admin")
def approve(course_id):
    return approve_course(course_id)


# ADMIN: ODBIJANJE
@course_bp.post("/<int:course_id>/reject")
@login_required
@role_required("admin")
def reject(course_id):
    return reject_course(course_id)
