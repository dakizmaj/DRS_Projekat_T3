from flask_mail import Message
from ..extensions import mail

def send_email(subject, body):
    msg = Message(subject=subject, recipients=["professor@mail.com"], body=body)
    mail.send(msg)
