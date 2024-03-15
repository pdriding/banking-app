import os

from cs50 import SQL
from flask import Flask, flash, redirect, render_template, request, session, jsonify,  url_for
from flask_session import Session
from werkzeug.security import check_password_hash, generate_password_hash
from datetime import date

from helpers import apology, login_required, usd

from password_validation import PASSWORD_REGEX
import re

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

@app.route("/get_user_data")
@login_required
def data():
    user_id = session['user_id']  
    user_data = db.execute("""
            SELECT 
                users.username,   
                balance.current_balance
            FROM users
            LEFT JOIN balance ON users.user_id = balance.user_id
            WHERE users.user_id = ?;
        """, user_id)
    # Convert user_data to a list of dictionaries
    user_data_list = [{
        'username': row['username'],
        'current_balance': row['current_balance'] if row['current_balance'] is not None else 0.0 
    } for row in user_data]
    return jsonify(user_data=user_data_list)

@app.route("/")
@login_required
def index():
    user_id = session['user_id']  
    user_data = db.execute("""
            SELECT 
                username
            FROM users
            WHERE user_id = ?;
        """, user_id)
    username = user_data[0]['username']
    session["username"] = username
    return render_template('index.html', username=username)

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
        
        if len(rows) == 0 or not check_password_hash(rows[0]["hash"], request.form.get("password")):
            return jsonify({"success": False, "message": "Invalid username and/or password"}), 403


        # Remember which user has logged in
        session["user_id"] = rows[0]["user_id"]

        # Return success message
        return jsonify({"success": True}), 200

    # User reached route via GET (as by clicking a link or via redirect)
    else:
        return render_template("login.html")
    

@app.route("/validate_password", methods=["POST"])
def validate_password():
        data = request.json
        username = data.get('username')
        password = data.get('password')
        confirmation = data.get('confirmation')
        if not username:
            return jsonify({"success": False, "message": "Must provide username"}), 400
        
         # Query the database to check if the username already exists
        existing_user = db.execute("SELECT * FROM users WHERE username = ?", (username,))
        
        if existing_user:
            return jsonify({"success": False, "message": "Username already exists"}), 400
        
        if not password:
            return jsonify({"success": False, "message": "Please enter a password"}), 400
        
        if not confirmation:
            return jsonify({"success": False, "message": "Please confirm password"}), 400
        
        if not re.match(PASSWORD_REGEX, confirmation):
            return jsonify({"success": False, "message": "Password must be more than 3 charachters"}), 400
        
        if password != confirmation:
            return jsonify({"success": False, "message": "Password and confirmation do not match"}), 400
        
            # If password validation is successful, return success message
        return jsonify({"success": True, "message": "Password validation successful"}), 200


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
        
        confirmation = request.form.get('confirmation')
        if not confirmation:
            return jsonify({"success": False, "message": "Please confrim password"}), 400
        
        if not re.match(PASSWORD_REGEX, confirmation):
            return jsonify({"success": False, "message": "Password must be more than 3 charachters"}), 400
        
        password = request.form.get('password')
        if not password:
            return jsonify({"success": False, "message": "Please choose a password"}), 400
        
        if password != confirmation:
            return jsonify({"success": False, "message": "Password and confirmation do not match"}), 400
        
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
            
            # Insert a new user into the users table
            db.execute("INSERT INTO users (username, hash) VALUES (?, ?)", username, hashed_password)
    
            # Retrieve the user_id of the newly inserted user
            user_query = db.execute("SELECT user_id FROM users WHERE username = ?", username)
            user_id = user_query[0]['user_id']
            if user_id:    
                # Insert the user's initial balance into the balance table
                # Assuming deposit_amount is previously defined
                db.execute("INSERT INTO balance (user_id, current_balance) VALUES (?, ?)", user_id, deposit_amount)
                db.execute("INSERT INTO transactions (user_id, transaction_type, transaction_date, transaction_amount) VALUES (?, ?, ?, ?)", user_id, "deposit", date.today(), deposit_amount)
            else:
                raise Exception("User not found after insertion into users table")
        except Exception as e:
            print("Balance Insertion Error:", e)
            # Rollback the transaction if an error occurs
            
            return jsonify({"success": False, "message": "An error occurred while inserting balance"}), 500

        return jsonify({"success": True}), 200

    else:
        # If it's a GET request, just return the registration page
        return render_template('register.html')
    

