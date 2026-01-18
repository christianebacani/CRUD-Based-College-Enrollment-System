let currentStudents = [];
let selectedStudentId = null;
let currentPage = 1;
let pageSize = 15;
let totalRecords = 0;
let totalPages = 0;
let currentSearchTerm = '';
let currentSortColumn = null;
let currentSortDirection = 'asc';

function capitalizeWords(str) {
    if (!str) return '';
    return str.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
}

function formatPhoneNumber(phone) {
    if (!phone) return '-';
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.length === 12 && cleaned.startsWith('63')) {
        const localNumber = '0' + cleaned.slice(2);
        return `${localNumber.slice(0, 4)}-${localNumber.slice(4, 7)}-${localNumber.slice(7)}`;
    }
    
    if (cleaned.length === 9) {
        const fullNumber = '09' + cleaned;
        return `${fullNumber.slice(0, 4)}-${fullNumber.slice(4, 7)}-${fullNumber.slice(7)}`;
    }
    
    if (cleaned.length === 11 && cleaned.startsWith('09')) {
        return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
    
    if (/^09\d{2}-\d{3}-\d{4}$/.test(phone)) {
        return phone;
    }
    
    return phone;
}

function getDepartmentAcronym(department) {
    if (!department) return '-';
    
    const acronyms = {
        'College of Informatics and Computing Sciences': 'CICS',
        'College of Engineering': 'COE',
        'College of Architecture, Fine Arts and Design': 'CAFAD',
        'College of Engineering Technology': 'CET'
    };
    
    return acronyms[department] || department;
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
        const url = new URL('/api/students', window.location.origin);
        url.searchParams.append('page', currentPage);
        url.searchParams.append('per_page', pageSize);
        
        if (currentSortColumn) {
            url.searchParams.append('sort_column', currentSortColumn);
            url.searchParams.append('sort_direction', currentSortDirection);
        }
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            currentStudents = data.students;
            totalRecords = data.pagination.total;
            totalPages = data.pagination.total_pages;
            currentPage = data.pagination.page;
            
            displayStudents(currentStudents);
            updateRecordCount(totalRecords);
            renderPagination();
        } else {
            const tableBody = document.getElementById('studentsTableBody');
            tableBody.innerHTML = '<tr><td colspan="9" class="loading-message">No students found</td></tr>';
            showAlert('Failed to load students', 'error');
        }
    } catch (error) {
        console.error('Error loading students:', error);
        const tableBody = document.getElementById('studentsTableBody');
        tableBody.innerHTML = '<tr><td colspan="9" class="loading-message">Error loading students. Please refresh the page.</td></tr>';
        showAlert('Error loading students: ' + error.message, 'error');
    }
}

