from flask import Blueprint, request
from app.services.course_service import (
    create_course_request,
    get_course_requests,
    process_course_request
)
from app.utils.auth import require_role

course_bp = Blueprint("courses", __name__)

# PROFESOR – šalje zahtev za novi kurs
@course_bp.route("/course-requests", methods=["POST"])
@require_role("PROFESOR")
def send_course_request():
    data = request.json
    return create_course_request(data)

# PROFESOR – vidi svoje zahteve
@course_bp.route("/course-requests", methods=["GET"])
@require_role("PROFESOR")
def my_course_requests():
    return get_course_requests()

# ADMIN – prihvata ili odbija zahtev
@course_bp.route("/course-requests/<int:req_id>", methods=["PUT"])
@require_role("ADMIN")
def handle_course_request(req_id):
    data = request.json
    return process_course_request(req_id, data)
