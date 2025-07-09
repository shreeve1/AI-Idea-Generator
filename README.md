# Bug Demo Application

This is a simple Flask web application that was created to demonstrate common bugs and their fixes.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run the application:
```bash
python app.py
```

## Bugs Found and Fixed

### Bug 1: Hardcoded Secret Key (Security Vulnerability)
**Issue**: The application was using a hardcoded secret key "12345" which is a security risk.

**Fix**: Changed to use environment variables or generate a secure random key:
```python
app.secret_key = os.environ.get('SECRET_KEY', os.urandom(24).hex())
```

### Bug 2: SQL Injection Vulnerability
**Issue**: The `get_user` function was using string formatting to build SQL queries, making it vulnerable to SQL injection attacks.

**Fix**: Implemented parameterized queries with placeholders:
```python
query = "SELECT * FROM users WHERE username = ?"
cursor.execute(query, (username,))
```

### Bug 3: Division by Zero Error
**Issue**: The `calculate_average` function didn't check for empty lists, causing a division by zero error.

**Fix**: Added validation to handle empty lists:
```python
if not numbers:
    raise ValueError("Cannot calculate average of empty list")
```

## API Endpoints

- `GET /` - Home page with navigation links
- `GET /user/<username>` - Get user information (protected from SQL injection)
- `GET /average?numbers=1,2,3,4,5` - Calculate average of comma-separated numbers

## Security Improvements

- ✅ Fixed hardcoded secret key
- ✅ Prevented SQL injection attacks
- ✅ Added input validation and error handling