from flask import Flask, jsonify
from flask_cors import CORS
from .extensions import db, socketio, mail, redis_client
from .routes.auth_routes import auth_bp
from .routes.user_routes import user_bp
from .routes.course_routes import course_bp


def create_app():
    app = Flask(__name__)
    CORS(app)

    # --- Konfiguracija baze ---
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///drs.db"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # --- Konfiguracija mail-a ---
    app.config["MAIL_SERVER"] = "smtp.gmail.com"
    app.config["MAIL_PORT"] = 587
    app.config["MAIL_USE_TLS"] = True
    app.config["MAIL_USERNAME"] = "yourmail@gmail.com"
    app.config["MAIL_PASSWORD"] = "yourpassword"

    # --- Secret key za sesije ---
    app.secret_key = "super-secret-key"

    # --- Inicijalizacija ekstenzija ---
    db.init_app(app)
    mail.init_app(app)
    socketio.init_app(app)

    # --- Registracija blueprint-ova ---
    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(user_bp, url_prefix="/users")
    app.register_blueprint(course_bp, url_prefix="/courses")

    # --- Dodavanje test GET rute za browser ---
    @app.route("/", methods=["GET"])
    def home():
        return jsonify({"message": "Backend radi!"})

    # --- Kreiranje svih tabela u bazi ---
    with app.app_context():
        db.create_all()

    return app
