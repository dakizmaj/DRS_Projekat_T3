from flask import Blueprint, request, jsonify
from app.auth.decorators import login_required, role_required
from app.services.course_service import (
    create_course_request,
    get_pending_courses,
    approve_course,
    reject_course,
    get_professor_courses
)
from app.sockets.admin_socket import notify_new_course


course_bp = Blueprint("courses", __name__)


# =========================
# PROFESOR → šalje zahtev za kurs
# =========================
@course_bp.route("/", methods=["POST"])
@login_required
@role_required("professor")
def request_course():
    data = request.json

    if not data or "name" not in data or "description" not in data:
        return jsonify({"message": "Invalid data"}), 400

    course = create_course_request(data, request.user.id)

    # REAL-TIME NOTIFIKACIJA ADMINA
    notify_new_course(course.name, request.user.email)

    return jsonify({
        "message": "Course request created",
        "course_id": course.id,
        "status": course.status
    }), 201


# =========================
# PROFESOR → vidi svoje kurseve i status
# =========================
@course_bp.route("/my", methods=["GET"])
@login_required
@role_required("professor")
def my_courses():
    courses = get_professor_courses(request.user.id)
    return jsonify([
        {
            "id": c.id,
            "name": c.name,
            "status": c.status
        } for c in courses
    ])


# =========================
# ADMIN → vidi sve pending zahteve
# =========================
@course_bp.route("/pending", methods=["GET"])
@login_required
@role_required("admin")
def pending_courses():
    courses = get_pending_courses()
    return jsonify([
        {
            "id": c.id,
            "name": c.name,
            "description": c.description,
            "professor_id": c.professor_id
        } for c in courses
    ])


# =========================
# ADMIN → prihvata kurs
# =========================
@course_bp.route("/<int:course_id>/approve", methods=["POST"])
@login_required
@role_required("admin")
def approve(course_id):
    course = approve_course(course_id)
    if not course:
        return jsonify({"message": "Course not found"}), 404

    return jsonify({"message": "Course approved"}), 200


# =========================
# ADMIN → odbija kurs
# =========================
@course_bp.route("/<int:course_id>/reject", methods=["POST"])
@login_required
@role_required("admin")
def reject(course_id):
    course = reject_course(course_id)
    if not course:
        return jsonify({"message": "Course not found"}), 404

    return jsonify({"message": "Course rejected"}), 200


