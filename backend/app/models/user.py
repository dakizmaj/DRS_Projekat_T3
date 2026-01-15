from app import db

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)

    ime = db.Column(db.String(100), nullable=False)
    prezime = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)

    password_hash = db.Column(db.String(255), nullable=False)

    uloga = db.Column(db.String(20), nullable=False)  # admin, profesor, student

    datum_rodjenja = db.Column(db.Date, nullable=False)
    pol = db.Column(db.String(10), nullable=False)
    drzava = db.Column(db.String(100), nullable=False)
    ulica = db.Column(db.String(150), nullable=False)
    broj = db.Column(db.String(20), nullable=False)

    profilna_slika = db.Column(db.String(255))
