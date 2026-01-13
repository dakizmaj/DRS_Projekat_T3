from app import socketio

def notify_admin(data):
    socketio.emit("new_course_request", data)
