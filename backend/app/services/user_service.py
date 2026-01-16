from app import db
from app.models.user import User
from datetime import datetime


def create_user(data):
    # Provera da li email već postoji
    if User.query.filter_by(email=data["email"]).first():
        raise ValueError("Email already exists")
    
    # Kreiranje novog korisnika
    user = User(
        first_name=data["first_name"],
        last_name=data["last_name"],
        email=data["email"],
        role=data["role"],
        date_of_birth=datetime.strptime(data["date_of_birth"], "%Y-%m-%d"),
        gender=data["gender"],
        country=data.get("country"),
        street=data.get("street"),
        street_number=data.get("street_number")
    )

    user.set_password(data["password"])

    db.session.add(user)
    db.session.commit()

    return user


def get_all_users():
    return User.query.all()


def delete_user(user_id):
    user = User.query.get(user_id)
    if user:
        db.session.delete(user)
        db.session.commit()
        return True
    return False


def update_user(user, data):
    for field in [
        "first_name", "last_name", "email", "gender",
        "country", "street", "street_number"
    ]:
        if field in data:
            setattr(user, field, data[field])

    db.session.commit()
    return user
