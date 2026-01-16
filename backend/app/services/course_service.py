from app import db
from app.models.course import Course


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
    return course


def reject_course(course_id):
    course = Course.query.get(course_id)
    if course:
        course.status = "rejected"
        db.session.commit()
    return course


def get_professor_courses(professor_id):
    return Course.query.filter_by(professor_id=professor_id).all()
