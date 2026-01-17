let currentStudents = [];
let selectedStudentId = null;
let currentPage = 1;
let pageSize = 15;
let totalRecords = 0;
let totalPages = 0;
let currentSearchTerm = '';
let currentSortColumn = null;
let currentSortDirection = 'asc';

// Helper function to capitalize words properly
function capitalizeWords(str) {
    if (!str) return '';
    return str.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
}

// Helper function to format phone number (Philippine format: 09XX-XXX-XXXX)
function formatPhoneNumber(phone) {
    if (!phone) return '-';
    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Handle international format +639XXXXXXXXX (12 digits starting with 63)
    if (cleaned.length === 12 && cleaned.startsWith('63')) {
        const localNumber = '0' + cleaned.slice(2); // Convert 639XX to 09XX
        return `${localNumber.slice(0, 4)}-${localNumber.slice(4, 7)}-${localNumber.slice(7)}`;
    }
    
    // Handle +123456789 or 123456789 format (9 digits) - prepend '09' prefix
    if (cleaned.length === 9) {
        const fullNumber = '09' + cleaned;
        return `${fullNumber.slice(0, 4)}-${fullNumber.slice(4, 7)}-${fullNumber.slice(7)}`;
    }
    
    // Format as 09XX-XXX-XXXX for 11 digits starting with 09
    if (cleaned.length === 11 && cleaned.startsWith('09')) {
        return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
    
    // If already formatted correctly, return as-is
    if (/^09\d{2}-\d{3}-\d{4}$/.test(phone)) {
        return phone;
    }
    
    // Return original if it doesn't match expected format
    return phone;
}

// Helper function to get department acronym
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
        
        // Add sort parameters if set
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
        // Format name as "Last Name, First Name, Middle Name"
        const lastName = capitalizeWords(student.last_name || '');
        const firstName = capitalizeWords(student.first_name || '');
        const middleName = student.middle_name ? capitalizeWords(student.middle_name) : '';
        const fullName = middleName ? `${lastName}, ${firstName}, ${middleName}` : `${lastName}, ${firstName}`;
        
        // Format and display phone number with dashes (09XX-XXX-XXXX)
        const phone = formatPhoneNumber(student.phone);
        
        // Get department acronym
        const department = getDepartmentAcronym(student.department);
        
        // Capitalize status and handle null/undefined
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
    // Remove selection from all rows
    document.querySelectorAll('.data-table tbody tr').forEach(row => {
        row.classList.remove('selected');
    });
    
    // Add selection to clicked row
    const selectedRow = document.querySelector(`tr[data-student-id="${studentId}"]`);
    if (selectedRow) {
        selectedRow.classList.add('selected');
    }
    
    const student = currentStudents.find(s => s.student_id === studentId);
    
    if (student) {
        selectedStudentId = studentId;
        
        // Only populate form if form exists (admin role)
        const studentForm = document.getElementById('studentForm');
        if (studentForm) {
            populateForm(student);
            
            // Ensure form panel is visible for admin users
            const formPanel = document.getElementById('formPanel');
            const dashboardContainer = document.querySelector('.dashboard-container');
            if (formPanel && formPanel.classList.contains('collapsed')) {
                formPanel.classList.remove('collapsed');
                dashboardContainer.classList.remove('form-collapsed');
                localStorage.setItem('formPanelCollapsed', 'false');
            }
            
            // Scroll form to top for better visibility
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
    if (phone) phone.value = student.phone || '';
    
    // Set department first to trigger course population
    if (department) {
        department.value = student.department || '';
        
        // Trigger change event to populate courses
        const event = new Event('change');
        department.dispatchEvent(event);
    }
    
    // Set course after department courses are populated
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
    
    // Clear form if it exists (admin role)
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

    // Phone validation (required - Philippine mobile format: 09XX-XXX-XXXX)
    if (!data.phone) {
        showAlert('Phone number is required', 'error');
        return false;
    }
    
    const phonePattern = /^09\d{2}-\d{3}-\d{4}$/;
    if (!phonePattern.test(data.phone)) {
        showAlert('Phone number must be in format 09XX-XXX-XXXX (e.g., 0912-345-6789)', 'error');
        return false;
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

// Deselect row when clicking outside the table
document.addEventListener('click', function(e) {
    // Check if click is outside table rows
    const clickedRow = e.target.closest('.data-table tbody tr');
    const clickedFormPanel = e.target.closest('.form-panel');
    const clickedButton = e.target.closest('button');
    const clickedInput = e.target.closest('input, select, textarea');
    
    // If clicked outside table rows and not on form elements, deselect
    if (!clickedRow && !clickedFormPanel && !clickedButton && !clickedInput && selectedStudentId) {
        deselectRow();
    }
});

// Auto-format phone number as user types (09XX-XXX-XXXX)
const phoneInput = document.getElementById('phone');
if (phoneInput) {
    phoneInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
        
        // Limit to 11 digits
        if (value.length > 11) {
            value = value.slice(0, 11);
        }
        
        // Format as 09XX-XXX-XXXX
        if (value.length >= 4) {
            value = value.slice(0, 4) + '-' + value.slice(4);
        }
        if (value.length >= 8) {
            value = value.slice(0, 8) + '-' + value.slice(8);
        }
        
        e.target.value = value;
    });
    
    // Prevent non-numeric input except dashes
    phoneInput.addEventListener('keypress', function(e) {
        const char = String.fromCharCode(e.which);
        if (!/[0-9-]/.test(char)) {
            e.preventDefault();
        }
    });
}

// Ensure loadStudents is called when DOM is ready (fallback)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        loadStudents();
        initResizableColumns();
    });
} else {
    // DOM is already ready, call loadStudents immediately
    loadStudents();
    initResizableColumns();
}

