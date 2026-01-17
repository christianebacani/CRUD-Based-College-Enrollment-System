# Manual Testing Guide - College Enrollment System

## Test Environment Setup
1. Start the server: `python app.py`
2. Open browser: `http://localhost:5001`
3. Clear browser cache before testing (Ctrl+Shift+Delete)

---

## 1. REGISTRATION TESTS

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

## 2. LOGIN TESTS

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

## 3. ADD STUDENT TESTS (Admin Only)

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

### Test 3.6: Numbers in Name
**Login as:** `admin` / `admin123`

**Input:**
- Student ID: `26-99999`
- First Name: `John123` (contains numbers)
- Last Name: `Doe`
- (Fill other required fields)

**Expected Output:**
- ❌ Error alert: "First Name should only contain letters, spaces, hyphens, and apostrophes"
- ❌ Student not added

---

### Test 3.7: Valid Special Characters in Name
**Login as:** `admin` / `admin123`

**Input:**
- Student ID: `26-54321`
- First Name: `Mary-Jane`
- Middle Name: ``
- Last Name: `O'Connor`
- (Fill other required fields with valid data)

**Expected Output:**
- ✅ Success alert: "Student added successfully!"
- ✅ Student added with hyphen and apostrophe in name

---

### Test 3.8: Name Too Long (>50 characters)
**Login as:** `admin` / `admin123`

**Input:**
- Student ID: `26-99999`
- First Name: `Aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa` (51 characters)
- Last Name: `Doe`
- (Fill other required fields)

**Expected Output:**
- ❌ Error alert: "First Name must be between 2 and 50 characters"
- ❌ Student not added

---

### Test 3.9: Empty Middle Name (Should Work)
**Login as:** `admin` / `admin123`

**Input:**
- Student ID: `26-88888`
- First Name: `Pedro`
- Middle Name: `` (empty - this is optional)
- Last Name: `Reyes`
- (Fill other required fields)

**Expected Output:**
- ✅ Success alert: "Student added successfully!"
- ✅ Student added with blank middle name

---

### Test 3.10: Invalid Phone Format
**Login as:** `admin` / `admin123`

**Input:**
- Student ID: `26-77777`
- First Name: `Juan`
- Last Name: `Dela Cruz`
- Phone: `abc123xyz` (letters in phone)
- (Fill other required fields)

**Expected Output:**
- ❌ Error alert: "Phone number should only contain numbers, spaces, hyphens, plus signs, and parentheses"
- ❌ Student not added

---

## 4. UPDATE STUDENT TESTS (Admin Only)

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

### Test 4.3: Update to Invalid Email
**Login as:** `admin` / `admin123`

**Steps:**
1. Click on a student row
2. Change Email to `invalid-email`
3. Click "Update Student"

**Expected Output:**
- ❌ Error alert: "Please enter a valid email address"
- ❌ Student not updated

---

## 5. DELETE STUDENT TESTS (Admin Only)

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

### Test 5.2: Cancel Delete
**Login as:** `admin` / `admin123`

**Steps:**
1. Click on a student row
2. Click "Delete Student"
3. Click "Cancel" in confirmation dialog

**Expected Output:**
- ✅ Deletion cancelled
- ✅ Student remains in table
- ✅ No changes made

---

### Test 5.3: Delete Without Selection
**Login as:** `admin` / `admin123`

**Steps:**
1. Without clicking any row, click "Delete Student"

**Expected Output:**
- ❌ Error alert: "Please select a student to delete"
- ❌ No deletion occurs

---

## 6. CLEAR FORM TEST (Admin Only)

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

### Test 6.2: Clear Form Using Escape Key
**Login as:** `admin` / `admin123`

**Steps:**
1. Click on a student row
2. Press `Esc` key

**Expected Output:**
- ✅ Form clears
- ✅ Row deselects

---

## 7. ROW SELECTION TESTS (Both Roles)

### Test 7.1: Select Row (Admin)
**Login as:** `admin` / `admin123`

**Steps:**
1. Click on any student row in table

**Expected Output:**
- ✅ Row highlights with blue background and left border
- ✅ Form populates with student data
- ✅ Form panel opens if collapsed

---

### Test 7.2: Select Row (User)
**Login as:** `johndoe` / `Pass123!`

**Steps:**
1. Click on any student row in table

