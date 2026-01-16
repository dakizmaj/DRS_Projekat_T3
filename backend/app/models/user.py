from app import db
from werkzeug.security import generate_password_hash


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)

    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)

    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)

    role = db.Column(db.String(20), nullable=False)  # admin, professor, student

    date_of_birth = db.Column(db.Date, nullable=False)
    gender = db.Column(db.String(10), nullable=False)

    country = db.Column(db.String(50))
    street = db.Column(db.String(100))
    street_number = db.Column(db.String(10))

    profile_image = db.Column(db.String(255))

    def set_password(self, raw_password):
        self.password = generate_password_hash(raw_password)
