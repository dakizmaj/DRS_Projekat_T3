from app import db
from datetime import datetime

class Submission(db.Model):
    __tablename__ = "submissions"

    id = db.Column(db.Integer, primary_key=True)
    
    task_id = db.Column(
        db.Integer,
        db.ForeignKey("tasks.id"),
        nullable=False
    )
    
    student_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False
    )
    
    file_path = db.Column(db.String(500), nullable=False)
    
    grade = db.Column(db.Integer, nullable=True)  # Ocena (npr. 1-10)
    comment = db.Column(db.Text, nullable=True)
    
    submitted_at = db.Column(db.DateTime, default=datetime.utcnow)
    graded_at = db.Column(db.DateTime, nullable=True)
    
    # Relationships
    task = db.relationship("Task", backref="submissions")
    student = db.relationship("User", backref="submissions")
    
    # Unique constraint - student može predati samo jedno rešenje po zadatku
    __table_args__ = (
        db.UniqueConstraint('task_id', 'student_id', name='unique_task_student'),
    )
