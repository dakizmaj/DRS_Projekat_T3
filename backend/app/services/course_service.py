from flask import jsonify, request
from app import db
from app.models.course import Course
from app.services.mail_service import send_email
from app.extensions import socketio


def create_course_request(data, professor_id):
    if "name" not in data or "description" not in data:
        return jsonify({"message": "Name and description are required"}), 400

    course = Course(
        name=data["name"],
        description=data["description"],
        professor_id=professor_id,
        status="PENDING"
    )

    db.session.add(course)
    db.session.commit()

    # WebSocket notifikacija adminu
    socketio.emit("new_course_request", {
        "course_id": course.id,
        "course_name": course.name
    })

    return jsonify({"message": "Request sent"}), 201


def approve_course(course_id):
    course = Course.query.get(course_id)

    if not course:
        return jsonify({"message": "Course not found"}), 404

    course.status = "APPROVED"
    db.session.commit()

    send_email(
        "Course approved",
        f"Your course '{course.name}' was approved"
    )

    return jsonify({"message": "Approved"}), 200


def reject_course(course_id):
    course = Course.query.get(course_id)

    if not course:
        return jsonify({"message": "Course not found"}), 404

    course.status = "REJECTED"
    db.session.commit()

    send_email(
        "Course rejected",
        f"Your course '{course.name}' was rejected"
    )

    return jsonify({"message": "Rejected"}), 200


def get_my_requests(professor_id):
    requests = Course.query.filter_by(professor_id=professor_id).all()

    data = [
        {
            "id": r.id,
            "name": r.name,
            "description": r.description,
            "status": r.status
        }
        for r in requests
    ]

    return jsonify(data), 200

