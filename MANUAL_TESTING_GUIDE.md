# Manual Testing Guide - College Enrollment System

## Test Environment Setup
1. Start the server: `python app.py`
2. Open browser: `http://localhost:5001`
3. Clear browser cache before testing (Ctrl+Shift+Delete)

**🔴 CRITICAL TESTS ONLY - Estimated Time: 90 Minutes (25 Must-Test Cases)**

---

## 1. REGISTRATION TESTS (8 tests - 15 min)

### Test 1.1: Successful Registration (User Role)
**Input:**
- Full Name: `John Michael Doe`
- Email: `john.doe@example.com`
- Username: `johndoe`
- Password: `Pass123!`
- Role: `user`

**Expected Output:**
- ✅ Success message: "Account created successfully! Please login."
- ✅ Redirect to login page

---

### Test 1.2: Successful Registration (Admin Role)
**Input:**
- Full Name: `Admin Test`
- Email: `admintest@example.com`
- Username: `admintest`
- Password: `Admin123!`
- Role: `admin`

**Expected Output:**
- ✅ Success message: "Account created successfully! Please login."
- ✅ Redirect to login page

---

### Test 1.3: Duplicate Username
**Input:**
- Full Name: `Another User`
- Email: `another@example.com`
- Username: `admin` (already exists)
- Password: `Pass123!`
- Role: `user`

**Expected Output:**
- ❌ Error message: "Username already exists"
- ❌ Stay on registration page

---

### Test 1.4: Empty Username
**Input:**
- Full Name: `Test User`
- Email: `test@example.com`
- Username: `` (empty)
- Password: `Pass123!`
- Role: `user`

**Expected Output:**
- ❌ Error message: "Please fill in all required fields"
- ❌ Stay on registration page

---

### Test 1.5: Empty Password
**Input:**
- Full Name: `Test User`
- Email: `test@example.com`
- Username: `testuser`
- Password: `` (empty)
- Role: `user`

**Expected Output:**
- ❌ Error message: "Please fill in all required fields"
- ❌ Stay on registration page

---

### Test 1.6: Empty Full Name
**Input:**
- Full Name: `` (empty)
- Email: `test@example.com`
- Username: `testuser`
- Password: `Pass123!`
- Role: `user`

**Expected Output:**
- ❌ Error message: "Please fill in all required fields"
- ❌ Stay on registration page

---

### Test 1.7: Lowercase Name (Auto-Capitalize Check)
**Input:**
- Full Name: `juan dela cruz` (all lowercase)
- Email: `test@example.com`
- Username: `testuser7`
- Password: `Pass123!`
- Role: `user`

**Expected Output:**
- ✅ Success: "Account created successfully!"
- ✅ Name auto-capitalizes to "Juan Dela Cruz"
- ✅ Redirect to login page

---

### Test 1.8: Invalid Characters in Name
**Input:**
- Full Name: `John Doe 123` (contains numbers)
- Email: `test8@example.com`
- Username: `testuser8`
- Password: `Pass123!`
- Role: `user`

**Expected Output:**
- ❌ Error message: "Full Name should only contain letters and spaces"
- ❌ Stay on registration page

---

## 2. LOGIN TESTS (6 tests - 10 min)

### Test 2.1: Successful Login (Admin)
**Input:**
- Username: `admin`
- Password: `admin123`

**Expected Output:**
- ✅ Redirect to dashboard
- ✅ See admin features (student form panel on left)
- ✅ See navbar with "Welcome, System Administrator"

---

### Test 2.2: Successful Login (User)
**Input:**
- Username: `johndoe` (created in Test 1.1)
- Password: `Pass123!`

**Expected Output:**
- ✅ Redirect to dashboard
- ✅ See student list only (no form panel)
- ✅ See navbar with "Welcome, John Michael Doe"

---

### Test 2.3: Wrong Password
**Input:**
- Username: `admin`
- Password: `wrongpassword`

**Expected Output:**
- ❌ Error message: "Invalid username or password"
- ❌ Stay on login page

---

### Test 2.4: Nonexistent User
**Input:**
- Username: `nonexistent`
- Password: `Pass123!`

**Expected Output:**
- ❌ Error message: "Invalid username or password"
- ❌ Stay on login page

---

### Test 2.5: Empty Credentials
**Input:**
- Username: `` (empty)
- Password: `` (empty)

**Expected Output:**
- ❌ Error message: "Please enter both username and password"
- ❌ Stay on login page

---

### Test 2.6: SQL Injection Attempt
**Input:**
- Username: `admin' OR '1'='1`
- Password: `anything`

**Expected Output:**
- ❌ Error message: "Invalid username or password"
- ❌ Stay on login page (no SQL injection)

---

## 3. ADD STUDENT TESTS (6 tests - 20 min)

### Test 3.1: Successful Add Student
**Login as:** `admin` / `admin123`

