# Student Enrollment CRUD System - Web Version

A modern and professional web-based login system with complete student enrollment management functionality built with Python and Flask.

## Features

### 🔐 Authentication System
- Modern, responsive login interface
- Secure password hashing (SHA-256)
- User registration functionality
- Password visibility toggle
- Session management
- Role-based access (admin/user)

### 📚 Student Management (CRUD)
- **Create**: Add new student records with complete information
- **Read**: View all students in a dynamic table
- **Update**: Edit existing student information
- **Delete**: Remove student records with confirmation
- **Search**: Real-time search with instant results (AJAX)

### 🎨 User Interface
- Professional and modern web design
- Fully responsive (mobile, tablet, desktop)
- Clean, intuitive layout
- Beautiful gradient backgrounds
- Real-time updates without page reload
- Color-coded status badges
- Smooth animations and transitions

## Default Credentials

```
Username: admin
Password: admin123
```

## Installation

1. **Clone or download this repository**

2. **Ensure Python 3.8+ is installed**
   ```bash
   python --version
   ```

3. **Install Flask**
   ```bash
   pip install Flask
   ```

## Usage

### Running the Application

```bash
python app.py
```

Then open your web browser and go to:
```
http://localhost:5000
```

### First Time Setup

1. Launch the application
2. Login with default credentials (admin/admin123)
3. Create your own account via "Create one" link
4. Start managing student enrollments

### Managing Students

1. **Adding a Student**:
   - Fill in the form on the left panel
   - Required fields: Student ID, First Name, Last Name, Course
   - Click "➕ Add Student"
   - Success message appears automatically

2. **Updating a Student**:
   - Click on any student row in the table
   - Form auto-fills with student data
   - Modify the information
   - Click "✏️ Update Student"

3. **Deleting a Student**:
   - Select a student from the table
   - Click "🗑️ Delete Student"
   - Confirm the deletion in popup

4. **Searching Students**:
   - Type in the search box above the table
   - Results appear instantly as you type
   - Search works across all fields

5. **Keyboard Shortcuts**:
   - `Ctrl + S`: Save (Add or Update)
   - `Escape`: Clear form

## Project Structure

```
Enrollment_CRUD_System_Using_Python/
│
├── app.py                      # Flask application (main entry point)
├── database.py                 # Database operations and management
├── requirements.txt            # Project dependencies
├── README.md                   # This file
├── enrollment_system.db        # SQLite database (created on first run)
│
├── templates/                  # HTML templates
│   ├── login.html             # Login page
│   ├── register.html          # Registration page
│   └── dashboard.html         # Main dashboard
│
└── static/                     # Static files
    ├── css/
    │   └── style.css          # Stylesheet
    └── js/
        └── main.js            # JavaScript functionality
```

## Database Schema

### Users Table
- id (Primary Key)
- username (Unique)
- password (Hashed)
- full_name
- email
- role (admin/user)
- created_at (Timestamp)

### Students Table
- id (Primary Key)
- student_id (Unique)
- first_name
- last_name
- email
- phone
- course
- year_level
- enrollment_date (Timestamp)
- status (Active/Inactive/Graduated/Withdrawn)

## Security Features

- ✅ Password hashing using SHA-256
- ✅ Secure database operations
- ✅ Input validation
- ✅ SQL injection prevention (parameterized queries)
- ✅ User authentication
- ✅ Role-based access control

## Technologies Used

- **Python 3.8+**: Programming language
- **Flask**: Web framework
- **SQLite3**: Database management
- **Hashlib**: Password encryption
- **HTML/CSS**: Frontend design
- **JavaScript**: Client-side interactivity
- **AJAX**: Asynchronous operations

## Key Features

### Login Screen
- Beautiful gradient background
- Clean, centered design
- Password visibility toggle
- Create account link
- Flash messages for feedback
- Responsive design

### Dashboard
- Two-panel responsive layout
- Left: Student information form
- Right: Dynamic data table
- Top navbar with user info
- Real-time search
- AJAX-powered operations
- No page reloads needed
- Mobile-friendly interface

## Future Enhancements

Potential improvements:
- Export to Excel/PDF
- Advanced filtering options
- Student photo uploads
- Email notifications
- Batch operations
- Audit log
- Dark mode theme
- Multi-user session management

## Troubleshooting

### "ModuleNotFoundError: No module named 'flask'"
- **Solution**: Run `pip install Flask`

### Port 5000 already in use
- **Solution**: Stop other applications using port 5000, or change the port in app.py

### Database locked error
- **Solution**: Close all instances of the application and try again

### Browser shows "Connection refused"
- **Solution**: Make sure the Flask server is running (`python app.py`)

### To stop the server
- **Solution**: Press `CTRL+C` in the terminal where app.py is running

## License

This project is open source and available for educational purposes.

## Support

For issues, questions, or contributions, please create an issue in the repository.

---

**Created with ❤️ using Python and Tkinter**
