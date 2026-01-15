# Student Enrollment CRUD System

A web-based student enrollment management system built with Python and Flask.

## Prerequisites

- Python 3.8 or higher
- pip (Python package installer)

## Installation

1. Install the required dependencies:

```bash
pip install Flask
```

## Running the Application

1. Start the Flask server:

```bash
python app.py
```

2. Open your web browser and navigate to:

```
http://localhost:5000
```

3. Login with the default credentials:

```
Username: admin
Password: admin123
```

## Stopping the Application

Press `CTRL+C` in the terminal where the application is running.

## Troubleshooting

**Issue: ModuleNotFoundError: No module named 'flask'**
- Solution: Run `pip install Flask`

**Issue: Port 5000 already in use**
- Solution: Stop other applications using port 5000 or modify the port in app.py

**Issue: Database locked error**
- Solution: Close all instances of the application and restart

**Issue: Connection refused in browser**
- Solution: Ensure the Flask server is running