// ============ RESIZABLE COLUMNS FEATURE (Excel-like) ============
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
    
    // Add resize handles to each column header (except last one)
    ths.forEach((th, index) => {
        if (index < ths.length - 1) { // Skip last column
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
                
                // Add resizing class for visual feedback
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
            
            // Minimum column width of 50px
            if (newWidth >= 50) {
                const percentage = (newWidth / table.offsetWidth) * 100;
                const columnIndex = Array.from(ths).indexOf(currentTh) + 1;
                
                // Apply width to both th and corresponding td cells
                currentTh.style.width = percentage + '%';
                
                // Update all td cells in this column
                const rows = table.querySelectorAll('tbody tr');
                rows.forEach(row => {
                    const cell = row.querySelector(`td:nth-child(${columnIndex})`);
                    if (cell) {
                        cell.style.width = percentage + '%';
                    }
                });
                
                // Save column widths to localStorage
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
    
    // Save column widths to localStorage
    function saveColumnWidths() {
        const widths = {};
        ths.forEach((th, index) => {
            widths[index] = th.style.width || '';
        });
        localStorage.setItem('tableColumnWidths', JSON.stringify(widths));
    }
    
    // Load saved column widths from localStorage
    function loadColumnWidths() {
        const savedWidths = localStorage.getItem('tableColumnWidths');
        if (savedWidths) {
            try {
                const widths = JSON.parse(savedWidths);
                ths.forEach((th, index) => {
                    if (widths[index]) {
                        th.style.width = widths[index];
                        
                        // Apply to corresponding td cells
                        const columnIndex = index + 1;
                        const rows = table.querySelectorAll('tbody tr');
                        rows.forEach(row => {
                            const cell = row.querySelector(`td:nth-child(${columnIndex})`);
                            if (cell) {
                                cell.style.width = widths[index];
                            }
                        });
                    }
                });
            } catch (e) {
                console.error('Error loading column widths:', e);
            }
        }
    }
    
    // Load saved widths on init
    loadColumnWidths();
}

// ==================== PAGINATION FUNCTIONS ====================

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
    
    // Page numbers with smart ellipsis
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    
    // Adjust start if we're near the end
    if (endPage - startPage < maxVisible - 1) {
        startPage = Math.max(1, endPage - maxVisible + 1);
    }
    
    // Show first page + ellipsis if needed
    if (startPage > 1) {
        paginationHTML += `<button class="pagination-btn" onclick="changePage(1)">1</button>`;
        if (startPage > 2) {
            paginationHTML += `<span class="pagination-ellipsis">...</span>`;
        }
    }
    
    // Show page numbers
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <button class="pagination-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">
                ${i}
            </button>
        `;
    }
    
    // Show ellipsis + last page if needed
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
    
    // Scroll to top of table
    const tableContainer = document.querySelector('.table-container');
    if (tableContainer) {
        tableContainer.scrollTop = 0;
    }
}

function changePageSize(newSize) {
    pageSize = parseInt(newSize);
    currentPage = 1; // Reset to first page
    
    if (currentSearchTerm) {
        searchStudents();
    } else {
        loadStudents();
    }
}

// ==================== SORTING FUNCTIONS ====================

function sortTable(column) {
    // Toggle direction if same column, otherwise start with ascending
    if (currentSortColumn === column) {
        currentSortDirection = currentSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        currentSortColumn = column;
        currentSortDirection = 'asc';
    }
    
    // Reset to first page when sorting
    currentPage = 1;
    
    // Reload data from server with sort parameters
    if (currentSearchTerm) {
        searchStudents();
    } else {
        loadStudents();
    }
}

function updateSortIndicators() {
    // Remove all active classes
    document.querySelectorAll('.data-table th').forEach(th => {
        th.classList.remove('sort-asc', 'sort-desc');
    });
    
    // Add active class to current sorted column
    if (currentSortColumn) {
        const th = document.querySelector(`th[data-column="${currentSortColumn}"]`);
        if (th) {
            th.classList.add(`sort-${currentSortDirection}`);
        }
    }
}
