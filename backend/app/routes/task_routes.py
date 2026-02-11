from flask import Blueprint, request, jsonify, send_file
from app.auth.decorators import login_required, role_required
from app.services.task_service import (
    create_task,
    get_course_tasks,
    update_task,
    delete_task,
    get_task_by_id
)
from app.services.course_service import get_course_by_id
from app.services.mail_service import send_email
from app.models.enrollment import Enrollment
from app import db
from datetime import datetime
from app.models.task import Task

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
    
    # Pošalji email svim studentima na kursu
    enrollments = Enrollment.query.filter_by(course_id=course.id).all()
    
    for enrollment in enrollments:
        student = enrollment.student
        if student.email:
            subject = f"Nov zadatak u kursu: {course.name}"
            body = f"""
Poštovani {student.first_name} {student.last_name},

Obaveštavamo Vas da je profesor {request.user.first_name} {request.user.last_name} dodao novi zadatak u kursu "{course.name}".

Naziv zadatka: {task.title}
Opis: {task.description}
Krajnji rok: {task.deadline.strftime('%d.%m.%Y %H:%M') if task.deadline else 'Nije određen'}

Molimo Vas da zadatak uradite na vreme.

Srdačan pozdrav,
Sistem za upravljanje kursevima
            """
            send_email(student.email, subject, body)
    
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


