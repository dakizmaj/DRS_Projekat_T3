from flask import Blueprint, request, jsonify
from datetime import datetime
from app.models.tasks import Task
from app.models.course import Course
from app.extensions import db
from app.auth.decorators import login_required, role_required

task_bp = Blueprint("tasks", __name__, url_prefix="/tasks")

@task_bp.route("/create", methods=["POST"])
@login_required
@role_required("professor")
def create_task():
    data = request.json

    course = Course.query.get(data["course_id"])
    if not course:
        return jsonify({"error": "Course not found"}), 404

    # 🔴 KLJUČNA PROVERA PO SPECIFIKACIJI
    if course.professor_id != request.user_id:
        return jsonify({"error": "You are not the creator of this course"}), 403

    task = Task(
        title=data["title"],
        description=data["description"],
        deadline=datetime.fromisoformat(data["deadline"]),
        course_id=course.id
    )

    db.session.add(task)
    db.session.commit()

    return jsonify({"message": "Task created successfully"})
