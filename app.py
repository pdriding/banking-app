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
# @login_required
def index():
    return render_template('index.html')

@app.route("/login", methods=["GET", "POST"])
def login():
    return render_template("login.html")


@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == 'POST':
        username = request.form.get('username')
        if not username:
            return jsonify({"success": False, "message": "Must provide username"}), 400
        
        confirmation = request.form.get('password')
        if not confirmation:
            return jsonify({"success": False, "message": "Please choose a password"}), 400
        
        deposit_amount = request.form.get('deposit')
        if not deposit_amount:
            return jsonify({"success": False, "message": "Please deposit amount"}), 400
        
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

