from app import create_app
from app.extensions import db
from app.models.user import User

app = create_app()
# baza u mysql
# create database drs_db
with app.app_context():
    db.create_all()

    def add_user(ime, prezime, email, password, uloga):
        if not User.query.filter_by(email=email).first():
            u = User(ime=ime, prezime=prezime, email=email, password=password, uloga=uloga)
            db.session.add(u)
            print(f"Added user: {email} ({uloga})")
        else:
            print(f"User exists: {email}")

    add_user('Admin', 'Istrator', 'admin@example.com', 'Password123', 'ADMIN')
    add_user('Petar', 'Profesor', 'prof@example.com', 'Password123', 'PROFESOR')
    add_user('Jovan', 'Student', 'student@example.com', 'Password123', 'STUDENT')

    db.session.commit()

    print('Seeding complete')
