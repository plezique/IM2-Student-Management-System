// ========== GLOBAL VARIABLES ==========
let currentUpdateId = null;
let currentDeleteId = null;

// ========== COMMON/UTILITY FUNCTIONS ==========

// Utility function for showing alerts
function showAlert(containerId, message, type) {
    const alertContainer = document.getElementById(containerId);
    if (!alertContainer) return;
    
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    
    const icons = {
        'success': 'check-circle',
        'danger': 'exclamation-circle',
        'warning': 'exclamation-triangle',
        'info': 'info-circle'
    };
    
    alertDiv.innerHTML = `
        <i class="fas fa-${icons[type] || 'info-circle'} me-2"></i>
        ${message}
    `;
    alertContainer.innerHTML = '';
    alertContainer.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

// ========== ADMIN PAGE FUNCTIONS ==========

// Update statistics
function updateStatistics() {
    const students = JSON.parse(localStorage.getItem('students') || '[]');
    const totalStudentsEl = document.getElementById('totalStudents');
    const totalUsersEl = document.getElementById('totalUsers');
    
    if (totalStudentsEl) {
        totalStudentsEl.textContent = students.length;
    }
    if (totalUsersEl) {
        // For total users, you can set this based on your user management system
        totalUsersEl.textContent = 1; // Default to 1 admin user
    }
}

// Load and display students (Admin)
function loadStudents() {
    const students = JSON.parse(localStorage.getItem('students') || '[]');
    const tbody = document.getElementById('studentsTableBody');
    const emptyState = document.getElementById('emptyState');
    
    if (!tbody) return;
    
    if (students.length === 0) {
        tbody.innerHTML = '';
        if (emptyState) emptyState.style.display = 'block';
        return;
    }
    
    if (emptyState) emptyState.style.display = 'none';
    tbody.innerHTML = students.map(student => {
        const courseInfo = `${student.course || 'N/A'} ${student.year || ''}${student.block || ''}`;
        const fullName = `${student.firstName || ''}${student.middleInitial ? ' ' + student.middleInitial + '.' : ''} ${student.lastName || ''}`;
        
        return `
            <tr>
                <td class="student-name">${fullName}</td>
                <td class="course-info">${courseInfo}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-update" onclick="openUpdateModal('${student.id}')">
                            Update
                        </button>
                        <button class="btn-delete" onclick="deleteStudent('${student.id}')">
                            Delete
                        </button>
                    </div>
                </td>
                <td>
                    <button class="btn-view" onclick="viewStudentDetails('${student.id}')">
                        View
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    
    updateStatistics();
}

// Filter students - works for both Admin and Student pages
function filterStudents() {
    // Check if we're on admin page (has action buttons) or student page (has status badges)
    const isAdminPage = document.getElementById('totalStudents') !== null;
    
    if (isAdminPage) {
        filterStudentsAdmin();
    } else {
        filterStudentsStudent();
    }
}

// Filter students (Admin)
function filterStudentsAdmin() {
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const courseFilter = document.getElementById('courseFilter')?.value || '';
    const students = JSON.parse(localStorage.getItem('students') || '[]');
    const tbody = document.getElementById('studentsTableBody');
    const emptyState = document.getElementById('emptyState');
    
    if (!tbody) return;
    
    let filtered = students.filter(student => {
        const fullName = `${student.firstName || ''}${student.middleInitial ? ' ' + student.middleInitial + '.' : ''} ${student.lastName || ''}`.toLowerCase();
        const matchesSearch = !searchTerm || fullName.includes(searchTerm) || 
                            (student.studentId && student.studentId.toLowerCase().includes(searchTerm));
        const matchesCourse = !courseFilter || student.course === courseFilter;
        return matchesSearch && matchesCourse;
    });
    
    if (filtered.length === 0) {
        tbody.innerHTML = '';
        if (emptyState) emptyState.style.display = 'block';
        return;
    }
    
    if (emptyState) emptyState.style.display = 'none';
    tbody.innerHTML = filtered.map(student => {
        const courseInfo = `${student.course || 'N/A'} ${student.year || ''}${student.block || ''}`;
        const fullName = `${student.firstName || ''}${student.middleInitial ? ' ' + student.middleInitial + '.' : ''} ${student.lastName || ''}`;
        
        return `
            <tr>
                <td class="student-name">${fullName}</td>
                <td class="course-info">${courseInfo}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-update" onclick="openUpdateModal('${student.id}')">
                            Update
                        </button>
                        <button class="btn-delete" onclick="deleteStudent('${student.id}')">
                            Delete
                        </button>
                    </div>
                </td>
                <td>
                    <button class="btn-view" onclick="viewStudentDetails('${student.id}')">
                        View
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Update course filter dropdown
function updateCourseFilter() {
    const students = JSON.parse(localStorage.getItem('students') || '[]');
    const courses = [...new Set(students.map(s => s.course).filter(Boolean))];
    const filterSelect = document.getElementById('courseFilter');
    
    if (!filterSelect) return;
    
    filterSelect.innerHTML = '<option value="">All Courses</option>' + 
        courses.map(course => `<option value="${course}">${course}</option>`).join('');
    
    // Re-initialize dropdown arrows after updating
    setTimeout(() => {
        initDropdownArrows();
    }, 50);
}

// Add student
function submitAddStudent() {
    const form = document.getElementById('addStudentForm');
    if (!form) return;
    
    // Get all required field values
    const firstName = document.getElementById('addFirstName')?.value.trim();
    const lastName = document.getElementById('addLastName')?.value.trim();
    const studentId = document.getElementById('addStudentId')?.value.trim();
    const dateOfBirth = document.getElementById('addDateOfBirth')?.value;
    const gender = document.getElementById('addGender')?.value;
    const course = document.getElementById('addCourse')?.value;
    const year = document.getElementById('addYear')?.value;
    const block = document.getElementById('addBlock')?.value.trim();
    const status = document.getElementById('addStatus')?.value;
    const address = document.getElementById('addAddress')?.value.trim();
    
    // Validate all required fields
    const missingFields = [];
    
    if (!firstName) missingFields.push('First Name');
    if (!lastName) missingFields.push('Last Name');
    if (!studentId) missingFields.push('Student ID');
    if (!dateOfBirth) missingFields.push('Date of Birth');
    if (!gender) missingFields.push('Gender');
    if (!course) missingFields.push('Course');
    if (!year) missingFields.push('Year Level');
    if (!block) missingFields.push('Block');
    if (!status) missingFields.push('Status');
    if (!address) missingFields.push('Address');
    
    // If any required fields are missing, show error and prevent submission
    if (missingFields.length > 0) {
        const errorMessage = `Please fill in all required fields: ${missingFields.join(', ')}`;
        showAlert('add-alert-container', errorMessage, 'danger');
        return;
    }
    
    const formData = new FormData(form);
    const studentData = {};
    formData.forEach((value, key) => {
        studentData[key] = value;
    });
    
    const students = JSON.parse(localStorage.getItem('students') || '[]');
    if (students.some(s => s.studentId === studentData.studentId)) {
        showAlert('add-alert-container', 'Student ID already exists!', 'danger');
        return;
    }
    
    students.push({
        id: Date.now(),
        ...studentData
    });
    localStorage.setItem('students', JSON.stringify(students));
    
    showAlert('add-alert-container', 'Student record added successfully!', 'success');
    form.reset();
    
    setTimeout(() => {
        const modal = bootstrap.Modal.getInstance(document.getElementById('addStudentModal'));
        if (modal) {
            modal.hide();
        }
        // Check which page we're on and call appropriate function
        if (document.getElementById('totalStudents')) {
            loadStudents();
        } else {
            loadStudentsStudent();
        }
        updateCourseFilter();
    }, 1500);
}

// Open update modal (Admin)
function openUpdateModal(studentId) {
    const students = JSON.parse(localStorage.getItem('students') || '[]');
    const student = students.find(s => s.id == studentId);
    
    if (!student) {
        showAlert('alert-container', 'Student not found.', 'danger');
        return;
    }
    
    currentUpdateId = student.id;
    const updateStudentId = document.getElementById('updateStudentId');
    const updateStudentIdField = document.getElementById('updateStudentIdField');
    const updateFirstName = document.getElementById('updateFirstName');
    const updateMiddleInitial = document.getElementById('updateMiddleInitial');
    const updateLastName = document.getElementById('updateLastName');
    const updateEmail = document.getElementById('updateEmail');
    const updatePhone = document.getElementById('updatePhone');
    const updateDateOfBirth = document.getElementById('updateDateOfBirth');
    const updateGender = document.getElementById('updateGender');
    const updateCourse = document.getElementById('updateCourse');
    const updateYear = document.getElementById('updateYear');
    const updateBlock = document.getElementById('updateBlock');
    const updateStatus = document.getElementById('updateStatus');
    const updateAddress = document.getElementById('updateAddress');
    
    if (updateStudentId) updateStudentId.value = student.id;
    if (updateStudentIdField) updateStudentIdField.value = student.studentId || '';
    if (updateFirstName) updateFirstName.value = student.firstName || '';
    if (updateMiddleInitial) updateMiddleInitial.value = student.middleInitial || '';
    if (updateLastName) updateLastName.value = student.lastName || '';
    if (updateEmail) updateEmail.value = student.email || '';
    if (updatePhone) updatePhone.value = student.phone || '';
    if (updateDateOfBirth) updateDateOfBirth.value = student.dateOfBirth || '';
    if (updateGender) updateGender.value = student.gender || '';
    if (updateCourse) updateCourse.value = student.course || '';
    if (updateYear) updateYear.value = student.year || '';
    if (updateBlock) updateBlock.value = student.block || '';
    if (updateStatus) updateStatus.value = student.status || 'Regular';
    if (updateAddress) updateAddress.value = student.address || '';
    
    const modal = new bootstrap.Modal(document.getElementById('updateStudentModal'));
    modal.show();
}

// Submit update (Admin)
function submitUpdateStudent() {
    if (!currentUpdateId) {
        showAlert('update-alert-container', 'No student selected for update.', 'warning');
        return;
    }
    
    const form = document.getElementById('updateStudentForm');
    if (!form) return;
    
    const formData = new FormData(form);
    const updatedData = {};
    formData.forEach((value, key) => {
        if (key !== 'id') {
            updatedData[key] = value;
        }
    });
    
    let students = JSON.parse(localStorage.getItem('students') || '[]');
    const index = students.findIndex(s => s.id === currentUpdateId);
    
    if (index !== -1) {
        students[index] = {
            ...students[index],
            ...updatedData
        };
        localStorage.setItem('students', JSON.stringify(students));
        showAlert('update-alert-container', 'Student record updated successfully!', 'success');
        
        setTimeout(() => {
            const modal = bootstrap.Modal.getInstance(document.getElementById('updateStudentModal'));
            if (modal) {
                modal.hide();
            }
            if (typeof loadStudents === 'function') loadStudents();
            updateCourseFilter();
        }, 1500);
    } else {
        showAlert('update-alert-container', 'Error updating student record.', 'danger');
    }
}

// Delete student - show confirmation modal (Admin)
function deleteStudent(studentId) {
    currentDeleteId = studentId;
    const modal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
    modal.show();
}

// Confirm and execute deletion (Admin)
function confirmDelete() {
    if (!currentDeleteId) {
        return;
    }
    
    let students = JSON.parse(localStorage.getItem('students') || '[]');
    students = students.filter(s => s.id != currentDeleteId);
    localStorage.setItem('students', JSON.stringify(students));
    
    showAlert('alert-container', 'Student record deleted successfully!', 'success');
    if (typeof loadStudents === 'function') loadStudents();
    if (typeof loadStudentsStudent === 'function') loadStudentsStudent();
    updateCourseFilter();
    
    // Close modal and reset
    const modal = bootstrap.Modal.getInstance(document.getElementById('deleteConfirmModal'));
    if (modal) {
        modal.hide();
    }
    currentDeleteId = null;
}

// View student details (Admin)
function viewStudentDetails(studentId) {
    const students = JSON.parse(localStorage.getItem('students') || '[]');
    const student = students.find(s => s.id == studentId);
    
    if (!student) {
        showAlert('alert-container', 'Student not found.', 'danger');
        return;
    }
    
    const detailsContent = document.getElementById('studentDetailsContent');
    if (!detailsContent) return;
    
    detailsContent.innerHTML = `
        <div class="student-details">
            <h5><i class="fas fa-user-circle me-2"></i>Student Information</h5>
            <div class="info-item">
                <strong>Student ID:</strong>
                <span>${student.studentId || 'N/A'}</span>
            </div>
            <div class="info-item">
                <strong>Name:</strong>
                <span>${student.firstName || ''}${student.middleInitial ? ' ' + student.middleInitial + '.' : ''} ${student.lastName || ''}</span>
            </div>
            <div class="info-item">
                <strong>Email:</strong>
                <span>${student.email || 'N/A'}</span>
            </div>
            <div class="info-item">
                <strong>Phone:</strong>
                <span>${student.phone || 'N/A'}</span>
            </div>
            <div class="info-item">
                <strong>Date of Birth:</strong>
                <span>${student.dateOfBirth || 'N/A'}</span>
            </div>
            <div class="info-item">
                <strong>Gender:</strong>
                <span>${student.gender || 'N/A'}</span>
            </div>
            <div class="info-item">
                <strong>Course:</strong>
                <span>${student.course || 'N/A'}</span>
            </div>
            <div class="info-item">
                <strong>Year Level:</strong>
                <span>${student.year ? 'Year ' + student.year : 'N/A'}</span>
            </div>
            <div class="info-item">
                <strong>Block:</strong>
                <span>${student.block || 'N/A'}</span>
            </div>
            <div class="info-item">
                <strong>Status:</strong>
                <span>${student.status || 'Regular'}</span>
            </div>
            <div class="info-item">
                <strong>Address:</strong>
                <span>${student.address || 'N/A'}</span>
            </div>
        </div>
    `;
    
    const modal = new bootstrap.Modal(document.getElementById('viewStudentModal'));
    modal.show();
}

// ========== STUDENT PAGE FUNCTIONS ==========

// Load and display students (Student Portal)
function loadStudentsStudent() {
    const students = JSON.parse(localStorage.getItem('students') || '[]');
    const tbody = document.getElementById('studentsTableBody');
    const emptyState = document.getElementById('emptyState');
    
    if (!tbody) return;
    
    if (students.length === 0) {
        tbody.innerHTML = '';
        if (emptyState) emptyState.style.display = 'block';
        return;
    }
    
    if (emptyState) emptyState.style.display = 'none';
    tbody.innerHTML = students.map(student => {
        let statusClass = 'status-regular';
        if (student.status === 'Graduate') {
            statusClass = 'status-graduate';
        } else if (student.status === 'Irregular') {
            statusClass = 'status-irregular';
        }
        const courseInfo = `${student.course || 'N/A'} ${student.year || ''}${student.block || ''}`;
        const fullName = `${student.firstName || ''}${student.middleInitial ? ' ' + student.middleInitial + '.' : ''} ${student.lastName || ''}`;
        
        return `
            <tr>
                <td class="student-name">${fullName}</td>
                <td class="course-info">${courseInfo}</td>
                <td>
                    <span class="status-badge ${statusClass}">${student.status || 'Regular'}</span>
                </td>
                <td>
                    <button class="btn-view" onclick="viewStudentDetails('${student.id}')">
                        View
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Filter students (Student Portal)
function filterStudentsStudent() {
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const courseFilter = document.getElementById('courseFilter')?.value || '';
    const students = JSON.parse(localStorage.getItem('students') || '[]');
    const tbody = document.getElementById('studentsTableBody');
    const emptyState = document.getElementById('emptyState');
    
    if (!tbody) return;
    
    let filtered = students.filter(student => {
        const fullName = `${student.firstName || ''}${student.middleInitial ? ' ' + student.middleInitial + '.' : ''} ${student.lastName || ''}`.toLowerCase();
        const matchesSearch = !searchTerm || fullName.includes(searchTerm) || 
                            (student.studentId && student.studentId.toLowerCase().includes(searchTerm));
        const matchesCourse = !courseFilter || student.course === courseFilter;
        return matchesSearch && matchesCourse;
    });
    
    if (filtered.length === 0) {
        tbody.innerHTML = '';
        if (emptyState) emptyState.style.display = 'block';
        return;
    }
    
    if (emptyState) emptyState.style.display = 'none';
    tbody.innerHTML = filtered.map(student => {
        let statusClass = 'status-regular';
        if (student.status === 'Graduate') {
            statusClass = 'status-graduate';
        } else if (student.status === 'Irregular') {
            statusClass = 'status-irregular';
        }
        const courseInfo = `${student.course || 'N/A'} ${student.year || ''}${student.block || ''}`;
        const fullName = `${student.firstName || ''}${student.middleInitial ? ' ' + student.middleInitial + '.' : ''} ${student.lastName || ''}`;
        
        return `
            <tr>
                <td class="student-name">${fullName}</td>
                <td class="course-info">${courseInfo}</td>
                <td>
                    <span class="status-badge ${statusClass}">${student.status || 'Regular'}</span>
                </td>
                <td>
                    <button class="btn-view" onclick="viewStudentDetails('${student.id}')">
                        View
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// ========== INDEX PAGE FUNCTIONS ==========

// Initialize hero section stars (Index)
function initHeroStars() {
    const heroSection = document.getElementById('hero-section');
    if (!heroSection) return;
    
    const starCount = 40;
    
    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        
        const size = Math.random() * 3 + 1;
        star.style.width = size + 'px';
        star.style.height = size + 'px';
        
        star.style.top = Math.random() * 100 + '%';
        star.style.left = Math.random() * 100 + '%';
        
        star.style.animationDelay = Math.random() * 3 + 's';
        
        heroSection.appendChild(star);
    }
}

// ========== DROPDOWN ARROW ROTATION ==========

// Handle dropdown arrow rotation for all select elements
function initDropdownArrows() {
    const selects = document.querySelectorAll('.filter-select, .form-select');
    
    selects.forEach(select => {
        // Skip if already initialized
        if (select.dataset.arrowInitialized === 'true') {
            return;
        }
        select.dataset.arrowInitialized = 'true';
        
        let blurTimeout = null;
        
        // Function to clear blur timeout
        function clearBlurTimeout() {
            if (blurTimeout) {
                clearTimeout(blurTimeout);
                blurTimeout = null;
            }
        }
        
        // Function to set arrow to open state
        function setArrowOpen() {
            clearBlurTimeout();
            select.classList.add('select-open');
        }
        
        // Function to set arrow to closed state (with delay)
        function setArrowClosed() {
            clearBlurTimeout();
            blurTimeout = setTimeout(() => {
                // Only close if select doesn't have focus
                if (document.activeElement !== select) {
                    select.classList.remove('select-open');
                }
            }, 200);
        }
        
        // On mousedown - immediately show arrow up (before any blur can happen)
        select.addEventListener('mousedown', function(e) {
            setArrowOpen();
        }, true); // Use capture phase to run before blur
        
        // On focus - show arrow up
        select.addEventListener('focus', function() {
            setArrowOpen();
        });
        
        // On blur - hide arrow after delay (allows time for option selection)
        select.addEventListener('blur', function() {
            setArrowClosed();
        });
        
        // On click - ensure arrow stays up
        select.addEventListener('click', function(e) {
            setArrowOpen();
        });
        
        // On change - close arrow after selection
        select.addEventListener('change', function() {
            // Small delay then close
            setTimeout(() => {
                setArrowClosed();
            }, 50);
        });
    });
}

// ========== PAGE INITIALIZATION ==========

// Admin page initialization
document.addEventListener('DOMContentLoaded', function() {
    // Initialize dropdown arrow rotation
    initDropdownArrows();
    
    // Prevent form submission and use our validation instead
    const addStudentForm = document.getElementById('addStudentForm');
    if (addStudentForm) {
        addStudentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitAddStudent();
        });
    }
    
    // Admin page specific initialization
    if (document.getElementById('studentsTableBody') && document.getElementById('totalStudents')) {
        loadStudents();
        updateCourseFilter();
        updateStatistics();
        
        // Re-initialize dropdown arrows after course filter is updated
        setTimeout(() => {
            initDropdownArrows();
        }, 100);
        
        // Setup delete confirmation button
        const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
        if (confirmDeleteBtn) {
            confirmDeleteBtn.addEventListener('click', confirmDelete);
        }
    }
    
    // Student page specific initialization
    if (document.getElementById('studentsTableBody') && !document.getElementById('totalStudents')) {
        loadStudentsStudent();
        updateCourseFilter();
        
        // Re-initialize dropdown arrows after course filter is updated
        setTimeout(() => {
            initDropdownArrows();
        }, 100);
    }
    
    // Index page specific initialization
    if (document.getElementById('hero-section')) {
        initHeroStars();
    }
});

