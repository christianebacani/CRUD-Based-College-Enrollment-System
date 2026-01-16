let currentStudents = [];
let selectedStudentId = null;

// Helper function to capitalize words properly
function capitalizeWords(str) {
    if (!str) return '';
    return str.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
}

// Helper function to format phone number
function formatPhoneNumber(phone) {
    if (!phone) return '-';
    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Format as 0XXX XXX XXX for 10 digits
    if (cleaned.length === 10) {
        return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
    }
    // Format as X XXXX XXX XXX for 11 digits (remove + sign)
    if (cleaned.length === 11) {
        return `${cleaned.slice(0, 1)} ${cleaned.slice(1, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
    }
    // Return original if it doesn't match expected formats
    return phone;
}

function checkAdminRole() {
    if (typeof userRole === 'undefined' || userRole !== 'admin') {
        showAlert('Access denied. Admin privileges required for this operation.', 'error');
        return false;
    }
    return true;
}

async function loadStudents() {
    try {
        const response = await fetch('/api/students');
        const data = await response.json();
        
        if (data.success) {
            currentStudents = data.students;
            displayStudents(currentStudents);
            updateRecordCount(currentStudents.length);
        } else {
            showAlert('Failed to load students', 'error');
        }
    } catch (error) {
        console.error('Error loading students:', error);
        showAlert('Error loading students', 'error');
    }
}

function displayStudents(students) {
    const tableBody = document.getElementById('studentsTableBody');
    
    if (students.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="9" class="loading-message">No students found</td></tr>';
        return;
    }
    
    tableBody.innerHTML = students.map(student => {
        // Format name as "Last Name, First Name, Middle Name"
        const lastName = capitalizeWords(student.last_name || '');
        const firstName = capitalizeWords(student.first_name || '');
        const middleName = student.middle_name ? capitalizeWords(student.middle_name) : '';
        const fullName = middleName ? `${lastName}, ${firstName}, ${middleName}` : `${lastName}, ${firstName}`;
        
        // Display phone number without formatting
        const phone = student.phone || '-';
        
        // Format department properly
        const department = student.department || '-';
        
        // Capitalize status
        const statusText = capitalizeWords(student.status || 'Unknown');
        
        return `
            <tr onclick="selectStudent('${student.student_id}')" data-student-id="${student.student_id}">
                <td>${student.id}</td>
                <td><strong>${student.student_id}</strong></td>
                <td>${fullName}</td>
                <td>${student.email || '-'}</td>
                <td>${phone}</td>
                <td>${student.course}</td>
                <td>${department}</td>
                <td>${student.year_level || '-'}</td>
                <td><span class="status-badge status-${student.status.toLowerCase()}">${statusText}</span></td>
            </tr>
        `;
    }).join('');
}

function selectStudent(studentId) {
    document.querySelectorAll('.data-table tbody tr').forEach(row => {
        row.classList.remove('selected');
    });
    
    const selectedRow = document.querySelector(`tr[data-student-id="${studentId}"]`);
    if (selectedRow) {
        selectedRow.classList.add('selected');
    }
    
    const student = currentStudents.find(s => s.student_id === studentId);
    
    if (student) {
        selectedStudentId = studentId;
        populateForm(student);
    }
}

function populateForm(student) {
    document.getElementById('originalStudentId').value = student.student_id;
    document.getElementById('student_id').value = student.student_id;
    document.getElementById('first_name').value = student.first_name;
    document.getElementById('middle_name').value = student.middle_name || '';
    document.getElementById('last_name').value = student.last_name;
    document.getElementById('email').value = student.email || '';
    document.getElementById('phone').value = student.phone || '';
    
    // Set department first to trigger course population
    document.getElementById('department').value = student.department || '';
    
    // Trigger change event to populate courses
    const event = new Event('change');
    document.getElementById('department').dispatchEvent(event);
    
    // Set course after department courses are populated
    setTimeout(() => {
        document.getElementById('course').value = student.course;
    }, 10);
    
    document.getElementById('year_level').value = student.year_level || '';
    document.getElementById('status').value = student.status;
}

function clearForm() {
    document.getElementById('studentForm').reset();
    document.getElementById('originalStudentId').value = '';
    selectedStudentId = null;
    
    document.querySelectorAll('.data-table tbody tr').forEach(row => {
        row.classList.remove('selected');
    });
    
    document.getElementById('student_id').focus();
}

function getFormData() {
    return {
        student_id: document.getElementById('student_id').value.trim(),
        first_name: document.getElementById('first_name').value.trim(),
        middle_name: document.getElementById('middle_name').value.trim(),
        last_name: document.getElementById('last_name').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        course: document.getElementById('course').value.trim(),
        department: document.getElementById('department').value,
        year_level: document.getElementById('year_level').value,
        status: document.getElementById('status').value
    };
}

function validateFormData(data, isUpdate = false) {
    // Required fields validation
    if (!data.student_id || !data.first_name || !data.last_name || !data.email || !data.course || !data.year_level) {
        showAlert('Please fill in all required fields (Student ID, First Name, Last Name, Email, Course, Year Level)', 'warning');
        return false;
    }

    // Department validation
    if (!data.department) {
        showAlert('Please select a College Department', 'warning');
        return false;
    }

    // Student ID format validation (e.g., 25-00916, 26-12345)
    const studentIdPattern = /^\d{2}-\d{5}$/;
    if (!studentIdPattern.test(data.student_id)) {
        showAlert('Student ID must be in format YY-NNNNN (e.g., 25-00916)', 'error');
        return false;
    }

    // Name validation (no numbers or special characters except hyphens, apostrophes, and spaces)
    const namePattern = /^[a-zA-Z\s'-]+$/;
    
    if (!namePattern.test(data.first_name)) {
        showAlert('First Name should only contain letters, spaces, hyphens, and apostrophes', 'error');
        return false;
    }

    if (data.middle_name && !namePattern.test(data.middle_name)) {
        showAlert('Middle Name should only contain letters, spaces, hyphens, and apostrophes', 'error');
        return false;
    }

    if (!namePattern.test(data.last_name)) {
        showAlert('Last Name should only contain letters, spaces, hyphens, and apostrophes', 'error');
        return false;
    }

    // Name length validation
    if (data.first_name.length < 2 || data.first_name.length > 50) {
        showAlert('First Name must be between 2 and 50 characters', 'error');
        return false;
    }

    if (data.last_name.length < 2 || data.last_name.length > 50) {
        showAlert('Last Name must be between 2 and 50 characters', 'error');
        return false;
    }

    if (data.middle_name && data.middle_name.length > 50) {
        showAlert('Middle Name must not exceed 50 characters', 'error');
        return false;
    }

    // Email validation (required)
    if (!data.email) {
        showAlert('Email address is required', 'error');
        return false;
    }
    
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(data.email)) {
        showAlert('Please enter a valid email address (e.g., student@example.com)', 'error');
        return false;
    }

    // Phone validation (if provided)
    if (data.phone) {
        const phonePattern = /^[\d\s\-\+\(\)]+$/;
        if (!phonePattern.test(data.phone)) {
            showAlert('Phone number should only contain numbers, spaces, hyphens, plus signs, and parentheses', 'error');
            return false;
        }
        
        const digitsOnly = data.phone.replace(/\D/g, '');
        if (digitsOnly.length < 7 || digitsOnly.length > 15) {
            showAlert('Phone number must contain between 7 and 15 digits', 'error');
            return false;
        }
    }

    // Course validation (now a dropdown selection)
    if (!data.course) {
        showAlert('Please select a Course', 'error');
        return false;
    }

    // Year level validation (required)
    if (!data.year_level) {
        showAlert('Please select a Year Level', 'error');
        return false;
    }

    return true;
}

async function addStudent() {
    if (!checkAdminRole()) return;
    
    const data = getFormData();
    
    if (!validateFormData(data)) {
        return;
    }
    
    try {
        const response = await fetch('/api/students/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showAlert('Student added successfully!', 'success');
            clearForm();
            loadStudents();
        } else {
            showAlert(result.message, 'error');
        }
    } catch (error) {
        console.error('Error adding student:', error);
        showAlert('Error adding student', 'error');
    }
}

async function updateStudent() {
    if (!checkAdminRole()) return;
    
    const originalStudentId = document.getElementById('originalStudentId').value;
    
    if (!originalStudentId) {
        showAlert('Please select a student to update', 'warning');
        return;
    }
    
    const data = getFormData();
    
    if (!validateFormData(data, true)) {
        return;
    }
    
    try {
        const response = await fetch(`/api/students/update/${originalStudentId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showAlert('Student updated successfully!', 'success');
            clearForm();
            loadStudents();
        } else {
            showAlert(result.message, 'error');
        }
    } catch (error) {
        console.error('Error updating student:', error);
        showAlert('Error updating student', 'error');
    }
}

