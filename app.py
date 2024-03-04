import os

from cs50 import SQL
from flask import Flask, flash, redirect, render_template, request, session, jsonify
from flask_session import Session
from werkzeug.security import check_password_hash, generate_password_hash

from helpers import apology, login_required, usd

# Configure application
app = Flask(__name__, static_folder='static')

# # Custom filter
# app.jinja_env.filters["usd"] = usd

# Configure session to use filesystem (instead of signed cookies)
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
app.config["TEMPLATES_AUTO_RELOAD"] = True
Session(app)

# Configure CS50 Library to use SQLite database
db = SQL("sqlite:///finances.db")

@app.after_request
def after_request(response):
    """Ensure responses aren't cached"""
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Expires"] = 0
    response.headers["Pragma"] = "no-cache"
    return response

@app.route("/")
@login_required
def index():
    return render_template('index.html')

@app.route("/login", methods=["GET", "POST"])
def login():
    """Log user in"""

    # Forget any user_id
    session.clear()

    # User reached route via POST (as by submitting a form via POST)
    if request.method == "POST":
        # Ensure username was submitted
        if not request.form.get("username"):
            return jsonify({"success": False, "message": "Please enter username"}), 403


        # Ensure password was submitted
        elif not request.form.get("password"):
            return jsonify({"success": False, "message": "Please enter password"}), 403

        # Query database for username
        rows = db.execute(
            "SELECT * FROM users WHERE username = ?", request.form.get("username")
        )

        # Ensure username exists and password is correct
        if len(rows) != 1 or not check_password_hash(
            rows[0]["hash"], request.form.get("password")
        ):
            jsonify({"success": False, "message": "invalid username and/or password"}), 403

        # Remember which user has logged in
        session["user_id"] = rows[0]["id"]

        # Return success message
        return jsonify({"success": True}), 200

    # User reached route via GET (as by clicking a link or via redirect)
    else:
        return render_template("login.html")


@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == 'POST':
        username = request.form.get('username')
        if not username:
            return jsonify({"success": False, "message": "Must provide username"}), 400
        
         # Query the database to check if the username already exists
        existing_user = db.execute("SELECT * FROM users WHERE username = ?", (username,))
        
        if existing_user:
            return jsonify({"success": False, "message": "Username already exists"}), 400
        
        # TODO password validation
        confirmation = request.form.get('password')
        if not confirmation:
            return jsonify({"success": False, "message": "Please choose a password"}), 400
        
        deposit_amount = request.form.get('deposit')

        if not deposit_amount:
            return jsonify({"success": False, "message": "Please deposit amount"}), 400
        
        try:
            deposit_amount = float(deposit_amount)
            if deposit_amount <= 0:
                return jsonify({"success": False, "message": "Deposit amount must be greater than zero"}), 400
        except ValueError:
            return jsonify({"success": False, "message": "Deposit amount must be a valid number"}), 400
        
        hashed_password = generate_password_hash(confirmation)
        
        try:
            db.execute("INSERT INTO users (username, hash, cash) VALUES (?, ?, ?)", username, hashed_password, deposit_amount)
            return jsonify({"success": True}), 200
        except Exception as e:
            print("Database Error:", e)
            return jsonify({"success": False, "message": "An error occurred while registering"}), 500
        

    else:
        # If it's a GET request, just return the registration page
        return render_template('register.html')

