from app import db
from werkzeug.security import generate_password_hash, check_password_hash
from app.extensions import db



class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)

    ime = db.Column(db.String(50), nullable=False)
    prezime = db.Column(db.String(50), nullable=False)

    email = db.Column(db.String(120), unique=True, nullable=False)

    password = db.Column(db.String(255), nullable=False)

    uloga = db.Column(db.String(20), nullable=False)  # ADMIN, PROFESOR, STUDENT

    datum_rodjenja = db.Column(db.String(20), nullable=True)
    pol = db.Column(db.String(10), nullable=True)

    drzava = db.Column(db.String(50), nullable=True)
    ulica = db.Column(db.String(100), nullable=True)
    broj = db.Column(db.String(20), nullable=True)

    profile_image = db.Column(db.String(255), nullable=True)

    def __init__(
        self,
        ime,
        prezime,
        email,
        password,
        uloga,
        datum_rodjenja=None,
        pol=None,
        drzava=None,
        ulica=None,
        broj=None
    ):
        self.ime = ime
        self.prezime = prezime
        self.email = email
        self.set_password(password)
        self.uloga = uloga
        self.datum_rodjenja = datum_rodjenja
        self.pol = pol
        self.drzava = drzava
        self.ulica = ulica
        self.broj = broj

    def set_password(self, raw_password):
        self.password = generate_password_hash(raw_password)

    def check_password(self, raw_password):
        return check_password_hash(self.password, raw_password)

    def to_dict(self):
        return {
            "id": self.id,
            "ime": self.ime,
            "prezime": self.prezime,
            "email": self.email,
            "uloga": self.uloga,
            "datum_rodjenja": self.datum_rodjenja,
            "pol": self.pol,
            "drzava": self.drzava,
            "ulica": self.ulica,
            "broj": self.broj,
            "profile_image": self.profile_image
        }