**Expected Output:**
- ✅ Row highlights with blue background and left border
- ✅ No form panel (users can't edit)

---

### Test 7.3: Deselect by Clicking Outside
**Login as:** Any role

**Steps:**
1. Click on a student row
2. Click outside the table (navbar, panel header, empty space)

**Expected Output:**
- ✅ Row highlight removes
- ✅ Form clears (if admin)

---

### Test 7.4: Don't Deselect When Clicking Form
**Login as:** `admin` / `admin123`

**Steps:**
1. Click on a student row
2. Click inside the form fields

**Expected Output:**
- ✅ Row stays highlighted
- ✅ Form remains populated
- ✅ Can edit form fields

---

## 8. SEARCH FUNCTIONALITY (Both Roles)

### Test 8.1: Search by Student ID
**Login as:** Any role

**Steps:**
1. Type `26-12345` in search box
2. Press Enter OR click Search button

**Expected Output:**
- ✅ Only students matching that ID appear
- ✅ Record count shows "Found: 1 record"
- ✅ Visual feedback on search (glow effect)

---

### Test 8.2: Search by Name
**Login as:** Any role

**Steps:**
1. Type `maria` in search box
2. Press Enter

**Expected Output:**
- ✅ All students with "Maria" in first/middle/last name appear
- ✅ Case-insensitive search
- ✅ Record count updates

---

### Test 8.3: Search by Course
**Login as:** Any role

**Steps:**
1. Type `computer science` in search box
2. Click Search button

**Expected Output:**
- ✅ All CS students appear
- ✅ Button shows visual feedback when clicked

---

### Test 8.4: Clear Search
**Login as:** Any role

**Steps:**
1. Perform a search
2. Clear the search box
3. Press Enter or click Search

**Expected Output:**
- ✅ All students display again
- ✅ Record count shows total

---

## 9. ACCESS CONTROL TESTS

### Test 9.1: User Cannot Add Student
**Login as:** `johndoe` / `Pass123!`

**Expected Output:**
- ✅ No form panel visible
- ✅ Cannot add students
- ✅ Can only view student list

---

### Test 9.2: User Cannot Update Student
**Login as:** `johndoe` / `Pass123!`

**Steps:**
1. Try to access `/api/students/add` directly in browser

**Expected Output:**
- ❌ Access denied
- ❌ Error message

---

### Test 9.3: User Cannot Delete Student
**Login as:** `johndoe` / `Pass123!`

**Expected Output:**
- ✅ Can view all students
- ✅ Can search students
- ✅ Cannot modify data

---

## 10. EDGE CASES

### Test 10.1: XSS Prevention
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

### Test 10.2: Very Long Input
**Login as:** `admin` / `admin123`

**Input:**
- Email: `verylongemailaddress@verylongdomainname.com` (>100 chars)

**Expected Output:**
- ❌ Error or input truncated
- ❌ Proper validation

---

### Test 10.3: Special Status Values
**Login as:** `admin` / `admin123`

**Steps:**
1. Add student with each status:
   - Enrolled (green badge)
   - Unenrolled (gray badge)
   - Graduated (blue badge)
   - Dropped (red badge)
   - Suspended (orange badge)
   - Transferred Out (purple badge)

**Expected Output:**
- ✅ Each status displays with correct color badge
- ✅ Proper styling and formatting

---

## 11. LOGOUT TEST

### Test 11.1: Successful Logout
**Login as:** Any role

**Steps:**
1. Click "Logout" button in navbar

**Expected Output:**
- ✅ Redirect to login page
- ✅ Info message: "You have been logged out successfully"
- ✅ Cannot access dashboard without login

---

## 12. FORM PANEL COLLAPSE (Admin Only)

### Test 12.1: Collapse/Expand Form Panel
**Login as:** `admin` / `admin123`

**Steps:**
1. Hover over left edge of screen
2. Click the toggle button that appears

**Expected Output:**
- ✅ Form panel collapses/expands
- ✅ Table takes full width when collapsed
- ✅ State persists on page refresh

---

## Summary Checklist

**Registration:** 6 tests
**Login:** 6 tests
**Add Student:** 10 tests
**Update Student:** 3 tests
**Delete Student:** 3 tests
**Clear Form:** 2 tests
**Row Selection:** 4 tests
**Search:** 4 tests
**Access Control:** 3 tests
**Edge Cases:** 3 tests
**Logout:** 1 test
**Form Panel:** 1 test

**TOTAL: 46 Manual Test Cases**

---

## Notes for Testers

1. Always test with **fresh browser session** (clear cache)
2. Test in **different browsers** (Chrome, Firefox, Edge)
3. Check **console for errors** (F12 Developer Tools)
4. Verify **database persistence** (data survives server restart)
5. Test **keyboard shortcuts**:
   - `Ctrl+S`: Save/Update student
   - `Esc`: Clear form
   - `Enter`: Search
6. Check **responsive design** on mobile screen sizes
7. Verify **proper capitalization** in displayed names
8. Ensure **status badges** have correct colors
9. Test **concurrent users** (admin and user logged in separately)
10. Verify **data validation** on both client and server side