@app.route("/movements", methods=["GET"])
def movements():
    user_id = session['user_id']  
    user_movements = db.execute("""
            SELECT 
                transaction_id,   
                transaction_type,
                transaction_date,
                transaction_amount
            FROM transactions
            WHERE user_id = ?;
        """, user_id)
    # Convert user_data to a list of dictionaries
    user_movements_list = [{
        'transaction_id': row['transaction_id'],
         'transaction_type': row['transaction_type'],
         'transaction_date': row['transaction_date'],
         'transaction_amount': row['transaction_amount'],
    } for row in user_movements]
    return jsonify(user_movements=user_movements_list)



@app.route("/request_loan", methods=["POST"])
@login_required
def request_loan():
    data = request.json
    amount = data.get("amount")

    if not amount:
        return jsonify({"success": False, "message": "Please enter loan amount"}), 602

    user_query = db.execute("SELECT current_balance FROM balance WHERE user_id = ?", session["user_id"])
    balance = user_query[0]['current_balance']
    
    if balance / 100 * 41 > amount:
        db.execute("UPDATE balance SET current_balance = current_balance + ? WHERE user_id = ?", amount, session["user_id"])
        db.execute("INSERT INTO transactions (user_id, transaction_type, transaction_date, transaction_amount) VALUES (?, ?, ?, ?)", session["user_id"], "deposit", date.today(), amount)
        
        return jsonify({"success": True, "message": "Loan successful"}), 200
    else:
        return jsonify({"success": False, "message": "Not enough cash for loan"}), 608





@app.route("/transfer", methods=["POST"])
@login_required
def transfer_money():
    # Get data from the request
    data = request.json

    recipient = data.get("recipient")
    if not recipient:
        return jsonify({"success": False, "message": "Please enter recipient"}), 702
    
    amount = data.get("amount")
    if not amount:
        return jsonify({"success": False, "message": "Please enter amount"}), 703

    # Retrieve the user_id of the recipient
    user_query = db.execute("SELECT user_id FROM users WHERE username = ?", recipient)
    user_id = user_query[0]['user_id'] if user_query else None
    
    if user_id:
        # Retrieve the user's balance
        balance_query = db.execute("SELECT current_balance FROM balance WHERE user_id = ?", session["user_id"])
        user_balance = balance_query[0]['current_balance']

        if user_balance >= amount:
            # Add money to recipient's account and record transaction
            db.execute("UPDATE balance SET current_balance = current_balance + ? WHERE user_id = ?", amount, user_id)
            db.execute("INSERT INTO transactions (user_id, transaction_type, transaction_date, transaction_amount) VALUES (?, ?, ?, ?)", user_id, "deposit", date.today(), amount)

            # Withdraw money from user's account and record transaction
            db.execute("UPDATE balance SET current_balance = current_balance - ? WHERE user_id = ?", amount, session["user_id"])
            db.execute("INSERT INTO transactions (user_id, transaction_type, transaction_date, transaction_amount) VALUES (?, ?, ?, ?)", session["user_id"], "withdraw", date.today(), amount)

            return jsonify({"success": True, "message": "Money transferred successfully"}), 200
        else:
            return jsonify({"success": False, "message": "Not enough money in your account"}), 409
    else:
        return jsonify({"success": False, "message": "Recipient does not exist"}), 408
    

@app.route("/close_account")
@login_required
def close():
    user_id = session["user_id"]

    try:
        # Delete transactions associated with the user
        db.execute('DELETE FROM transactions WHERE user_id = ?', user_id)

        # Delete balance information associated with the user
        db.execute('DELETE FROM balance WHERE user_id = ?', user_id)

        # Delete the user from the users table
        db.execute('DELETE FROM users WHERE user_id = ?', user_id)

        return jsonify({"success": True, "message": 'User Deleted', "redirect_url": url_for('logout')}), 200
        # return jsonify({"success": True, "message": "yessss"}), 200
        
        
    except Exception as e:
        # Handle any errors that occur during the deletion process
        return jsonify({"success": False, "message": "Error occurred during account closure"}), 809
        # You might want to flash a message to the user or log the error
    
    # Clear the session and redirect the user to the login page
    session.clear()
    return redirect("/l")



@app.route("/logout")
@login_required
def logout():
    """Log user out"""
    # Forget any user_id
    session.clear()
    # Redirect user to login form
    return redirect("/")

if __name__ == "__main__":
    app.run(debug=True)