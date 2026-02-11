from app import db

class Course(db.Model):
    __tablename__ = "courses"

    id = db.Column(db.Integer, primary_key=True)

    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    
    material_path = db.Column(db.String(500), nullable=True)  # PDF materijal
    material_name = db.Column(db.String(255), nullable=True)  # Originalno ime fajla

    status = db.Column(
        db.String(20),
        nullable=False,
        default="pending"  # pending, accepted, rejected
    )

    professor_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False
    )

    professor = db.relationship("User", backref="courses")
