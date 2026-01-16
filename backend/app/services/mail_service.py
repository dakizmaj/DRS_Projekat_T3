from multiprocessing import Process
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os


def _send_async(subject, body, recipient, mail_username, mail_password, mail_server, mail_port):
    """Asinhrono slanje emaila u posebnom procesu"""
    try:
        msg = MIMEMultipart()
        msg['From'] = mail_username
        msg['To'] = recipient
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'plain'))

        server = smtplib.SMTP(mail_server, mail_port)
        server.starttls()
        server.login(mail_username, mail_password)
        server.send_message(msg)
        server.quit()
        print(f"Email poslat: {recipient} - {subject}")
    except Exception as e:
        print(f"Greška pri slanju emaila: {e}")


def send_email(recipient, subject, body):
    """Šalje email korišćenjem multiprocessing Process"""
    mail_username = os.environ.get("MAIL_USERNAME")
    mail_password = os.environ.get("MAIL_PASSWORD")
    mail_server = os.environ.get("MAIL_SERVER", "smtp.gmail.com")
    mail_port = int(os.environ.get("MAIL_PORT", 587))
    
    if not mail_username or not mail_password:
        print(f"Email konfiguracija nije podešena! Simulacija slanja: {recipient} - {subject}")
        return

    process = Process(
        target=_send_async,
        args=(subject, body, recipient, mail_username, mail_password, mail_server, mail_port)
    )
    process.start()
