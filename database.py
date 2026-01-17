"""
Database Module for Enrollment CRUD System
Handles user authentication and enrollment data management
"""

import sqlite3
import hashlib
from datetime import datetime


class Database:
    def __init__(self, db_name="enrollment_system.db"):
        self.db_name = db_name
        self.create_tables()
    
    def get_connection(self):
        conn = sqlite3.connect(self.db_name, timeout=10.0)
        conn.execute('PRAGMA journal_mode=WAL')
        return conn
    
    def create_tables(self):
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                first_name TEXT NOT NULL,
                middle_name TEXT,
                last_name TEXT NOT NULL,
                full_name TEXT NOT NULL,
                email TEXT,
                role TEXT DEFAULT 'user',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS students (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id TEXT UNIQUE NOT NULL,
                first_name TEXT NOT NULL,
                middle_name TEXT,
                last_name TEXT NOT NULL,
                email TEXT,
                phone TEXT,
                course TEXT NOT NULL,
                department TEXT,
                year_level TEXT,
                enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                status TEXT DEFAULT 'Active'
            )
        ''')
        
        conn.commit()
        conn.close()
        
        self.create_default_admin()
    
    def hash_password(self, password):
        return hashlib.sha256(password.encode()).hexdigest()
    
    def create_default_admin(self):
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            cursor.execute("SELECT id FROM users WHERE username = ?", ("admin",))
            if cursor.fetchone() is None:
                hashed_password = self.hash_password("admin123")
                cursor.execute('''
                    INSERT INTO users (username, password, first_name, middle_name, last_name, full_name, role)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                ''', ("admin", hashed_password, "System", "", "Administrator", "System Administrator", "admin"))
                conn.commit()
                print("Default admin user created (username: admin, password: admin123)")
            
            conn.close()
        except Exception as e:
            print(f"Error creating default admin: {e}")
    
    def verify_login(self, username, password):
        try:
            # Validate inputs
            if not username or not password:
                return {'success': False, 'message': 'Username and password are required'}
            
            conn = self.get_connection()
            cursor = conn.cursor()
            
            hashed_password = self.hash_password(password)
            cursor.execute('''
                SELECT id, username, first_name, middle_name, last_name, full_name, role 
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
                    'first_name': user[2],
                    'middle_name': user[3],
                    'last_name': user[4],
                    'full_name': user[5],
                    'role': user[6]
                }
            else:
                return {'success': False, 'message': 'Invalid username or password'}
        
        except Exception as e:
            return {'success': False, 'message': f'Database error: {str(e)}'}
    
    def create_user(self, username, password, first_name, last_name, middle_name="", email="", role="user"):
        conn = None
        try:
            import re
            
            # Validate required fields
            if not username or not username.strip():
                return {'success': False, 'message': 'Username is required'}
            if not password:
                return {'success': False, 'message': 'Password is required'}
            if not first_name or not first_name.strip():
                return {'success': False, 'message': 'First name is required'}
            if not last_name or not last_name.strip():
                return {'success': False, 'message': 'Last name is required'}
            
            # Validate first name - only letters and spaces allowed
            if not re.match(r"^[a-zA-Z\s]+$", first_name.strip()):
                return {'success': False, 'message': 'First name should only contain letters and spaces'}
            
            if len(first_name.strip()) < 2 or len(first_name.strip()) > 50:
                return {'success': False, 'message': 'First name must be between 2 and 50 characters'}
            
            # Validate last name - only letters and spaces allowed
            if not re.match(r"^[a-zA-Z\s]+$", last_name.strip()):
                return {'success': False, 'message': 'Last name should only contain letters and spaces'}
            
            if len(last_name.strip()) < 2 or len(last_name.strip()) > 50:
                return {'success': False, 'message': 'Last name must be between 2 and 50 characters'}
            
            # Validate middle name if provided - only letters and spaces allowed
            if middle_name and middle_name.strip():
                if not re.match(r"^[a-zA-Z\s]+$", middle_name.strip()):
                    return {'success': False, 'message': 'Middle name should only contain letters and spaces'}
                
                if len(middle_name.strip()) > 50:
                    return {'success': False, 'message': 'Middle name must not exceed 50 characters'}
            
            conn = self.get_connection()
            cursor = conn.cursor()
            
            # Capitalize and standardize names
            formatted_first_name = ' '.join(word.capitalize() for word in first_name.strip().split())
            formatted_last_name = ' '.join(word.capitalize() for word in last_name.strip().split())
            formatted_middle_name = ' '.join(word.capitalize() for word in middle_name.strip().split()) if middle_name else ""
            
            # Create full name for display/compatibility
            if formatted_middle_name:
                full_name = f"{formatted_first_name} {formatted_middle_name} {formatted_last_name}"
            else:
                full_name = f"{formatted_first_name} {formatted_last_name}"
            
            hashed_password = self.hash_password(password)
            cursor.execute('''
                INSERT INTO users (username, password, first_name, middle_name, last_name, full_name, email, role)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (username.strip(), hashed_password, formatted_first_name, formatted_middle_name, 
                  formatted_last_name, full_name, email, role))
            
            conn.commit()
            return {'success': True, 'message': 'User created successfully'}
        
        except sqlite3.IntegrityError:
            return {'success': False, 'message': 'Username already exists'}
        except Exception as e:
            return {'success': False, 'message': f'Error: {str(e)}'}
        finally:
            if conn:
                conn.close()
    
    def add_student(self, student_data):
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO students (student_id, first_name, middle_name, last_name, email, phone, course, department, year_level, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                student_data['student_id'],
                student_data['first_name'],
                student_data.get('middle_name', ''),
                student_data['last_name'],
                student_data['email'],
                student_data['phone'],
                student_data['course'],
                student_data.get('department', ''),
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
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            cursor.execute('''
                UPDATE students 
                SET first_name = ?, middle_name = ?, last_name = ?, email = ?, phone = ?, 
                    course = ?, department = ?, year_level = ?, status = ?
                WHERE student_id = ?
            ''', (
                student_data['first_name'],
                student_data.get('middle_name', ''),
                student_data['last_name'],
                student_data['email'],
                student_data['phone'],
                student_data['course'],
                student_data.get('department', ''),
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
