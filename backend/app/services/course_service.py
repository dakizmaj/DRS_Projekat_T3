from flask import jsonify
from app.utils.auth import get_current_user
from app.services.websocket_service import notify_admin

# MOCK baza zahteva
COURSE_REQUESTS = []

def create_course_request(data):
    current_user = get_current_user()

    request_data = {
        "id": len(COURSE_REQUESTS) + 1,
        "profesor_id": current_user["user_id"],
        "naziv": data["naziv"],
        "opis": data["opis"],
        "status": "PENDING"
    }

    COURSE_REQUESTS.append(request_data)

    # 🔴 WebSocket – obaveštava admina
    notify_admin(request_data)

    return jsonify(request_data), 201


def get_course_requests():
    current_user = get_current_user()
    my_requests = [
        r for r in COURSE_REQUESTS
        if r["profesor_id"] == current_user["user_id"]
    ]
    return jsonify(my_requests), 200


def process_course_request(req_id, data):
    for r in COURSE_REQUESTS:
        if r["id"] == req_id:
            r["status"] = data.get("status")  # APPROVED / REJECTED
            return jsonify(r), 200

    return jsonify({"message": "Request not found"}), 404

