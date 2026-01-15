"""
Database Module for Enrollment CRUD System
Handles user authentication and enrollment data management
"""

import sqlite3
import hashlib
from datetime import datetime


class Database:
    def __init__(self, db_name="enrollment_system.db"):
        """Initialize database connection"""
        self.db_name = db_name
        self.create_tables()
    
    def get_connection(self):
        """Get database connection"""
        return sqlite3.connect(self.db_name)
    
    def create_tables(self):
        """Create necessary tables if they don't exist"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Users table for authentication
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                full_name TEXT NOT NULL,
                email TEXT,
                role TEXT DEFAULT 'user',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Students table for enrollment
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS students (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id TEXT UNIQUE NOT NULL,
                first_name TEXT NOT NULL,
                last_name TEXT NOT NULL,
                email TEXT,
                phone TEXT,
                course TEXT NOT NULL,
                year_level TEXT,
                enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                status TEXT DEFAULT 'Active'
            )
        ''')
        
        conn.commit()
        conn.close()
        
        # Create default admin user if not exists
        self.create_default_admin()
    
    def hash_password(self, password):
        """Hash password using SHA-256"""
        return hashlib.sha256(password.encode()).hexdigest()
    
    def create_default_admin(self):
        """Create default admin user for initial login"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            # Check if admin exists
            cursor.execute("SELECT id FROM users WHERE username = ?", ("admin",))
            if cursor.fetchone() is None:
                hashed_password = self.hash_password("admin123")
                cursor.execute('''
                    INSERT INTO users (username, password, full_name, role)
                    VALUES (?, ?, ?, ?)
                ''', ("admin", hashed_password, "System Administrator", "admin"))
                conn.commit()
                print("Default admin user created (username: admin, password: admin123)")
            
            conn.close()
        except Exception as e:
            print(f"Error creating default admin: {e}")
    
    def verify_login(self, username, password):
        """Verify user credentials"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            hashed_password = self.hash_password(password)
            cursor.execute('''
                SELECT id, username, full_name, role 
                FROM users 
                WHERE username = ? AND password = ?
            ''', (username, hashed_password))
            
            user = cursor.fetchone()
            conn.close()
            
            if user:
                return {
                    'success': True,
                    'user_id': user[0],
                    'username': user[1],
                    'full_name': user[2],
                    'role': user[3]
                }
            else:
                return {'success': False, 'message': 'Invalid username or password'}
        
        except Exception as e:
            return {'success': False, 'message': f'Database error: {str(e)}'}
    
    def create_user(self, username, password, full_name, email="", role="user"):
        """Create a new user account"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            hashed_password = self.hash_password(password)
            cursor.execute('''
                INSERT INTO users (username, password, full_name, email, role)
                VALUES (?, ?, ?, ?, ?)
            ''', (username, hashed_password, full_name, email, role))
            
            conn.commit()
            conn.close()
            return {'success': True, 'message': 'User created successfully'}
        
        except sqlite3.IntegrityError:
            return {'success': False, 'message': 'Username already exists'}
        except Exception as e:
            return {'success': False, 'message': f'Error: {str(e)}'}
    
    # CRUD Operations for Students
    def add_student(self, student_data):
        """Add a new student"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO students (student_id, first_name, last_name, email, phone, course, year_level, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                student_data['student_id'],
                student_data['first_name'],
                student_data['last_name'],
                student_data['email'],
                student_data['phone'],
                student_data['course'],
                student_data['year_level'],
                student_data.get('status', 'Active')
            ))
            
            conn.commit()
            conn.close()
            return {'success': True, 'message': 'Student added successfully'}
        
        except sqlite3.IntegrityError:
            return {'success': False, 'message': 'Student ID already exists'}
        except Exception as e:
            return {'success': False, 'message': f'Error: {str(e)}'}
    
    def get_all_students(self):
        """Retrieve all students"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            cursor.execute('SELECT * FROM students ORDER BY enrollment_date DESC')
            students = cursor.fetchall()
            
            conn.close()
            return students
        
        except Exception as e:
            print(f"Error retrieving students: {e}")
            return []
    
    def search_student(self, search_term):
        """Search for students by ID, name, or course"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            search_pattern = f"%{search_term}%"
            cursor.execute('''
                SELECT * FROM students 
                WHERE student_id LIKE ? 
                OR first_name LIKE ? 
                OR last_name LIKE ? 
                OR course LIKE ?
                ORDER BY enrollment_date DESC
            ''', (search_pattern, search_pattern, search_pattern, search_pattern))
            
            students = cursor.fetchall()
            conn.close()
            return students
        
        except Exception as e:
            print(f"Error searching students: {e}")
            return []
    
    def update_student(self, student_id, student_data):
        """Update student information"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            cursor.execute('''
                UPDATE students 
                SET first_name = ?, last_name = ?, email = ?, phone = ?, 
                    course = ?, year_level = ?, status = ?
                WHERE student_id = ?
            ''', (
                student_data['first_name'],
                student_data['last_name'],
                student_data['email'],
                student_data['phone'],
                student_data['course'],
                student_data['year_level'],
                student_data['status'],
                student_id
            ))
            
            conn.commit()
            affected_rows = cursor.rowcount
            conn.close()
            
            if affected_rows > 0:
                return {'success': True, 'message': 'Student updated successfully'}
            else:
                return {'success': False, 'message': 'Student not found'}
        
        except Exception as e:
            return {'success': False, 'message': f'Error: {str(e)}'}
    
    def delete_student(self, student_id):
        """Delete a student"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            cursor.execute('DELETE FROM students WHERE student_id = ?', (student_id,))
            
            conn.commit()
            affected_rows = cursor.rowcount
            conn.close()
            
            if affected_rows > 0:
                return {'success': True, 'message': 'Student deleted successfully'}
            else:
                return {'success': False, 'message': 'Student not found'}
        
        except Exception as e:
            return {'success': False, 'message': f'Error: {str(e)}'}
