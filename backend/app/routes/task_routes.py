from flask import Blueprint, request, jsonify
from app.auth.decorators import login_required, role_required
from app.services.task_service import (
    create_task,
    get_course_tasks,
    update_task,
    delete_task,
    get_task_by_id
)
from app.services.course_service import get_course_by_id

task_bp = Blueprint("tasks", __name__)


# =========================
# PROFESOR → kreira zadatak za kurs
# =========================
@task_bp.route("/", methods=["POST"])
@login_required
@role_required("professor")
def create():
    data = request.json
    
    if not data or "title" not in data or "description" not in data or "deadline" not in data or "course_id" not in data:
        return jsonify({"message": "Invalid data"}), 400
    
    course = get_course_by_id(data["course_id"])
    
    if not course:
        return jsonify({"message": "Course not found"}), 404
    
    if course.professor_id != request.user.id:
        return jsonify({"message": "Forbidden"}), 403
    
    task = create_task(data)
    
    # TODO: Poslati email svim studentima na kursu
    
    return jsonify({
        "message": "Task created",
        "task_id": task.id
    }), 201


# =========================
# PROFESOR → lista zadataka za kurs
# =========================
@task_bp.route("/course/<int:course_id>", methods=["GET"])
@login_required
def list_by_course(course_id):
    course = get_course_by_id(course_id)
    
    if not course:
        return jsonify({"message": "Course not found"}), 404
    
    tasks = get_course_tasks(course_id)
    return jsonify([
        {
            "id": t.id,
            "title": t.title,
            "description": t.description,
            "deadline": str(t.deadline),
            "course_id": t.course_id
        } for t in tasks
    ]), 200


# =========================
# PROFESOR → menja zadatak
# =========================
@task_bp.route("/<int:task_id>", methods=["PUT"])
@login_required
@role_required("professor")
def update(task_id):
    task = get_task_by_id(task_id)
    
    if not task:
        return jsonify({"message": "Task not found"}), 404
    
    course = get_course_by_id(task.course_id)
    
    if course.professor_id != request.user.id:
        return jsonify({"message": "Forbidden"}), 403
    
    data = request.json
    updated_task = update_task(task_id, data)
    
    return jsonify({
        "message": "Task updated",
        "task": {
            "id": updated_task.id,
            "title": updated_task.title,
            "description": updated_task.description,
            "deadline": str(updated_task.deadline)
        }
    }), 200


# =========================
# PROFESOR → briše zadatak
# =========================
@task_bp.route("/<int:task_id>", methods=["DELETE"])
@login_required
@role_required("professor")
def delete(task_id):
    task = get_task_by_id(task_id)
    
    if not task:
        return jsonify({"message": "Task not found"}), 404
    
    course = get_course_by_id(task.course_id)
    
    if course.professor_id != request.user.id:
        return jsonify({"message": "Forbidden"}), 403
    
    delete_task(task_id)
    return jsonify({"message": "Task deleted"}), 200
