 from flask import Blueprint, request, jsonify
from datetime import datetime
from app.extensions import db
from app.models.task import Task
from app.models.course import Course
from app.auth.decorators import login_required

task_bp = Blueprint("tasks", __name__, url_prefix="/courses")

@task_bp.route("/<int:course_id>/tasks", methods=["POST"])
@login_required(role="professor")
def create_task(course_id):
    data = request.json

    if not all(k in data for k in ("title", "description", "deadline")):
        return jsonify({"message": "Sva polja su obavezna"}), 400

    course = Course.query.get(course_id)
    if not course:
        return jsonify({"message": "Kurs ne postoji"}), 404

    if course.professor_id != request.user.id:
        return jsonify({"message": "Nemate pravo da dodate zadatak"}), 403

    task = Task(
        title=data["title"],
        description=data["description"],
        deadline=datetime.fromisoformat(data["deadline"]),
        course_id=course_id
    )

    db.session.add(task)
    db.session.commit()

    return jsonify({"message": "Zadatak uspešno dodat"}), 201
