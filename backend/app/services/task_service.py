from app import db
from app.models.task import Task
from datetime import datetime


def create_task(data):
    task = Task(
        title=data["title"],
        description=data["description"],
        deadline=datetime.fromisoformat(data["deadline"].replace('Z', '+00:00')),
        course_id=data["course_id"]
    )
    db.session.add(task)
    db.session.commit()
    return task


def get_course_tasks(course_id):
    return Task.query.filter_by(course_id=course_id).all()


def get_task_by_id(task_id):
    return Task.query.get(task_id)


def update_task(task_id, data):
    task = Task.query.get(task_id)
    if task:
        if 'title' in data:
            task.title = data['title']
        if 'description' in data:
            task.description = data['description']
        if 'deadline' in data:
            task.deadline = datetime.fromisoformat(data["deadline"].replace('Z', '+00:00'))
        db.session.commit()
    return task


def delete_task(task_id):
    task = Task.query.get(task_id)
    if task:
        db.session.delete(task)
        db.session.commit()
        return True
    return False
