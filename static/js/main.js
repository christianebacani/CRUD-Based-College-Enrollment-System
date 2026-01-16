let currentStudents = [];
let selectedStudentId = null;

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
        tableBody.innerHTML = '<tr><td colspan="10" class="loading-message">No students found</td></tr>';
        return;
    }
    
    tableBody.innerHTML = students.map(student => {
        const enrollmentDate = student.enrollment_date ? 
            new Date(student.enrollment_date).toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }) : '';
        
        const fullName = [student.first_name, student.middle_name, student.last_name]
            .filter(n => n).join(' ');
        
        return `
            <tr onclick="selectStudent('${student.student_id}')" data-student-id="${student.student_id}">
                <td>${student.id}</td>
                <td><strong>${student.student_id}</strong></td>
                <td>${fullName}</td>
                <td>${student.email || '-'}</td>
                <td>${student.phone || '-'}</td>
                <td>${student.course}</td>
                <td>${student.department || '-'}</td>
                <td>${student.year_level || '-'}</td>
                <td><span class="status-badge status-${student.status.toLowerCase()}">${student.status}</span></td>
                <td>${enrollmentDate}</td>
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
    document.getElementById('course').value = student.course;
    document.getElementById('department').value = student.department || '';
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
    if (!data.student_id || !data.first_name || !data.last_name || !data.course) {
        showAlert('Please fill in all required fields (Student ID, First Name, Last Name, Course)', 'warning');
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
            }
        } catch (error) {
            console.error('Error searching students:', error);
            showAlert('Error searching students', 'error');
        }
    }, 300);
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
