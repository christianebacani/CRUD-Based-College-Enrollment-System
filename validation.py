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
    
    # Required fields validation with descriptive messages
    required_fields = ['first_name', 'last_name', 'email', 'course', 'department', 'year_level']
    if not is_update:
        required_fields.append('student_id')
    
    for field in required_fields:
        if not data.get(field) or not str(data.get(field)).strip():
            field_name = field.replace('_', ' ').title()
            # Provide context-specific messages for each field
            field_messages = {
                'student_id': 'Student ID is required for enrollment. Please enter a valid ID in YY-NNNNN format (e.g., 25-00916).',
                'first_name': 'First Name is required. Please enter the student\'s legal first name as it appears on official documents.',
                'last_name': 'Last Name is required. Please enter the student\'s legal last name as it appears on official documents.',
                'email': 'Email Address is required for communication and account verification. Please provide a valid email address.',
                'course': 'Course selection is required. Please select the student\'s enrolled program from the dropdown menu.',
                'department': 'College Department is required. Please select the appropriate college for the student\'s program.',
                'year_level': 'Year Level is required. Please select the student\'s current academic year (1st-4th Year).'
            }
            message = field_messages.get(field, f'{field_name} is required for enrollment. Please provide this information to continue.')
            return {'valid': False, 'message': message}
    
    # Student ID validation (YY-NNNNN format)
    if not is_update or 'student_id' in data:
        student_id = data.get('student_id', '').strip()
        if not re.match(r'^\d{2}-\d{5}$', student_id):
            return {'valid': False, 'message': 'Invalid Student ID Format: Please enter in YY-NNNNN format (e.g., 25-00916), where YY represents the enrollment year and NNNNN is the 5-digit student number.'}
    
    # Name validation - only letters, spaces, hyphens, and apostrophes
    name_pattern = r"^[a-zA-Z\s'\-]+$"
    
    # First Name validation
    first_name = data.get('first_name', '').strip()
    if not re.match(name_pattern, first_name):
        return {'valid': False, 'message': 'Invalid First Name: Only letters, spaces, hyphens (-), and apostrophes (\') are allowed. Please remove any numbers or special characters (e.g., "John" or "Mary-Anne").'}
    
    if len(first_name) < 2 or len(first_name) > 50:
        return {'valid': False, 'message': f'First Name Length Error: Must be between 2 and 50 characters. Current length: {len(first_name)} characters.'}
    
    # Middle Name validation (optional)
    middle_name = data.get('middle_name', '').strip()
    if middle_name:
        if not re.match(name_pattern, middle_name):
            return {'valid': False, 'message': 'Invalid Middle Name: Only letters, spaces, hyphens (-), and apostrophes (\') are allowed. Please remove any numbers or special characters.'}
        
        if len(middle_name) > 50:
            return {'valid': False, 'message': f'Middle Name Length Error: Must not exceed 50 characters. Current length: {len(middle_name)} characters.'}
    
    # Last Name validation
    last_name = data.get('last_name', '').strip()
    if not re.match(name_pattern, last_name):
        return {'valid': False, 'message': 'Invalid Last Name: Only letters, spaces, hyphens (-), and apostrophes (\') are allowed. Please remove any numbers or special characters (e.g., "Smith" or "O\'Brien").'}
    
    if len(last_name) < 2 or len(last_name) > 50:
        return {'valid': False, 'message': f'Last Name Length Error: Must be between 2 and 50 characters. Current length: {len(last_name)} characters.'}
    
    # Email validation (required)
    email = data.get('email', '').strip()
    if not email:
        return {'valid': False, 'message': 'Email Address is required for account creation and communication. Please provide a valid email address.'}
    
    email_pattern = r'^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_pattern, email):
        return {'valid': False, 'message': 'Invalid Email Format: Please enter a valid email address (e.g., student@batstate-u.edu.ph or student@example.com). Ensure it includes "@" and a domain name.'}
    
    if len(email) > 100:
        return {'valid': False, 'message': f'Email Length Error: Email address must not exceed 100 characters. Current length: {len(email)} characters.'}
    
    # Phone validation (required - Philippine mobile format: 09XX-XXX-XXXX)
    phone = data.get('phone', '').strip()
    if not phone:
        return {'valid': False, 'message': 'Phone Number is required for emergency contact and verification. Please provide a valid Philippine mobile number.'}
    
    # Validate Philippine mobile format: 09XX-XXX-XXXX
    phone_pattern = r'^09\d{2}-\d{3}-\d{4}$'
    if not re.match(phone_pattern, phone):
        return {'valid': False, 'message': 'Invalid Phone Format: Please enter a Philippine mobile number in format 09XX-XXX-XXXX (e.g., 0912-345-6789). Use dashes to separate digit groups.'}
    
    # Ensure it starts with 09 (Philippine mobile)
    if not phone.startswith('09'):
        return {'valid': False, 'message': 'Invalid Phone Number: Must be a Philippine mobile number starting with 09 (e.g., 0912-345-6789, 0917-123-4567, 0998-765-4321).'}
    
    # Course validation (from dropdown selection)
    course = data.get('course', '').strip()
    if not course:
        return {'valid': False, 'message': 'Course Selection Required: Please select the student\'s enrolled program from the dropdown menu (e.g., BS Computer Science, BS Civil Engineering).'}
    
    if len(course) < 2 or len(course) > 100:
        return {'valid': False, 'message': f'Invalid Course Name: Course name must be between 2 and 100 characters. Current length: {len(course)} characters.'}
    
    # Department validation
    valid_departments = [
        'College of Engineering',
        'College of Architecture, Fine Arts and Design',
        'College of Engineering Technology',
        'College of Informatics and Computing Sciences'
    ]
    
    department = data.get('department', '').strip()
    if department not in valid_departments:
        return {'valid': False, 'message': 'Invalid College Department: Please select one of the following: College of Engineering (COE), College of Architecture, Fine Arts and Design (CAFAD), College of Engineering Technology (CET), or College of Informatics and Computing Sciences (CICS).'}
    
    # Status validation
    valid_statuses = ['Enrolled', 'Unenrolled', 'Graduated', 'Dropped', 'Suspended', 'Transferred Out']
    status = data.get('status', 'Enrolled')
    if status not in valid_statuses:
        return {'valid': False, 'message': f'Invalid Enrollment Status: "{status}" is not recognized. Please select from: Enrolled, Unenrolled, Graduated, Dropped, Suspended, or Transferred Out.'}
    
    # Year Level validation (required)
    valid_year_levels = ['1st Year', '2nd Year', '3rd Year', '4th Year']
    year_level = data.get('year_level', '').strip()
    if not year_level:
        return {'valid': False, 'message': 'Year Level is required: Please select the student\'s current academic year (1st Year, 2nd Year, 3rd Year, or 4th Year).'}
    
    if year_level not in valid_year_levels:
        return {'valid': False, 'message': f'Invalid Year Level: "{year_level}" is not recognized. Please select from: 1st Year, 2nd Year, 3rd Year, or 4th Year.'}
    
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
