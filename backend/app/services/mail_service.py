from flask_mail import Message
from multiprocessing import Process
from ..extensions import mail
from flask import current_app


def _send_async(app, msg):
    with app.app_context():
        mail.send(msg)


def send_email(subject, body):
    app = current_app._get_current_object()

    msg = Message(
        subject=subject,
        recipients=["professor@mail.com"],
        body=body
    )

    process = Process(target=_send_async, args=(app, msg))
    process.start()
