"""
Validation Module for Enrollment System
Provides server-side validation for student data
"""

import re


def validate_student_data(data, is_update=False):
    """
    Validates student data with strict rules for enrollment system
    
    Args:
        data: Dictionary containing student data
        is_update: Boolean indicating if this is an update operation
    
    Returns:
        Dictionary with 'valid' boolean and 'message' string
    """
    
    # Required fields validation
    required_fields = ['first_name', 'last_name', 'email', 'course', 'department', 'year_level']
    if not is_update:
        required_fields.append('student_id')
    
    for field in required_fields:
        if not data.get(field) or not str(data.get(field)).strip():
            field_name = field.replace('_', ' ').title()
            return {'valid': False, 'message': f'{field_name} is required'}
    
    # Student ID validation (YY-NNNNN format)
    if not is_update or 'student_id' in data:
        student_id = data.get('student_id', '').strip()
        if not re.match(r'^\d{2}-\d{5}$', student_id):
            return {'valid': False, 'message': 'Student ID must be in format YY-NNNNN (e.g., 25-00916)'}
    
    # Name validation - only letters, spaces, hyphens, and apostrophes
    name_pattern = r"^[a-zA-Z\s'\-]+$"
    
    # First Name validation
    first_name = data.get('first_name', '').strip()
    if not re.match(name_pattern, first_name):
        return {'valid': False, 'message': 'First Name should only contain letters, spaces, hyphens, and apostrophes'}
    
    if len(first_name) < 2 or len(first_name) > 50:
        return {'valid': False, 'message': 'First Name must be between 2 and 50 characters'}
    
    # Middle Name validation (optional)
    middle_name = data.get('middle_name', '').strip()
    if middle_name:
        if not re.match(name_pattern, middle_name):
            return {'valid': False, 'message': 'Middle Name should only contain letters, spaces, hyphens, and apostrophes'}
        
        if len(middle_name) > 50:
            return {'valid': False, 'message': 'Middle Name must not exceed 50 characters'}
    
    # Last Name validation
    last_name = data.get('last_name', '').strip()
    if not re.match(name_pattern, last_name):
        return {'valid': False, 'message': 'Last Name should only contain letters, spaces, hyphens, and apostrophes'}
    
    if len(last_name) < 2 or len(last_name) > 50:
        return {'valid': False, 'message': 'Last Name must be between 2 and 50 characters'}
    
    # Email validation (required)
    email = data.get('email', '').strip()
    if not email:
        return {'valid': False, 'message': 'Email address is required'}
    
    email_pattern = r'^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_pattern, email):
        return {'valid': False, 'message': 'Invalid email address format'}
    
    if len(email) > 100:
        return {'valid': False, 'message': 'Email address must not exceed 100 characters'}
    
    # Phone validation (if provided)
    phone = data.get('phone', '').strip()
    if phone:
        phone_pattern = r'^[\d\s\-\+\(\)]+$'
        if not re.match(phone_pattern, phone):
            return {'valid': False, 'message': 'Phone number should only contain numbers, spaces, hyphens, plus signs, and parentheses'}
        
        digits_only = re.sub(r'\D', '', phone)
        if len(digits_only) < 7 or len(digits_only) > 15:
            return {'valid': False, 'message': 'Phone number must contain between 7 and 15 digits'}
    
    # Course validation (from dropdown selection)
    course = data.get('course', '').strip()
    if not course:
        return {'valid': False, 'message': 'Please select a Course'}
    
    if len(course) < 2 or len(course) > 100:
        return {'valid': False, 'message': 'Course name must be between 2 and 100 characters'}
    
    # Department validation
    valid_departments = [
        'College of Engineering',
        'College of Architecture, Fine Arts and Design',
        'College of Engineering Technology',
        'College of Informatics and Computing Sciences'
    ]
    
    department = data.get('department', '').strip()
    if department not in valid_departments:
        return {'valid': False, 'message': 'Please select a valid College Department'}
    
    # Status validation
    valid_statuses = ['Enrolled', 'Unenrolled', 'Graduated', 'Dropped', 'Suspended', 'Transferred Out']
    status = data.get('status', 'Enrolled')
    if status not in valid_statuses:
        return {'valid': False, 'message': 'Invalid status value'}
    
    # Year Level validation (required)
    valid_year_levels = ['1st Year', '2nd Year', '3rd Year', '4th Year']
    year_level = data.get('year_level', '').strip()
    if not year_level:
        return {'valid': False, 'message': 'Year Level is required'}
    
    if year_level not in valid_year_levels:
        return {'valid': False, 'message': 'Please select a valid Year Level'}
    
    return {'valid': True, 'message': 'Validation passed'}


def sanitize_student_data(data):
    """
    Sanitizes student data by trimming whitespace and normalizing values
    
    Args:
        data: Dictionary containing student data
    
    Returns:
        Dictionary with sanitized data
    """
    sanitized = {}
    
    for key, value in data.items():
        if isinstance(value, str):
            # Trim whitespace
            sanitized[key] = value.strip()
            
            # Normalize name fields (capitalize first letter of each word)
            if key in ['first_name', 'middle_name', 'last_name']:
                sanitized[key] = ' '.join(word.capitalize() for word in sanitized[key].split())
            
            # Normalize email to lowercase
            if key == 'email' and sanitized[key]:
                sanitized[key] = sanitized[key].lower()
        else:
            sanitized[key] = value
    
    return sanitized
