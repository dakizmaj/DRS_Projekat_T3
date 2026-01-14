from flask import jsonify
from app import db
from app.models.user import User
from app.utils.decorators import login_required, admin_required


def create_user(data):
    required_fields = ["ime", "prezime", "email", "password", "uloga"]

    for field in required_fields:
        if field not in data:
            return jsonify({"message": f"Field {field} is required"}), 400

    existing = User.query.filter_by(email=data["email"]).first()
    if existing:
        return jsonify({"message": "User with this email already exists"}), 400

    new_user = User(
        ime=data["ime"],
        prezime=data["prezime"],
        email=data["email"],
        password=data["password"],
        uloga=data["uloga"],
        datum_rodjenja=data.get("datum_rodjenja"),
        pol=data.get("pol"),
        drzava=data.get("drzava"),
        ulica=data.get("ulica"),
        broj=data.get("broj")
    )

    db.session.add(new_user)
    db.session.commit()

    return jsonify(new_user.to_dict()), 201


@admin_required
def get_all_users():
    users = User.query.all()
    users_data = [user.to_dict() for user in users]

    return jsonify(users_data), 200


@admin_required
def delete_user(user_id):
    user = User.query.get(user_id)

    if not user:
        return jsonify({"message": "User not found"}), 404

    db.session.delete(user)
    db.session.commit()

    return jsonify({"message": "User deleted"}), 200


@login_required
def update_profile(user_id, data):
    user = User.query.get(user_id)

    if not user:
        return jsonify({"message": "User not found"}), 404

    # Dozvoljena izmena samo sopstvenog profila
    from flask import request
    if request.user_id != user.id:
        return jsonify({"message": "Unauthorized"}), 403

    user.ime = data.get("ime", user.ime)
    user.prezime = data.get("prezime", user.prezime)
    user.email = data.get("email", user.email)
    user.datum_rodjenja = data.get("datum_rodjenja", user.datum_rodjenja)
    user.pol = data.get("pol", user.pol)
    user.drzava = data.get("drzava", user.drzava)
    user.ulica = data.get("ulica", user.ulica)
    user.broj = data.get("broj", user.broj)

    db.session.commit()

    return jsonify({
        "message": "Profile updated",
        "user": user.to_dict()
    }), 200
