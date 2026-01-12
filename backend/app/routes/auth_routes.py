@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json
    return login_user(data)

@auth_bp.route("/logout", methods=["POST"])
def logout():
    return logout_user()

