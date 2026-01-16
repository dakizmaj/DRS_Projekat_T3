from flask import Blueprint, request, jsonify
from app.auth.decorators import login_required, role_required
from app.services.course_service import (
    create_course_request,
    get_pending_courses,
    approve_course,
    reject_course,
    get_professor_courses,
    update_course,
    delete_course,
    get_course_by_id,
    enroll_student,
    get_course_students,
    upload_course_material
)
from app.sockets.admin_socket import notify_new_course
from werkzeug.utils import secure_filename
import os


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
            "description": c.description,
            "status": c.status,
            "material_path": c.material_path
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


# =========================
# PROFESOR → menja informacije o kursu
# =========================
@course_bp.route("/<int:course_id>", methods=["PUT"])
@login_required
@role_required("professor")
def update(course_id):
    course = get_course_by_id(course_id)
    
    if not course:
        return jsonify({"message": "Course not found"}), 404
    
    if course.professor_id != request.user.id:
        return jsonify({"message": "Forbidden"}), 403
    
    data = request.json
    updated_course = update_course(course_id, data)
    
    return jsonify({
        "message": "Course updated",
        "course": {
            "id": updated_course.id,
            "name": updated_course.name,
            "description": updated_course.description
        }
    }), 200


# =========================
# PROFESOR → briše kurs
# =========================
@course_bp.route("/<int:course_id>", methods=["DELETE"])
@login_required
@role_required("professor")
def delete(course_id):
    course = get_course_by_id(course_id)
    
    if not course:
        return jsonify({"message": "Course not found"}), 404
    
    if course.professor_id != request.user.id:
        return jsonify({"message": "Forbidden"}), 403
    
    delete_course(course_id)
    return jsonify({"message": "Course deleted"}), 200


# =========================
# PROFESOR → dodaje studente na kurs
# =========================
@course_bp.route("/<int:course_id>/enroll", methods=["POST"])
@login_required
@role_required("professor")
def enroll(course_id):
    course = get_course_by_id(course_id)
    
    if not course:
        return jsonify({"message": "Course not found"}), 404
    
    if course.professor_id != request.user.id:
        return jsonify({"message": "Forbidden"}), 403
    
    data = request.json
    student_ids = data.get("student_ids", [])
    
    if not student_ids:
        return jsonify({"message": "No students provided"}), 400
    
    enrolled = enroll_student(course_id, student_ids)
    return jsonify({
        "message": f"Enrolled {enrolled} students",
        "count": enrolled
    }), 200


# =========================
# PROFESOR → lista studenata na kursu
# =========================
@course_bp.route("/<int:course_id>/students", methods=["GET"])
@login_required
@role_required("professor")
def list_students(course_id):
    course = get_course_by_id(course_id)
    
    if not course:
        return jsonify({"message": "Course not found"}), 404
    
    if course.professor_id != request.user.id:
        return jsonify({"message": "Forbidden"}), 403
    
    students = get_course_students(course_id)
    return jsonify([
        {
            "id": s.id,
            "first_name": s.first_name,
            "last_name": s.last_name,
            "email": s.email
        } for s in students
    ]), 200


# =========================
# PROFESOR → okači PDF materijal
# =========================
@course_bp.route("/<int:course_id>/material", methods=["POST"])
@login_required
@role_required("professor")
def upload_material(course_id):
    course = get_course_by_id(course_id)
    
    if not course:
        return jsonify({"message": "Course not found"}), 404
    
    if course.professor_id != request.user.id:
        return jsonify({"message": "Forbidden"}), 403
    
    if 'file' not in request.files:
        return jsonify({"message": "No file provided"}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({"message": "No file selected"}), 400
    
    if not file.filename.endswith('.pdf'):
        return jsonify({"message": "Only PDF files allowed"}), 400
    
    filename = secure_filename(file.filename)
    file_path = upload_course_material(course_id, file, filename)
    
    return jsonify({
        "message": "Material uploaded",
        "file_path": file_path
    }), 200


# =========================
# PROFESOR/STUDENT → download materijala
# =========================
@course_bp.route("/<int:course_id>/material/download", methods=["GET"])
@login_required
def download_material(course_id):
    from flask import send_file
    course = get_course_by_id(course_id)
    
    if not course:
        return jsonify({"message": "Course not found"}), 404
    
    if not course.material_path:
        return jsonify({"message": "No material uploaded"}), 404
    
    # Proveri da li je user profesor ili upisan student
    if request.user.role == 'professor' and course.professor_id != request.user.id:
        return jsonify({"message": "Forbidden"}), 403
    
    if request.user.role == 'student':
        from app.models.enrollment import Enrollment
        enrollment = Enrollment.query.filter_by(
            course_id=course_id,
            student_id=request.user.id
        ).first()
        if not enrollment:
            return jsonify({"message": "Not enrolled in this course"}), 403
    
    file_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), course.material_path)
    
    if not os.path.exists(file_path):
        return jsonify({"message": "File not found"}), 404
    
    return send_file(file_path, as_attachment=True)