function displayStudents(students) {
    const tableBody = document.getElementById('studentsTableBody');
    
    if (students.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="9" class="loading-message">No students found</td></tr>';
        return;
    }
    
    tableBody.innerHTML = students.map(student => {
        const lastName = capitalizeWords(student.last_name || '');
        const firstName = capitalizeWords(student.first_name || '');
        const middleName = student.middle_name ? capitalizeWords(student.middle_name) : '';
        const fullName = middleName ? `${lastName}, ${firstName}, ${middleName}` : `${lastName}, ${firstName}`;
        
        const phone = formatPhoneNumber(student.phone);
        
        const department = getDepartmentAcronym(student.department);
        
        const status = student.status || 'Unknown';
        const statusText = capitalizeWords(status);
        const statusClass = status.toLowerCase().replace(/\s+/g, '');
        
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
                <td><span class="status-badge status-${statusClass}">${statusText}</span></td>
            </tr>
        `;
    }).join('');
    
    updateSortIndicators();
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
        
        const studentForm = document.getElementById('studentForm');
        if (studentForm) {
            populateForm(student);
            
            const formPanel = document.getElementById('formPanel');
            const dashboardContainer = document.querySelector('.dashboard-container');
            if (formPanel && formPanel.classList.contains('collapsed')) {
                formPanel.classList.remove('collapsed');
                dashboardContainer.classList.remove('form-collapsed');
                localStorage.setItem('formPanelCollapsed', 'false');
            }
            
            const formPanelBody = formPanel.querySelector('.panel-body');
            if (formPanelBody) {
                formPanelBody.scrollTop = 0;
            }
        }
    }
}

function populateForm(student) {
    const originalStudentId = document.getElementById('originalStudentId');
    const studentId = document.getElementById('student_id');
    const firstName = document.getElementById('first_name');
    const middleName = document.getElementById('middle_name');
    const lastName = document.getElementById('last_name');
    const email = document.getElementById('email');
    const phone = document.getElementById('phone');
    const department = document.getElementById('department');
    const course = document.getElementById('course');
    const yearLevel = document.getElementById('year_level');
    const status = document.getElementById('status');
    
    if (!originalStudentId || !studentId || !firstName) return;
    
    originalStudentId.value = student.student_id;
    studentId.value = student.student_id;
    firstName.value = student.first_name;
    if (middleName) middleName.value = student.middle_name || '';
    if (lastName) lastName.value = student.last_name;
    if (email) email.value = student.email || '';
    if (phone) phone.value = formatPhoneNumber(student.phone || '');
    
    if (department) {
        department.value = student.department || '';
        
        const event = new Event('change');
        department.dispatchEvent(event);
    }
    
    if (course) {
        setTimeout(() => {
            course.value = student.course;
        }, 10);
    }
    
    if (yearLevel) yearLevel.value = student.year_level || '';
    if (status) status.value = student.status;
}

function clearForm() {
    const studentForm = document.getElementById('studentForm');
    if (studentForm) {
        studentForm.reset();
        document.getElementById('originalStudentId').value = '';
        document.getElementById('student_id').focus();
    }
    
    selectedStudentId = null;
    
    document.querySelectorAll('.data-table tbody tr').forEach(row => {
        row.classList.remove('selected');
    });
}

function deselectRow() {
    document.querySelectorAll('.data-table tbody tr').forEach(row => {
        row.classList.remove('selected');
    });
    selectedStudentId = null;
    
    const studentForm = document.getElementById('studentForm');
    if (studentForm) {
        studentForm.reset();
        const originalStudentId = document.getElementById('originalStudentId');
        if (originalStudentId) {
            originalStudentId.value = '';
        }
    }
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
    if (!data.student_id || !data.first_name || !data.last_name || !data.email || !data.course || !data.year_level) {
        showAlert('⚠️ Required Information Missing: Please complete all required fields marked with asterisk (*): Student ID, First Name, Last Name, Email, Course, and Year Level.', 'warning');
        return false;
    }

    if (!data.department) {
        showAlert('⚠️ College Department Required: Please select the appropriate college for this student\'s program from the dropdown menu.', 'warning');
        return false;
    }

    const studentIdPattern = /^\d{2}-\d{5}$/;
    if (!studentIdPattern.test(data.student_id)) {
        showAlert('❌ Invalid Student ID Format: Please enter in YY-NNNNN format (e.g., 25-00916), where YY represents the enrollment year and NNNNN is the 5-digit student number.', 'error');
        return false;
    }

    const namePattern = /^[a-zA-Z\s'-]+$/;
    
    if (!namePattern.test(data.first_name)) {
        showAlert('❌ Invalid First Name: Only letters, spaces, hyphens (-), and apostrophes (\') are allowed. Please remove any numbers or special characters. Examples: "John", "Mary-Anne", "O\'Connor"', 'error');
        return false;
    }

    if (data.middle_name && !namePattern.test(data.middle_name)) {
        showAlert('❌ Invalid Middle Name: Only letters, spaces, hyphens (-), and apostrophes (\') are allowed. Please remove any numbers or special characters.', 'error');
        return false;
    }

    if (!namePattern.test(data.last_name)) {
        showAlert('❌ Invalid Last Name: Only letters, spaces, hyphens (-), and apostrophes (\') are allowed. Please remove any numbers or special characters. Examples: "Smith", "De La Cruz", "O\'Brien"', 'error');
        return false;
    }

    if (data.first_name.length < 2 || data.first_name.length > 50) {
        showAlert(`❌ First Name Length Error: Must be between 2 and 50 characters. Current length: ${data.first_name.length} characters. Please adjust accordingly.`, 'error');
        return false;
    }

    if (data.last_name.length < 2 || data.last_name.length > 50) {
        showAlert(`❌ Last Name Length Error: Must be between 2 and 50 characters. Current length: ${data.last_name.length} characters. Please adjust accordingly.`, 'error');
        return false;
    }

    if (data.middle_name && data.middle_name.length > 50) {
        showAlert(`❌ Middle Name Length Error: Must not exceed 50 characters. Current length: ${data.middle_name.length} characters. Please shorten accordingly.`, 'error');
        return false;
    }

    if (!data.email) {
        showAlert('❌ Email Address Required: Please provide a valid email address for account creation and communication purposes.', 'error');
        return false;
    }
    
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(data.email)) {
        showAlert('❌ Invalid Email Format: Please enter a valid email address (e.g., student@batstate-u.edu.ph or student@example.com). Ensure it includes "@" and a domain name.', 'error');
        return false;
    }

    if (!data.phone) {
        showAlert('❌ Phone Number Required: Please provide a valid Philippine mobile number for emergency contact and verification.', 'error');
        return false;
    }
    
    const phonePattern = /^09\d{2}-\d{3}-\d{4}$/;
    if (!phonePattern.test(data.phone)) {
        showAlert('❌ Invalid Phone Format: Please enter a Philippine mobile number in format 09XX-XXX-XXXX (e.g., 0912-345-6789, 0917-123-4567, 0998-765-4321). Use dashes to separate digit groups.', 'error');
        return false;
    }

    if (!data.course) {
        showAlert('⚠️ Course Selection Required: Please select the student\'s enrolled program from the dropdown menu (e.g., BS Computer Science, BS Civil Engineering).', 'error');
        return false;
    }

    if (!data.year_level) {
        showAlert('⚠️ Year Level Required: Please select the student\'s current academic year (1st Year, 2nd Year, 3rd Year, or 4th Year) from the dropdown menu.', 'error');
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
    
    if (!student) {
        showAlert('Student not found', 'error');
        return;
    }
    
    showDeleteConfirmation(student, async () => {
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
    });
}

function showDeleteConfirmation(student, onConfirm) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    
    const fullName = `${capitalizeWords(student.first_name)} ${student.middle_name ? capitalizeWords(student.middle_name) + ' ' : ''}${capitalizeWords(student.last_name)}`;
    
    modal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-header">
                <div class="modal-icon-warning">⚠️</div>
                <h3>Confirm Deletion</h3>
            </div>
            <div class="modal-body">
                <p class="modal-warning-text">You are about to permanently delete this student record:</p>
                <div class="modal-student-info">
                    <div class="info-row">
                        <span class="info-label">Student ID:</span>
                        <span class="info-value">${student.student_id}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Name:</span>
                        <span class="info-value">${fullName}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Course:</span>
                        <span class="info-value">${student.course}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Year Level:</span>
                        <span class="info-value">${student.year_level}</span>
                    </div>
                </div>
                <p class="modal-danger-text">⚠️ This action cannot be undone!</p>
            </div>
            <div class="modal-footer">
                <button class="btn-modal btn-cancel" onclick="closeDeleteModal()">Cancel</button>
                <button class="btn-modal btn-delete" onclick="confirmDelete()">Delete Student</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    window.currentDeleteConfirmation = onConfirm;
    
    requestAnimationFrame(() => {
        modal.classList.add('show');
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeDeleteModal();
        }
    });
    
    const escHandler = (e) => {
        if (e.key === 'Escape') {
            closeDeleteModal();
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler);
}

function closeDeleteModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
            window.currentDeleteConfirmation = null;
        }, 150);
    }
}

function confirmDelete() {
    if (window.currentDeleteConfirmation) {
        window.currentDeleteConfirmation();
        closeDeleteModal();
    }
}

let searchTimeout;
async function searchStudents() {
    clearTimeout(searchTimeout);
    
    const searchTerm = document.getElementById('searchInput').value.trim();
    currentSearchTerm = searchTerm;
    
    searchTimeout = setTimeout(async () => {
        if (!searchTerm) {
            currentSearchTerm = '';
            loadStudents();
            return;
        }
        
        try {
            const url = new URL('/api/students/search', window.location.origin);
            url.searchParams.append('query', searchTerm);
            
            if (currentSortColumn) {
                url.searchParams.append('sort_column', currentSortColumn);
                url.searchParams.append('sort_direction', currentSortDirection);
            }
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.success) {
                currentStudents = data.students;
                totalRecords = currentStudents.length;
                totalPages = 1;
                currentPage = 1;
                displayStudents(currentStudents);
                updateRecordCount(currentStudents.length, true);
                renderPagination();
            }
        } catch (error) {
            console.error('Error searching students:', error);
            showAlert('Error searching students', 'error');
        }
    }, 300);
}

function handleSearchOrRefresh() {
    searchStudents();
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
    if (container) {
        const firstChild = container.firstChild;
        container.insertBefore(alert, firstChild);
    } else {
        document.body.insertBefore(alert, document.body.firstChild);
    }
    
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

document.addEventListener('click', function(e) {
    const clickedRow = e.target.closest('.data-table tbody tr');
    const clickedFormPanel = e.target.closest('.form-panel');
    const clickedButton = e.target.closest('button');
    const clickedInput = e.target.closest('input, select, textarea');
    
    if (!clickedRow && !clickedFormPanel && !clickedButton && !clickedInput && selectedStudentId) {
        deselectRow();
    }
});

const phoneInput = document.getElementById('phone');
if (phoneInput) {
    phoneInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        
        if (value.length > 11) {
            value = value.slice(0, 11);
        }
        
        if (value.length >= 4) {
            value = value.slice(0, 4) + '-' + value.slice(4);
        }
        if (value.length >= 8) {
            value = value.slice(0, 8) + '-' + value.slice(8);
        }
        
        e.target.value = value;
    });
    
    phoneInput.addEventListener('keypress', function(e) {
        const char = String.fromCharCode(e.which);
        if (!/[0-9-]/.test(char)) {
            e.preventDefault();
        }
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        loadStudents();
        initResizableColumns();
    });
} else {
    loadStudents();
    initResizableColumns();
}

function initResizableColumns() {
    const table = document.querySelector('.data-table');
    if (!table) return;
    
    const thead = table.querySelector('thead');
    if (!thead) return;
    
    const ths = thead.querySelectorAll('th');
    let currentResizer = null;
    let currentTh = null;
    let startX = 0;
    let startWidth = 0;
    
    ths.forEach((th, index) => {
        if (index < ths.length - 1) {
            const resizer = document.createElement('div');
            resizer.className = 'column-resizer';
            th.style.position = 'relative';
            th.appendChild(resizer);
            
            resizer.addEventListener('mousedown', function(e) {
                e.preventDefault();
                currentResizer = resizer;
                currentTh = th;
                startX = e.pageX;
                startWidth = th.offsetWidth;
                
                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
                
                th.classList.add('resizing');
                document.body.classList.add('resizing-column');
                document.body.style.cursor = 'col-resize';
                document.body.style.userSelect = 'none';
            });
        }
    });
    
    function handleMouseMove(e) {
        if (currentTh) {
            const diff = e.pageX - startX;
            const newWidth = startWidth + diff;
            
            if (newWidth >= 50) {
                const percentage = (newWidth / table.offsetWidth) * 100;
                const columnIndex = Array.from(ths).indexOf(currentTh) + 1;
                
                currentTh.style.width = percentage + '%';
                
                const rows = table.querySelectorAll('tbody tr');
                rows.forEach(row => {
                    const cell = row.querySelector(`td:nth-child(${columnIndex})`);
                    if (cell) {
                        cell.style.width = percentage + '%';
                    }
                });
                
                saveColumnWidths();
            }
        }
    }
    
    function handleMouseUp() {
        if (currentTh) {
            currentTh.classList.remove('resizing');
        }
        document.body.classList.remove('resizing-column');
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        currentResizer = null;
        currentTh = null;
    }
}

function renderPagination() {
    const paginationContainer = document.getElementById('paginationContainer');
    if (!paginationContainer) return;
    
    if (totalPages <= 1) {
        paginationContainer.style.display = 'none';
        return;
    }
    
    paginationContainer.style.display = 'flex';
    
    let paginationHTML = `
        <button class="pagination-btn" onclick="changePage(1)" ${currentPage === 1 ? 'disabled' : ''} title="First Page">
            ⏮ First
        </button>
        <button class="pagination-btn" onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''} title="Previous Page">
            ◀ Prev
        </button>
    `;
    
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    
    if (endPage - startPage < maxVisible - 1) {
        startPage = Math.max(1, endPage - maxVisible + 1);
    }
    
    if (startPage > 1) {
        paginationHTML += `<button class="pagination-btn" onclick="changePage(1)">1</button>`;
        if (startPage > 2) {
            paginationHTML += `<span class="pagination-ellipsis">...</span>`;
        }
    }
    
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <button class="pagination-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">
                ${i}
            </button>
        `;
    }
    
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationHTML += `<span class="pagination-ellipsis">...</span>`;
        }
        paginationHTML += `<button class="pagination-btn" onclick="changePage(${totalPages})">${totalPages}</button>`;
    }
    
    paginationHTML += `
        <button class="pagination-btn" onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''} title="Next Page">
            Next ▶
        </button>
        <button class="pagination-btn" onclick="changePage(${totalPages})" ${currentPage === totalPages ? 'disabled' : ''} title="Last Page">
            Last ⏭
        </button>
        <span class="pagination-info">Page ${currentPage} of ${totalPages}</span>
    `;
    
    paginationContainer.innerHTML = paginationHTML;
}

function changePage(page) {
    if (page < 1 || page > totalPages || page === currentPage) return;
    
    currentPage = page;
    
    if (currentSearchTerm) {
        searchStudents();
    } else {
        loadStudents();
    }
    
    const tableContainer = document.querySelector('.table-container');
    if (tableContainer) {
        tableContainer.scrollTop = 0;
    }
}

function changePageSize(newSize) {
    pageSize = parseInt(newSize);
    currentPage = 1;
    
    if (currentSearchTerm) {
        searchStudents();
    } else {
        loadStudents();
    }
}

function sortTable(column) {
    if (currentSortColumn === column) {
        currentSortDirection = currentSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        currentSortColumn = column;
        currentSortDirection = 'asc';
    }
    
    currentPage = 1;
    
    if (currentSearchTerm) {
        searchStudents();
    } else {
        loadStudents();
    }
}

function updateSortIndicators() {
    document.querySelectorAll('.data-table th').forEach(th => {
        th.classList.remove('sort-asc', 'sort-desc');
    });
    
    if (currentSortColumn) {
        const th = document.querySelector(`th[data-column="${currentSortColumn}"]`);
        if (th) {
            th.classList.add(`sort-${currentSortDirection}`);
        }
    }
}
