// ========== GLOBAL VARIABLES ==========
let currentUpdateId = null;
let currentDeleteId = null;

// ========== PAGE INITIALIZATION ==========
// Add profile icon click handler
document.addEventListener('DOMContentLoaded', function() {
    const profileIcon = document.getElementById('profileIcon');
    if (profileIcon) {
        profileIcon.addEventListener('click', function() {
            window.location.href = 'profile.html';
        });
    }
});

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

// Initialize scroll-triggered reveal animations for elements with `.animate-on-scroll`
function initScrollAnimations() {
    const elements = document.querySelectorAll('.animate-on-scroll');
    if (!elements || elements.length === 0) return;

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });

        elements.forEach(el => observer.observe(el));
    } else {
        // Fallback for older browsers: reveal on load and on scroll
        const revealOnScroll = () => {
            elements.forEach(el => {
                const rect = el.getBoundingClientRect();
                if (rect.top < window.innerHeight - 50) el.classList.add('is-visible');
            });
        };
        window.addEventListener('scroll', revealOnScroll, { passive: true });
        // Run once immediately
        revealOnScroll();
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

        // Admin logout confirmation
        const confirmLogoutBtn = document.getElementById('confirmLogoutBtn');
        if (confirmLogoutBtn) {
            confirmLogoutBtn.addEventListener('click', () => {
                window.location.href = 'login.html';
            });
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
        initScrollAnimations();
    }
});

// ========== PROFILE PAGE SCRIPTS (moved from profile.html, scoped) ==========
document.addEventListener('DOMContentLoaded', function() {
    if (!document.querySelector('.profile-page')) return;

    // Initialize small decorative stars for profile page
    (function initProfileStars() {
        for (let i = 0; i < 25; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            const size = Math.random() * 4 + 2;
            star.style.width = `${size}px`;
            star.style.height = `${size}px`;
            star.style.top = `${Math.random() * 100}vh`;
            star.style.left = `${Math.random() * 100}vw`;
            star.style.animationDelay = `${Math.random() * 3}s`;
            document.body.appendChild(star);
        }
    })();

    // Photo upload functionality
    const photoInputEl = document.getElementById('photoInput');
    const profilePhotoEl = document.getElementById('profilePhoto');

    if (photoInputEl && profilePhotoEl) {
        photoInputEl.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    profilePhotoEl.innerHTML = '';
                    const img = document.createElement('img');
                    img.src = event.target.result;
                    img.style.width = '100%';
                    img.style.height = '100%';
                    img.style.objectFit = 'cover';
                    img.style.borderRadius = '50%';
                    profilePhotoEl.appendChild(img);

                    // Show success message
                    showProfileMessage('Profile photo updated successfully!', 'success');
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Logout modal functionality
    const logoutBtnEl = document.getElementById('logoutBtn');
    const logoutModalEl = document.getElementById('logoutModal');
    const cancelLogoutEl = document.getElementById('cancelLogout');
    const confirmLogoutEl = document.getElementById('confirmLogout');

    if (logoutBtnEl && logoutModalEl && cancelLogoutEl && confirmLogoutEl) {
        logoutBtnEl.addEventListener('click', () => {
            logoutModalEl.classList.add('active');
        });

        cancelLogoutEl.addEventListener('click', () => {
            logoutModalEl.classList.remove('active');
        });

        confirmLogoutEl.addEventListener('click', () => {
            window.location.href = 'login.html';
        });

        // Close modal on outside click
        logoutModalEl.addEventListener('click', (e) => {
            if (e.target === logoutModalEl) {
                logoutModalEl.classList.remove('active');
            }
        });

        // Close modal on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && logoutModalEl.classList.contains('active')) {
                logoutModalEl.classList.remove('active');
            }
        });
    }

    // Profile message helper (scoped)
    function showProfileMessage(message, type) {
        const messageEl = document.getElementById('profileMessage');
        if (!messageEl) return;
        messageEl.textContent = message;
        messageEl.className = `message ${type} show`;
        setTimeout(() => {
            messageEl.classList.remove('show');
        }, 3000);
    }

    // Load placeholder user data (replace with backend values as needed)
    function loadProfileUserData() {
        const userData = {
            firstName: 'John',
            middleName: 'Michael',
            lastName: 'Doe',
            dateOfBirth: 'January 15, 1995',
            email: 'john.doe@example.com'
        };

        const elFirst = document.getElementById('firstName');
        if (elFirst) elFirst.textContent = userData.firstName;

        const elMiddle = document.getElementById('middleName');
        if (elMiddle) elMiddle.textContent = userData.middleName || 'N/A';

        const elLast = document.getElementById('lastName');
        if (elLast) elLast.textContent = userData.lastName;

        const elDob = document.getElementById('dateOfBirth');
        if (elDob) elDob.textContent = userData.dateOfBirth;

        const elEmail = document.getElementById('emailAddress');
        if (elEmail) elEmail.textContent = userData.email;

        const elProfileEmail = document.getElementById('profileEmail');
        if (elProfileEmail) elProfileEmail.textContent = userData.email;

        const elProfileName = document.getElementById('profileName');
        if (elProfileName) {
            const fullName = [userData.firstName, userData.middleName, userData.lastName]
                .filter(Boolean)
                .join(' ');
            elProfileName.textContent = fullName;
        }
    }

    // Initialize profile data
    loadProfileUserData();
});

