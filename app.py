from flask import Flask, request, render_template_string, jsonify
import sqlite3
import os

app = Flask(__name__)

# Fix Bug 1: Use environment variable or generate secure key
app.secret_key = os.environ.get('SECRET_KEY', os.urandom(24).hex())

# Fix Bug 2: Use parameterized queries to prevent SQL injection
def get_user(username):
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    # Safe parameterized query
    query = "SELECT * FROM users WHERE username = ?"
    cursor.execute(query, (username,))
    result = cursor.fetchone()
    conn.close()
    return result

# Fix Bug 3: Handle empty list to prevent division by zero
def calculate_average(numbers):
    if not numbers:  # Check for empty list
        raise ValueError("Cannot calculate average of empty list")
    total = sum(numbers)
    count = len(numbers)
    return total / count

@app.route('/')
def home():
    return render_template_string("""
    <html>
    <head><title>Bug Demo App</title></head>
    <body>
        <h1>Bug Demo Application</h1>
        <p><a href="/user/admin">Get User Info</a></p>
        <p><a href="/average?numbers=1,2,3,4,5">Calculate Average</a></p>
        <p><a href="/average?numbers=">Calculate Average (Empty)</a></p>
    </body>
    </html>
    """)

@app.route('/user/<username>')
def user_info(username):
    user = get_user(username)
    if user:
        return jsonify({"username": user[0], "email": user[1]})
    else:
        return jsonify({"error": "User not found"}), 404

@app.route('/average')
def average():
    numbers_str = request.args.get('numbers', '')
    if not numbers_str:
        numbers = []
    else:
        numbers = [int(x) for x in numbers_str.split(',')]
    
    try:
        avg = calculate_average(numbers)
        return jsonify({"average": avg})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def init_db():
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            username TEXT PRIMARY KEY,
            email TEXT
        )
    ''')
    cursor.execute("INSERT OR IGNORE INTO users VALUES ('admin', 'admin@example.com')")
    cursor.execute("INSERT OR IGNORE INTO users VALUES ('user', 'user@example.com')")
    conn.commit()
    conn.close()

if __name__ == '__main__':
    init_db()
    app.run(debug=True)