from app import db
from app.models.course import Course
from app.models.enrollment import Enrollment
from app.models.user import User
import os


def create_course_request(data, professor_id):
    course = Course(
        name=data["name"],
        description=data["description"],
        professor_id=professor_id,
        status="pending"
    )
    db.session.add(course)
    db.session.commit()
    return course


def get_pending_courses():
    return Course.query.filter_by(status="pending").all()


def approve_course(course_id):
    course = Course.query.get(course_id)
    if course:
        course.status = "accepted"
        db.session.commit()
        
        # Pošalji email profesoru
        from app.services.mail_service import send_email
        professor = User.query.get(course.professor_id)
        if professor:
            subject = f"Kurs '{course.name}' je odobren"
            body = f"""Poštovani {professor.first_name} {professor.last_name},

Vaš zahtev za kreiranje kursa '{course.name}' je odobren od strane administratora.

Sada možete upravljati kursom, dodavati studente, kreirati zadatke i okačiti materijale.

Srdačan pozdrav,
DRS Platforma Tim"""
            send_email(subject, body, professor.email)
    
    return course


def reject_course(course_id):
    course = Course.query.get(course_id)
    if course:
        course.status = "rejected"
        db.session.commit()
        
        # Pošalji email profesoru
        from app.services.mail_service import send_email
        professor = User.query.get(course.professor_id)
        if professor:
            subject = f"Kurs '{course.name}' je odbijen"
            body = f"""Poštovani {professor.first_name} {professor.last_name},

Vaš zahtev za kreiranje kursa '{course.name}' je odbijen od strane administratora.

Molimo kontaktirajte administratora za dodatne informacije.

Srdačan pozdrav,
DRS Platforma Tim"""
            send_email(subject, body, professor.email)
    
    return course


def get_professor_courses(professor_id):
    return Course.query.filter_by(professor_id=professor_id).all()


def get_course_by_id(course_id):
    return Course.query.get(course_id)


def update_course(course_id, data):
    course = Course.query.get(course_id)
    if course:
        if 'name' in data:
            course.name = data['name']
        if 'description' in data:
            course.description = data['description']
        db.session.commit()
    return course


def delete_course(course_id):
    course = Course.query.get(course_id)
    if course:
        # Prvo obriši sve enrollmente
        Enrollment.query.filter_by(course_id=course_id).delete()
        
        # Obriši sve zadatke i submissions
        from app.models.task import Task
        from app.models.submission import Submission
        tasks = Task.query.filter_by(course_id=course_id).all()
        for task in tasks:
            Submission.query.filter_by(task_id=task.id).delete()
            db.session.delete(task)
        
        # Obriši kurs
        db.session.delete(course)
        db.session.commit()
        return True
    return False


def enroll_student(course_id, student_ids):
    count = 0
    for student_id in student_ids:
        # Proveri da li student postoji
        student = User.query.filter_by(id=student_id, role='student').first()
        if not student:
            continue
        
        # Proveri da li je već upisan
        existing = Enrollment.query.filter_by(
            course_id=course_id,
            student_id=student_id
        ).first()
        
        if existing:
            continue
        
        enrollment = Enrollment(
            course_id=course_id,
            student_id=student_id
        )
        db.session.add(enrollment)
        count += 1
    
    db.session.commit()
    return count


def get_course_students(course_id):
    enrollments = Enrollment.query.filter_by(course_id=course_id).all()
    return [e.student for e in enrollments]


def upload_course_material(course_id, file, filename):
    upload_dir = os.path.join('uploads', 'materials')
    os.makedirs(upload_dir, exist_ok=True)
    
    # Dodaj course_id u ime fajla da bude jedinstveno
    file_path = os.path.join(upload_dir, f"{course_id}_{filename}")
    file.save(file_path)
    
    # Ažuriraj course sa putanjom do materijala
    course = Course.query.get(course_id)
    if course:
        course.material_path = file_path
        db.session.commit()
    
    return file_path