// ========== LOGIN PAGE SCRIPTS (moved from login.html, scoped) ==========
document.addEventListener('DOMContentLoaded', function() {
    if (!document.querySelector('.login-page')) return;

    // Stars background for login page
    (function initLoginStars(){
        for (let i = 0; i < 25; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            const size = Math.random() * 4 + 2;
            star.style.width = size + 'px';
            star.style.height = size + 'px';
            star.style.top = Math.random() * 100 + 'vh';
            star.style.left = Math.random() * 100 + 'vw';
            star.style.animationDelay = Math.random() * 3 + 's';
            document.body.appendChild(star);
        }
    })();

    // Toggle password visibility helper
    const togglePassword = (input, toggle) => {
        if (!input || !toggle) return;
        toggle.addEventListener('click', () => {
            const type = input.type === 'password' ? 'text' : 'password';
            input.type = type;
            const icon = toggle.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-eye', type === 'password');
                icon.classList.toggle('fa-eye-slash', type !== 'password');
            } else {
                toggle.innerHTML = type === 'password' ? '<i class="fa fa-eye"></i>' : '<i class="fa fa-eye-slash"></i>';
            }
        });
    };

    togglePassword(document.getElementById('loginPassword'), document.getElementById('toggleLoginPassword'));
    togglePassword(document.getElementById('signupPassword'), document.getElementById('toggleSignupPassword'));
    togglePassword(document.getElementById('signupConfirmPassword'), document.getElementById('toggleConfirmPassword'));

    // Password validation for signup
    const validatePassword = (password) => {
        const requirements = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>\/?]/.test(password)
        };

        const reqElements = {
            length: document.getElementById('req-length'),
            uppercase: document.getElementById('req-uppercase'),
            lowercase: document.getElementById('req-lowercase'),
            number: document.getElementById('req-number'),
            special: document.getElementById('req-special')
        };

        Object.keys(requirements).forEach(key => {
            const element = reqElements[key];
            if (element) {
                const isValid = requirements[key];
                element.classList.toggle('valid', isValid);
                element.classList.toggle('invalid', !isValid);
                const icon = element.querySelector('i');
                if (icon) icon.className = isValid ? 'fa fa-check' : 'fa fa-times';
            }
        });

        return Object.values(requirements).every(req => req === true);
    };

    const checkPasswordMatch = () => {
        const password = document.getElementById('signupPassword')?.value || '';
        const confirmPassword = document.getElementById('signupConfirmPassword')?.value || '';
        const matchElement = document.getElementById('passwordMatch');

        if (!matchElement) return false;

        if (!confirmPassword) {
            matchElement.textContent = '';
            matchElement.className = 'password-match';
            return false;
        }

        const isMatch = password === confirmPassword;
        matchElement.textContent = isMatch ? '✓ Passwords match' : '✗ Passwords do not match';
        matchElement.className = `password-match ${isMatch ? 'match' : 'no-match'}`;
        return isMatch;
    };

    const signupPasswordEl = document.getElementById('signupPassword');
    const signupConfirmEl = document.getElementById('signupConfirmPassword');
    if (signupPasswordEl) {
        signupPasswordEl.addEventListener('input', (e) => {
            validatePassword(e.target.value);
            if (signupConfirmEl && signupConfirmEl.value) checkPasswordMatch();
        });
    }
    if (signupConfirmEl) signupConfirmEl.addEventListener('input', checkPasswordMatch);

    const resetSignupForm = () => {
        const form = document.getElementById('signupForm');
        if (form) form.reset();
        document.querySelectorAll('.requirement').forEach(req => {
            req.classList.remove('valid', 'invalid');
            const icon = req.querySelector('i'); if (icon) icon.className = 'fa fa-times';
        });
        const matchEl = document.getElementById('passwordMatch');
        if (matchEl) { matchEl.textContent = ''; matchEl.className = 'password-match'; }
    };

    const setButtonLoading = (btn, icon, text, isLoading, loadingText, loadingIcon) => {
        if (!btn || !icon || !text) return;
        btn.classList.toggle('loading', isLoading);
        if (isLoading) {
            icon.className = loadingIcon;
            text.dataset.original = text.textContent;
            text.textContent = loadingText;
        } else {
            if (text.dataset.original) text.textContent = text.dataset.original;
        }
    };

    const showError = (parent, message) => {
        if (!parent) return;
        const existing = parent.querySelector('.error-message');
        if (existing) existing.remove();
        const errorMsg = document.createElement('div');
        errorMsg.className = 'error-message show';
        errorMsg.textContent = message;
        errorMsg.style.marginTop = '0.5rem';
        parent.appendChild(errorMsg);
        setTimeout(() => errorMsg.remove(), 3000);
    };

    // Signup modal controls
    const signupModal = document.getElementById('signupModal');
    const openSignupBtn = document.getElementById('openSignup');
    const closeSignupBtn = document.getElementById('closeSignup');

    if (openSignupBtn && signupModal) {
        openSignupBtn.addEventListener('click', (e) => {
            e.preventDefault();
            signupModal.classList.add('active');
            const birthdayInput = document.getElementById('signupBirthday');
            if (birthdayInput) {
                const today = new Date();
                birthdayInput.max = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate()).toISOString().split('T')[0];
                birthdayInput.min = new Date(today.getFullYear() - 100, today.getMonth(), today.getDate()).toISOString().split('T')[0];
            }
            const first = document.getElementById('signupFirstName'); if (first) first.focus();
        });
    }

    const closeModal = () => { if (signupModal) { signupModal.classList.remove('active'); resetSignupForm(); } };
    if (closeSignupBtn) closeSignupBtn.addEventListener('click', closeModal);
    if (signupModal) signupModal.addEventListener('click', (e) => { if (e.target === signupModal) closeModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && signupModal && signupModal.classList.contains('active')) closeModal(); });

    // Scoped message helpers
    const showMessage = (elementId, message, type) => {
        const el = document.getElementById(elementId);
        if (!el) return;
        el.textContent = message;
        el.className = `message ${type} show`;
    };

    const hideMessage = (elementId) => {
        const el = document.getElementById(elementId);
        if (!el) return;
        el.className = 'message';
    };

    // Login form submit
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            const email = document.getElementById('loginEmail')?.value || '';
            const password = document.getElementById('loginPassword')?.value || '';
            const loginBtn = document.getElementById('loginBtn');
            const loginIcon = document.getElementById('loginIcon');
            const loginText = document.getElementById('loginText');

            if (!email || !password) {
                e.preventDefault();
                showError(loginBtn?.parentElement || document.body, 'Please fill in all fields');
                return;
            }

            const existingError = loginBtn?.parentElement.querySelector('.error-message'); if (existingError) existingError.remove();

            // TEMP: front-end only admin shortcut for UI testing (remove when backend auth is live)
            const tempAdminEmail = 'admin@gmail.com';
            const tempAdminPassword = 'admin123';
            if (email.trim().toLowerCase() === tempAdminEmail && password === tempAdminPassword) {
                e.preventDefault();
                window.location.href = 'admin.html';
                return;
            }

            // Block backend calls during UI-only phase
            e.preventDefault();
            showMessage('loginMessage', 'Backend login is not wired yet. Use the admin test account above for UI checks.', 'error');
        });
    }

    // Signup form submit
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            const firstName = document.getElementById('signupFirstName')?.value.trim() || '';
            const middleName = document.getElementById('signupMiddleName')?.value.trim() || '';
            const lastName = document.getElementById('signupLastName')?.value.trim() || '';
            const birthday = document.getElementById('signupBirthday')?.value || '';
            const email = document.getElementById('signupEmail')?.value.trim() || '';
            const password = document.getElementById('signupPassword')?.value || '';
            const confirmPassword = document.getElementById('signupConfirmPassword')?.value || '';
            const signupBtn = document.getElementById('signupBtn');
            const signupIcon = document.getElementById('signupIcon');
            const signupText = document.getElementById('signupText');

            if (!firstName || !lastName || !birthday || !email || !password || !confirmPassword) {
                e.preventDefault();
                showMessage('signupMessage', 'Please fill in all required fields', 'error');
                return;
            }

            const birthDate = new Date(birthday);
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) ? age - 1 : age;

            if (actualAge < 13) {
                e.preventDefault();
                showMessage('signupMessage', 'You must be at least 13 years old to create an account', 'error');
                return;
            }

            if (!validatePassword(password)) {
                e.preventDefault();
                showMessage('signupMessage', 'Password does not meet all requirements', 'error');
                return;
            }

            if (password !== confirmPassword) {
                e.preventDefault();
                showMessage('signupMessage', 'Passwords do not match', 'error');
                return;
            }

            // show loading state and let form submit to server-side
            if (signupBtn) signupBtn.classList.add('loading');
            if (signupIcon) signupIcon.className = 'fa fa-spinner fa-spin';
            if (signupText) signupText.textContent = 'Creating account...';
        });
    }

    // On load, fetch any flash messages from server (set by PHP handlers)
    (async function fetchFlash() {
        try {
            const res = await fetch('flash.php');
            if (!res.ok) return;
            const data = await res.json();
            if (data.error) showMessage('loginMessage', data.error, 'error');
            if (data.success) showMessage('loginMessage', data.success, 'success');
        } catch (e) {
            // ignore silently
        }
    })();
});