**Input:**
- Student ID: `26-12345`
- First Name: `Maria`
- Middle Name: `Santos`
- Last Name: `Cruz`
- Email: `maria.cruz@example.com`
- Phone: `09123456789`
- College Department: `College of Informatics and Computing Sciences`
- Course: `Bachelor of Science in Computer Science`
- Year Level: `1st Year`
- Status: `Enrolled`

**Expected Output:**
- ✅ Success alert: "Student added successfully!"
- ✅ Form clears automatically
- ✅ Student appears in table below
- ✅ Record count updates

---

### Test 3.2: Duplicate Student ID
**Login as:** `admin` / `admin123`

**Input:** Use same Student ID as Test 3.1
- Student ID: `26-12345`
- First Name: `Another`
- Last Name: `Student`
- (Fill other required fields)

**Expected Output:**
- ❌ Error alert: "Student ID already exists"
- ❌ Student not added to table

---

### Test 3.3: Invalid Student ID Format
**Login as:** `admin` / `admin123`

**Input:**
- Student ID: `123456` (wrong format, should be YY-NNNNN)
- First Name: `John`
- Last Name: `Doe`
- (Fill other required fields)

**Expected Output:**
- ❌ Error alert: "Student ID must be in format YY-NNNNN (e.g., 25-00916)"
- ❌ Student not added

---

### Test 3.4: Missing Required Fields
**Login as:** `admin` / `admin123`

**Input:**
- Student ID: `26-99999`
- First Name: `John`
- Last Name: `` (empty)
- Email: `` (empty)

**Expected Output:**
- ❌ Error alert: "Please fill in all required fields"
- ❌ Student not added

---

### Test 3.5: Invalid Email Format
**Login as:** `admin` / `admin123`

**Input:**
- Student ID: `26-99999`
- First Name: `John`
- Last Name: `Doe`
- Email: `invalid-email` (no @ or domain)
- (Fill other required fields)

**Expected Output:**
- ❌ Error alert: "Please enter a valid email address"
- ❌ Student not added

---

### Test 3.6: Lowercase Names (Auto-Capitalize)
**Login as:** `admin` / `admin123`

**Input:**
- Student ID: `26-11111`
- First Name: `maria` (all lowercase)
- Middle Name: `clara`
- Last Name: `santos`
- Email: `maria.santos@example.com`
- Phone: `09123456789`
- (Fill other required fields)

**Expected Output:**
- ✅ Success alert: "Student added successfully!"
- ✅ Name auto-capitalizes: "Maria Clara Santos" in table
- ✅ Student appears with proper capitalization

---

## 4. UPDATE STUDENT TESTS (3 tests - 10 min)

### Test 4.1: Successful Update
**Login as:** `admin` / `admin123`

**Steps:**
1. Click on a student row in the table
2. Form populates with student data
3. Change Year Level from `1st Year` to `2nd Year`
4. Change Status to `Unenrolled`
5. Click "Update Student"

**Expected Output:**
- ✅ Success alert: "Student updated successfully!"
- ✅ Form clears
- ✅ Table shows updated data
- ✅ Row deselects

---

### Test 4.2: Update Without Selecting Student
**Login as:** `admin` / `admin123`

**Steps:**
1. Without clicking any row, directly click "Update Student"

**Expected Output:**
- ❌ Error alert: "Please select a student to update"
- ❌ No changes made

---

### Test 4.3: Update Name with Wrong Capitalization
**Login as:** `admin` / `admin123`

**Steps:**
1. Click on any student row
2. Change First Name to `ana` (lowercase)
3. Change Last Name to `garcia`
4. Click "Update Student"

**Expected Output:**
- ✅ Success alert: "Student updated successfully!"
- ✅ Name auto-capitalizes: "Ana Garcia" in table
- ✅ Form clears and row deselects

---

## 5. DELETE STUDENT TESTS (2 tests - 5 min)

### Test 5.1: Successful Delete
**Login as:** `admin` / `admin123`

**Steps:**
1. Click on a student row in the table
2. Click "Delete Student"
3. Confirm deletion in popup dialog

**Expected Output:**
- ✅ Confirmation dialog: "Are you sure you want to delete [Student Name]?"
- ✅ Success alert: "Student deleted successfully!"
- ✅ Student removed from table
- ✅ Record count decreases
- ✅ Form clears

---

### Test 5.2: Delete Without Selection
**Login as:** `admin` / `admin123`

**Steps:**
1. Without clicking any row, click "Delete Student"

**Expected Output:**
- ❌ Error alert: "Please select a student to delete"
- ❌ No deletion occurs

---

## 6. CLEAR FORM TEST (1 test - 3 min)

### Test 6.1: Clear Form
**Login as:** `admin` / `admin123`

**Steps:**
1. Click on a student row (form populates)
2. Click "Clear Form" button

**Expected Output:**
- ✅ All form fields clear
- ✅ Row deselection (no highlight)
- ✅ Focus returns to Student ID field

---

## 7. SEARCH FUNCTIONALITY (3 tests - 7 min)