# =========================
# STUDENT → uploaduje submission (.py fajl)
# =========================
@task_bp.route("/<int:task_id>/submit", methods=["POST"])
@login_required
@role_required("student")
def submit_task(task_id):
    from werkzeug.utils import secure_filename
    import os
    
    task = get_task_by_id(task_id)
    
    if not task:
        return jsonify({"message": "Task not found"}), 404
    
    # Proveri da li je student upisan na kurs
    from app.models.enrollment import Enrollment
    enrollment = Enrollment.query.filter_by(
        course_id=task.course_id,
        student_id=request.user.id
    ).first()
    
    if not enrollment:
        return jsonify({"message": "Not enrolled in this course"}), 403
    
    if 'file' not in request.files:
        return jsonify({"message": "No file provided"}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({"message": "No file selected"}), 400
    
    if not file.filename.endswith('.py'):
        return jsonify({"message": "Only .py files allowed"}), 400
    
    # Sačuvaj fajl sa UUID-om za jedinstveno ime
    import uuid
    file_ext = '.py'
    filename = f"{request.user.id}_{task_id}_{uuid.uuid4().hex}{file_ext}"
    upload_folder = os.path.join('uploads', 'submissions', str(task_id))
    os.makedirs(upload_folder, exist_ok=True)
    
    file_path = os.path.join(upload_folder, filename)
    
    # Kreiraj ili ažuriraj submission
    from app.models.submission import Submission
    submission = Submission.query.filter_by(
        task_id=task_id,
        student_id=request.user.id
    ).first()
    
    if submission:
        # Obriši stari fajl ako postoji
        if submission.file_path and os.path.exists(submission.file_path):
            try:
                os.remove(submission.file_path)
            except:
                pass
        
        submission.file_path = file_path
        submission.submitted_at = datetime.now()
        submission.grade = None
        submission.comment = None
    else:
        submission = Submission(
            task_id=task_id,
            student_id=request.user.id,
            file_path=file_path
        )
        db.session.add(submission)
    
    file.save(file_path)
    db.session.commit()
    
    return jsonify({
        "message": "Submission uploaded successfully",
        "submission_id": submission.id
    }), 201


# =========================
# PROFESOR → vidi sve submissions za zadatak
# =========================
@task_bp.route("/<int:task_id>/submissions", methods=["GET"])
@login_required
@role_required("professor")
def get_submissions(task_id):
    task = get_task_by_id(task_id)
    
    if not task:
        return jsonify({"message": "Task not found"}), 404
    
    course = get_course_by_id(task.course_id)
    
    if course.professor_id != request.user.id:
        return jsonify({"message": "Forbidden"}), 403
    
    from app.models.submission import Submission
    from app.models.user import User
    
    submissions = Submission.query.filter_by(task_id=task_id).all()
    
    return jsonify([
        {
            "id": s.id,
            "student": {
                "id": s.student.id,
                "first_name": s.student.first_name,
                "last_name": s.student.last_name,
                "email": s.student.email,
                "profile_image": s.student.profile_image
            },
            "file_path": s.file_path,
            "submitted_at": str(s.submitted_at) if s.submitted_at else None,
            "grade": s.grade,
            "feedback": s.comment
        } for s in submissions
    ]), 200


# =========================
# PROFESOR → ocenjuje submission
# =========================
@task_bp.route("/submissions/<int:submission_id>/grade", methods=["POST"])
@login_required
@role_required("professor")
def grade_submission(submission_id):
    from app.models.submission import Submission
    
    submission = Submission.query.get(submission_id)
    
    if not submission:
        return jsonify({"message": "Submission not found"}), 404
    
    task = get_task_by_id(submission.task_id)
    course = get_course_by_id(task.course_id)
    
    if course.professor_id != request.user.id:
        return jsonify({"message": "Forbidden"}), 403
    
    data = request.json
    
    if 'grade' not in data:
        return jsonify({"message": "Grade is required"}), 400
    
    submission.grade = data['grade']
    submission.comment = data.get('feedback', '')
    
    db.session.commit()
    
    # Pošalji email studentu o oceni
    student = submission.student
    if student.email:
        subject = f"Ocenjen zadatak: {task.title}"
        body = f"""
Poštovani {student.first_name} {student.last_name},

Obaveštavamo Vas da je profesor {request.user.first_name} {request.user.last_name} ocenio Vaš rad na zadatku "{task.title}" iz kursa "{course.name}".

Ocena: {submission.grade}
{'Povratna informacija: ' + submission.comment if submission.comment else ''}

Srdačan pozdrav,
Sistem za upravljanje kursevima
        """
        send_email(student.email, subject, body)
    
    return jsonify({
        "message": "Submission graded",
        "submission": {
            "id": submission.id,
            "grade": submission.grade,
            "feedback": submission.comment
        }
    }), 200


# =========================
# STUDENT → vidi svoje zadatke za sve kurseve
# =========================
@task_bp.route("/my", methods=["GET"])
@login_required
@role_required("student")
def my_tasks():
    from app.models.enrollment import Enrollment
    from app.models.submission import Submission
    
    # Pronađi sve kurseve u kojima je student upisan
    enrollments = Enrollment.query.filter_by(student_id=request.user.id).all()
    course_ids = [e.course_id for e in enrollments]
    
    # Pronađi sve zadatke za te kurseve
    tasks = Task.query.filter(Task.course_id.in_(course_ids)).all()
    
    result = []
    for task in tasks:
        submission = Submission.query.filter_by(
            task_id=task.id,
            student_id=request.user.id
        ).first()
        
        result.append({
            "id": task.id,
            "title": task.title,
            "description": task.description,
            "deadline": str(task.deadline),
            "course_id": task.course_id,
            "course_name": task.course.name,
            "submission": {
                "id": submission.id,
                "submitted_at": str(submission.submitted_at) if submission.submitted_at else None,
                "grade": submission.grade,
                "feedback": submission.comment
            } if submission else None
        })
    
    return jsonify(result), 200


# =========================
# PROFESOR → download submission fajla
# =========================
@task_bp.route("/submissions/<int:submission_id>/download", methods=["GET"])
@login_required
@role_required("professor")
def download_submission(submission_id):
    import os
    from app.models.submission import Submission

    submission = Submission.query.get(submission_id)

    if not submission:
        return jsonify({"message": "Submission not found"}), 404

    task = get_task_by_id(submission.task_id)
    course = get_course_by_id(task.course_id)

    if course.professor_id != request.user.id:
        return jsonify({"message": "Forbidden"}), 403

    if not submission.file_path:
        return jsonify({"message": "File not found"}), 404
    
    # Konstruiši apsolutnu putanju do fajla
    file_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), submission.file_path)
    
    if not os.path.exists(file_path):
        return jsonify({"message": "File not found"}), 404

    filename = os.path.basename(submission.file_path)

    return send_file(
        file_path,
        as_attachment=True,
        download_name=f"{submission.student.first_name}_{submission.student.last_name}_{filename}"
    )
