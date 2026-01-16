from app import create_app
from app.extensions import db
from app.models.user import User
from app.models.course import Course
from app.models.task import Task
from werkzeug.security import generate_password_hash

app = create_app()

with app.app_context():
    db.drop_all()
    db.create_all()

    # --- KORISNICI ---

    admin = User(
        first_name="Admin",
        last_name="User",
        email="admin@test.com",
        password=generate_password_hash("admin123"),
        role="admin",
        date_of_birth="1990-01-01",
        gender="M",
        country="Serbia",
        street="Admin Street",
        street_number="1"
    )

    professor = User(
        first_name="Petar",
        last_name="Profesor",
        email="prof@test.com",
        password=generate_password_hash("prof123"),
        role="professor",
        date_of_birth="1985-05-05",
        gender="M",
        country="Serbia",
        street="Professor Street",
        street_number="10"
    )

    student1 = User(
        first_name="Marko",
        last_name="Student",
        email="student@test.com",
        password=generate_password_hash("student123"),
        role="student",
        date_of_birth="2000-03-03",
        gender="M",
        country="Serbia",
        street="Student Street",
        street_number="20"
    )

    student2 = User(
        first_name="Ana",
        last_name="Student",
        email="student2@test.com",
        password=generate_password_hash("student123"),
        role="student",
        date_of_birth="2001-04-04",
        gender="F",
        country="Serbia",
        street="Student Street",
        street_number="21"
    )

    db.session.add_all([admin, professor, student1, student2])
    db.session.commit()

    # --- ZAHTEVI ZA KURSEVE ---

    # Pending kurs (da admin može da ga odobri)
    pending_course = Course(
        name="Distribuirani računarski sistemi",
        description="Uvod u DRS",
        professor_id=professor.id,
        status="pending"
    )

    # Već prihvaćen kurs
    accepted_course = Course(
        name="Python Programming",
        description="Osnove Python programiranja",
        professor_id=professor.id,
        status="accepted"
    )

    # Odbijen kurs
    rejected_course = Course(
        name="Web Development",
        description="React i Flask osnove",
        professor_id=professor.id,
        status="rejected"
    )

    db.session.add_all([pending_course, accepted_course, rejected_course])
    db.session.commit()

    # --- DODAVANJE STUDENATA NA PRIHVAĆEN KURS ---

    try:
        accepted_course.students.append(student1)
        accepted_course.students.append(student2)
        db.session.commit()
    except:
        print("Napomena: Povezivanje studenata i kursa nije dodato jer model možda nema relaciju students")

    # --- KREIRANJE ZADATKA ZA KURS ---

    try:
        task1 = Task(
            title="Prvi zadatak",
            description="Implementirati jednostavan Python program",
            deadline="2025-06-01",
            course_id=accepted_course.id
        )

        db.session.add(task1)
        db.session.commit()
    except:
        print("Napomena: Task model ili relacija možda još nije implementirana")

    print("Seed data successfully created!")
    print("--------------------------------------------------")
    print("Korisnici:")
    print("Admin -> admin@test.com / admin123")
    print("Profesor -> prof@test.com / prof123")
    print("Student -> student@test.com / student123")
    print("Student2 -> student2@test.com / student123")
    print("--------------------------------------------------")