### Test 7.1: Search by Student ID
**Login as:** Any role

**Steps:**
1. Type `26-12345` in search box
2. Press Enter OR click Search button

**Expected Output:**
- ✅ Only students matching that ID appear
- ✅ Record count shows "Found: 1 record"
- ✅ Visual feedback on search (glow effect)

---

### Test 7.2: Search by Name
**Login as:** Any role

**Steps:**
1. Type `maria` in search box
2. Press Enter

**Expected Output:**
- ✅ All students with "Maria" in first/middle/last name appear
- ✅ Case-insensitive search
- ✅ Record count updates

---

### Test 7.3: Case-Insensitive Search
**Login as:** Any role

**Steps:**
1. Type `MARIA` in search box (all uppercase)
2. Press Enter

**Expected Output:**
- ✅ Finds "Maria" (case-insensitive)
- ✅ All matching students display
- ✅ Search works regardless of case

---

## 8. ACCESS CONTROL TESTS (3 tests - 10 min)

### Test 8.1: User Cannot Add Student
**Login as:** `johndoe` / `Pass123!`

**Expected Output:**
- ✅ No form panel visible
- ✅ Cannot add students
- ✅ Can only view student list

---

### Test 8.2: User Cannot Update Student
**Login as:** `johndoe` / `Pass123!`

**Steps:**
1. Try to access `/api/students/add` directly in browser

**Expected Output:**
- ❌ Access denied
- ❌ Error message

---

### Test 8.3: User Cannot Delete Student
**Login as:** `johndoe` / `Pass123!`

**Expected Output:**
- ✅ Can view all students
- ✅ Can search students
- ✅ Cannot modify data

---

## 9. CRITICAL EDGE CASES (3 tests - 10 min)

### Test 9.1: XSS Prevention (Script Tags)
**Login as:** `admin` / `admin123`

**Input:**
- Student ID: `26-99999`
- First Name: `<script>alert("XSS")</script>`
- Last Name: `Test`
- (Fill other fields)

**Expected Output:**
- ❌ Error: Name validation fails
- ❌ No script execution
- ❌ Student not added

---

### Test 9.2: SQL Injection Prevention
**Login as:** `admin` / `admin123`

**Input:**
- Student ID: `26-00'; DROP TABLE students; --`
- First Name: `Test`
- Last Name: `User`
- (Fill other fields)

**Expected Output:**
- ❌ Error: Invalid Student ID format
- ❌ No SQL execution
- ❌ Database safe

---

### Test 9.3: Duplicate Prevention System Check
**Login as:** `admin` / `admin123`

**Steps:**
1. Add student with ID `26-99999`
2. Try to add another student with same ID `26-99999`

**Expected Output:**
- ❌ Error: "Student ID already exists"
- ❌ Second student not added
- ❌ First student data preserved

---

## Summary

### Test Count by Section
| Section | Tests | Time |
|---------|-------|------|
| Registration | 8 | 15 min |
| Login | 6 | 10 min |
| Add Student | 6 | 20 min |
| Update Student | 3 | 10 min |
| Delete Student | 2 | 5 min |
| Clear Form | 1 | 3 min |
| Search | 3 | 7 min |
| Access Control | 3 | 10 min |
| Edge Cases | 3 | 10 min |
| **TOTAL** | **25** | **~90 min** |

---

## Quick Testing Sequence

### Phase 1: Authentication (25 min)
1. Test all registration scenarios
2. Test all login scenarios
3. Verify both admin and user roles work

### Phase 2: Core CRUD (35 min)
1. Add students with valid data
2. Test validation errors (duplicates, formats, missing fields)
3. Update student records
4. Delete student records
5. Clear form functionality

### Phase 3: Search & Access (20 min)
1. Test search by ID, name, case-insensitive
2. Verify user role cannot modify data
3. Confirm admin has full access

### Phase 4: Security (10 min)
1. XSS prevention test
2. SQL injection prevention test
3. Duplicate ID prevention

---

## Critical Success Criteria

✅ **Must Work:**
- User and admin registration/login
- Add student with all validations
- Update and delete students
- Search functionality (case-insensitive)
- Role-based access control (admin vs user)
- Auto-capitalization of names
- Duplicate prevention
- Security validations (XSS, SQL injection)

❌ **Must Not Happen:**
- SQL injection succeeds
- XSS scripts execute
- Duplicate student IDs created
- Users can modify data
- Invalid emails/formats accepted
- Empty required fields accepted

---

## Notes for Testers

1. Always test with **fresh browser session** (clear cache)
2. Check **console for errors** (F12 Developer Tools)
3. Verify **data persists** after page refresh
4. Test **keyboard shortcuts**: `Ctrl+S` to save, `Esc` to clear
5. Ensure **proper capitalization** in displayed names
6. Verify **status badges** have correct colors (Enrolled=green, etc.)
7. Check **record counts** update correctly
8. Test in **different browsers** if time permits
