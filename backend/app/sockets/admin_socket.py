from flask_socketio import emit
from app.extensions import socketio


@socketio.on("connect", namespace="/admin")
def admin_connect():
    emit("connected", {"message": "Admin connected"})


def notify_new_course(course_name, professor_email):
    socketio.emit(
        "new_course_request",
        {
            "course_name": course_name,
            "professor": professor_email
        },
        namespace="/admin"
    )
