
from flask import Flask, render_template, request, redirect, url_for, session, jsonify, flash
from database import Database
from validation import validate_student_data, sanitize_student_data
from functools import wraps
import os

app = Flask(__name__)
app.secret_key = os.urandom(24)
db = Database()

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            flash('Please login to access this page', 'warning')
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

@app.route('/')
def index():
    if 'user_id' in session:
        return redirect(url_for('dashboard'))
    return redirect(url_for('login'))


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        password = request.form.get('password', '')
        
        if not username or not password:
            flash('Please enter both username and password', 'error')
            return render_template('login.html')
        
        result = db.verify_login(username, password)
        
        if result['success']:
            session['user_id'] = result['user_id']
            session['username'] = result['username']
            session['full_name'] = result['full_name']
            session['role'] = result['role']
            flash(f'Welcome back, {result["full_name"]}!', 'success')
            return redirect(url_for('dashboard'))
        else:
            flash(result['message'], 'error')
            return render_template('login.html')
    
    return render_template('login.html')


@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        full_name = request.form.get('full_name', '').strip()
        email = request.form.get('email', '').strip()
        username = request.form.get('username', '').strip()
        password = request.form.get('password', '')
        role = request.form.get('role', 'user')
        
        if not all([full_name, username, password]):
            flash('Please fill in all required fields', 'error')
            return render_template('register.html')
        
        result = db.create_user(username, password, full_name, email, role)
        
        if result['success']:
            flash('Account created successfully! Please login.', 'success')
            return redirect(url_for('login'))
        else:
            flash(result['message'], 'error')
            return render_template('register.html')
    
    return render_template('register.html')


@app.route('/logout')
def logout():
    session.clear()
    flash('You have been logged out successfully', 'info')
    return redirect(url_for('login'))


@app.route('/dashboard')
@login_required
def dashboard():
    return render_template('dashboard.html', user=session)


@app.route('/api/students', methods=['GET'])
@login_required
def get_students():
    students = db.get_all_students()

    students_list = []
    for student in students:
        students_list.append({
            'id': student[0],
            'student_id': student[1],
            'first_name': student[2],
            'middle_name': student[10] if student[10] else '',
            'last_name': student[3],
            'email': student[4] if student[4] else '',
            'phone': student[5] if student[5] else '',
            'course': student[6],
            'department': student[11] if student[11] else '',
            'year_level': student[7] if student[7] else '',
            'enrollment_date': student[8] if student[8] else '',
            'status': student[9]
        })
    
    return jsonify({'success': True, 'students': students_list})


@app.route('/api/students/search', methods=['GET'])
@login_required
def search_students():
    search_term = request.args.get('query', '')
    
    if not search_term:
        return get_students()
    
    students = db.search_student(search_term)
    
    students_list = []
    for student in students:
        students_list.append({
            'id': student[0],
            'student_id': student[1],
            'first_name': student[2],
            'middle_name': student[10] if student[10] else '',
            'last_name': student[3],
            'email': student[4] if student[4] else '',
            'phone': student[5] if student[5] else '',
            'course': student[6],
            'department': student[11] if student[11] else '',
            'year_level': student[7] if student[7] else '',
            'enrollment_date': student[8] if student[8] else '',
            'status': student[9]
        })
    
    return jsonify({'success': True, 'students': students_list})


@app.route('/api/students/add', methods=['POST'])
@login_required
def add_student():
    if session.get('role') != 'admin':
        return jsonify({'success': False, 'message': 'Access denied. Admin privileges required.'})
    
    data = request.get_json()

    # Validate data
    validation_result = validate_student_data(data, is_update=False)
    if not validation_result['valid']:
        return jsonify({'success': False, 'message': validation_result['message']})
    
    # Sanitize data
    student_data = sanitize_student_data({
        'student_id': data['student_id'],
        'first_name': data['first_name'],
        'middle_name': data.get('middle_name', ''),
        'last_name': data['last_name'],
        'email': data.get('email', ''),
        'phone': data.get('phone', ''),
        'course': data['course'],
        'department': data.get('department', ''),
        'year_level': data.get('year_level', ''),
        'status': data.get('status', 'Enrolled')
    })
    
    result = db.add_student(student_data)
    return jsonify(result)


@app.route('/api/students/update/<student_id>', methods=['PUT'])
@login_required
def update_student(student_id):
    if session.get('role') != 'admin':
        return jsonify({'success': False, 'message': 'Access denied. Admin privileges required.'})
    
    data = request.get_json()

    # Validate data
    validation_result = validate_student_data(data, is_update=True)
    if not validation_result['valid']:
        return jsonify({'success': False, 'message': validation_result['message']})
    
    # Sanitize data
    student_data = sanitize_student_data({
        'first_name': data['first_name'],
        'middle_name': data.get('middle_name', ''),
        'last_name': data['last_name'],
        'email': data.get('email', ''),
        'phone': data.get('phone', ''),
        'course': data['course'],
        'department': data.get('department', ''),
        'year_level': data.get('year_level', ''),
        'status': data.get('status', 'Enrolled')
    })
    
    result = db.update_student(student_id, student_data)
    return jsonify(result)
    
    result = db.update_student(student_id, student_data)
    return jsonify(result)


@app.route('/api/students/delete/<student_id>', methods=['DELETE'])
@login_required
def delete_student(student_id):
    if session.get('role') != 'admin':
        return jsonify({'success': False, 'message': 'Access denied. Admin privileges required.'})
    
    result = db.delete_student(student_id)
    return jsonify(result)

if __name__ == '__main__':
    print("=" * 60)
    print("🎓 Enrollment CRUD System - Web Version")
    print("=" * 60)
    print("📍 Server starting at: http://localhost:5001")
    print("🔐 Default credentials:")
    print("   Username: admin")
    print("   Password: admin123")
    print("=" * 60)
    print("\n✅ Server is running... (Press CTRL+C to stop)\n")
    
    app.run(debug=True, host='0.0.0.0', port=5001)
