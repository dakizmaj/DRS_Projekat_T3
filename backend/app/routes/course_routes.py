from flask import Blueprint, request
from app.utils.decorators import login_required, role_required, admin_required
from app.services.course_service import (
    create_course_request,
    approve_course,
    reject_course,
    get_my_requests
)

course_bp = Blueprint("courses", __name__, url_prefix="/courses")


@course_bp.post("/")
@login_required
@role_required("PROFESOR")
def request_course():
    data = request.get_json()
    professor_id = request.user_id

    return create_course_request(data, professor_id)


@course_bp.get("/my")
@login_required
@role_required("PROFESOR")
def my_requests():
    professor_id = request.user_id
    return get_my_requests(professor_id)


@course_bp.post("/<int:course_id>/approve")
@login_required
@admin_required
def approve(course_id):
    return approve_course(course_id)


@course_bp.post("/<int:course_id>/reject")
@login_required
@admin_required
def reject(course_id):
    return reject_course(course_id)