async function deleteStudent() {
    if (!checkAdminRole()) return;
    
    const originalStudentId = document.getElementById('originalStudentId').value;
    
    if (!originalStudentId) {
        showAlert('Please select a student to delete', 'warning');
        return;
    }
    
    const student = currentStudents.find(s => s.student_id === originalStudentId);
    const studentName = student ? `${student.first_name} ${student.last_name}` : 'this student';
    
    if (!confirm(`Are you sure you want to delete ${studentName}?`)) {
        return;
    }
    
    try {
        const response = await fetch(`/api/students/delete/${originalStudentId}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.success) {
            showAlert('Student deleted successfully!', 'success');
            clearForm();
            loadStudents();
        } else {
            showAlert(result.message, 'error');
        }
    } catch (error) {
        console.error('Error deleting student:', error);
        showAlert('Error deleting student', 'error');
    }
}

let searchTimeout;
async function searchStudents() {
    clearTimeout(searchTimeout);
    
    const searchTerm = document.getElementById('searchInput').value.trim();
    
    searchTimeout = setTimeout(async () => {
        if (!searchTerm) {
            loadStudents();
            return;
        }
        
        try {
            const response = await fetch(`/api/students/search?query=${encodeURIComponent(searchTerm)}`);
            const data = await response.json();
            
            if (data.success) {
                currentStudents = data.students;
                displayStudents(currentStudents);
                updateRecordCount(currentStudents.length, true);
                
                // Change button to Refresh
                const btn = document.getElementById('searchRefreshBtn');
                btn.innerHTML = '🔄 Refresh';
                btn.setAttribute('data-mode', 'refresh');
            }
        } catch (error) {
            console.error('Error searching students:', error);
            showAlert('Error searching students', 'error');
        }
    }, 300);
}

function handleSearchOrRefresh() {
    const btn = document.getElementById('searchRefreshBtn');
    const mode = btn.getAttribute('data-mode');
    
    if (mode === 'refresh') {
        // Reset to default view
        document.getElementById('searchInput').value = '';
        loadStudents();
        
        // Change button back to Search
        btn.innerHTML = '🔍 Search';
        btn.setAttribute('data-mode', 'search');
    } else {
        // Perform search
        searchStudents();
    }
}

function updateRecordCount(count, isSearch = false) {
    const countLabel = document.getElementById('recordCount');
    const prefix = isSearch ? 'Found:' : 'Total:';
    countLabel.textContent = `${prefix} ${count} record${count !== 1 ? 's' : ''}`;
}

function showAlert(message, type) {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'alert-close';
    closeBtn.innerHTML = '&times;';
    closeBtn.onclick = () => alert.remove();
    alert.appendChild(closeBtn);
    
    const container = document.querySelector('.container');
    const firstChild = container.firstChild;
    container.insertBefore(alert, firstChild);
    
    setTimeout(() => {
        alert.style.opacity = '0';
        setTimeout(() => alert.remove(), 300);
    }, 5000);
}

document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (selectedStudentId) {
            updateStudent();
        } else {
            addStudent();
        }
    }
    
    if (e.key === 'Escape') {
        clearForm();
    }
});
