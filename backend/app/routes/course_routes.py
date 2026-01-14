from flask import Blueprint, request, jsonify, session
from ..models.course import Course
from ..extensions import db, socketio
from ..utils.decorators import login_required, role_required
from ..services.mail_service import send_email

course_bp = Blueprint("courses", __name__)

@course_bp.post("/")
@login_required
@role_required("professor")
def request_course():
    data = request.json
    course = Course(
        name=data["name"],
        description=data["description"],
        professor_id=session["user_id"]
    )
    db.session.add(course)
    db.session.commit()

    socketio.emit("new_course_request", {"course": course.name})
    return jsonify({"message": "Request sent"})

@course_bp.post("/<int:course_id>/approve")
@login_required
@role_required("admin")
def approve_course(course_id):
    course = Course.query.get(course_id)
    course.status = "approved"
    db.session.commit()
    send_email("Course approved", "Your course was approved")
    return jsonify({"message": "Approved"})

@course_bp.post("/<int:course_id>/reject")
@login_required
@role_required("admin")
def reject_course(course_id):
    course = Course.query.get(course_id)
    course.status = "rejected"
    db.session.commit()
    send_email("Course rejected", "Your course was rejected")
    return jsonify({"message": "Rejected"})
