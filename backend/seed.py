from app import create_app
from app.extensions import db
from app.models.user import User
from app.models.course import Course
from werkzeug.security import generate_password_hash

app = create_app()

with app.app_context():
    db.drop_all()
    db.create_all()

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
        number="1"
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
        number="10"
    )

    student = User(
        first_name="Marko",
        last_name="Student",
        email="student@test.com",
        password=generate_password_hash("student123"),
        role="student",
        date_of_birth="2000-03-03",
        gender="M",
        country="Serbia",
        street="Student Street",
        number="20"
    )

    db.session.add_all([admin, professor, student])
    db.session.commit()

    course = Course(
        name="Distribuirani računarski sistemi",
        description="Uvod u DRS",
        professor_id=professor.id,
        status="PENDING"
    )

    db.session.add(course)
    db.session.commit()

    print("✅ Seed data successfully created")
