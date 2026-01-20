const USERS_DB = 'usersDatabase';

// Initialize empty users database if not exists
if (!localStorage.getItem(USERS_DB)) {
    localStorage.setItem(USERS_DB, JSON.stringify({}));
}

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const authContainer = document.getElementById('auth-container');
    const mainContent = document.getElementById('main-content');

    // Check if user is already logged in
    if (sessionStorage.getItem('isLoggedIn') === 'true') {
        showMainContent();
    } else {
        showLoginForm();
    }

    // Login form handler
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        const users = JSON.parse(localStorage.getItem(USERS_DB) || '{}');
        
        if (users[username] && users[username].password === password) {
            sessionStorage.setItem('isLoggedIn', 'true');
            sessionStorage.setItem('username', username);
            showMainContent();
        } else {
            showError('Invalid username or password');
        }
    });

    // Register form handler
    registerForm.addEventListener('submit', handleRegistration);

    // Add navigation handlers
    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.id !== 'logoutBtn') {
                e.preventDefault();
                const sectionId = this.getAttribute('href').substring(1);
                showSection(sectionId);
                
                // Update active navigation
                document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });

    // Add logout handler
    document.getElementById('logoutBtn')?.addEventListener('click', handleLogout);

    // Add modal handlers
    const modal = document.getElementById('userDetailsModal');
    if (modal) {
        // Close button handler
        modal.querySelector('.close')?.addEventListener('click', () => {
            modal.classList.add('hidden');
            document.body.classList.remove('modal-open');
        });

        // Edit button handler
        modal.querySelector('.edit-btn')?.addEventListener('click', () => {
            const username = sessionStorage.getItem('username');
            const users = JSON.parse(localStorage.getItem(USERS_DB) || '{}');
            const userData = users[username];
            if (userData) {
                showEditForm(userData.userData);
            }
        });

        // Click outside to close
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
                document.body.classList.remove('modal-open');
            }
        });
    }

    // Add click handler to username display
    const userInfo = document.querySelector('.user-info');
    if (userInfo) {
        userInfo.addEventListener('click', (e) => {
            if (e.target.classList.contains('user-name-link')) {
                showUserDetails();
            }
        });
    }
});

function showLoginForm() {
    const authContainer = document.getElementById('auth-container');
    const mainContent = document.getElementById('main-content');
    
    if (authContainer && mainContent) {
        authContainer.style.display = 'flex';
        mainContent.style.display = 'none';
        document.getElementById('registerForm').classList.add('hidden');
        document.getElementById('loginForm').classList.remove('hidden');
    }
}

function showRegisterForm() {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('registerForm').classList.remove('hidden');
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector('.tab-btn:last-child').classList.add('active');
}

function showMainContent() {
    const authContainer = document.getElementById('auth-container');
    const mainContent = document.getElementById('main-content');
    
    if (authContainer && mainContent) {
        authContainer.style.display = 'none';
        mainContent.style.display = 'block';
        mainContent.classList.remove('hidden');
        
        // Initialize main content
        showDefaultSection();
        updateUserInfo();
    }
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
        color: #721c24;
        background: #f8d7da;
        padding: 10px;
        border-radius: 4px;
        margin-bottom: 15px;
        text-align: center;
    `;
    
    const form = document.getElementById('loginForm');
    form.insertBefore(errorDiv, form.firstChild);
    
    setTimeout(() => errorDiv.remove(), 3000);
}

function showMessage(message, type, formId) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    const form = document.getElementById(formId);
    form.insertBefore(messageDiv, form.firstChild);
    
    setTimeout(() => messageDiv.remove(), 3000);
}

// Add logout functionality
function handleLogout() {
    sessionStorage.clear();
    showLoginForm();
    location.reload(); // Refresh the page to reset all states
}

function showDefaultSection() {
    const defaultSection = 'home';
    const defaultLink = document.querySelector(`nav a[href="#${defaultSection}"]`);
    if (defaultLink) {
        defaultLink.classList.add('active');
        showSection(defaultSection);
    }
}

function updateUserInfo() {
    const username = sessionStorage.getItem('username');
    if (!username) return;

    const users = JSON.parse(localStorage.getItem(USERS_DB) || '{}');
    const userData = users[username].userData;
    if (!userData) return;

    const userInfo = document.querySelector('.user-info');
    if (userInfo) {
        userInfo.innerHTML = `
            Welcome, <span class="user-name-link">${userData.fullName || username}</span>
            <button class="logout-btn" onclick="handleLogout()">Logout</button>
        `;
    }
}

function showUserDetails(userData) {
    if (!userData) {
        const username = sessionStorage.getItem('username');
        if (!username) return;
        
        const users = JSON.parse(localStorage.getItem(USERS_DB) || '{}');
        userData = users[username].userData;
        if (!userData) return;
    }

    const modal = document.getElementById('userDetailsModal');
    if (!modal) return;

    // Update modal content
    const fields = {
        'userUsername': userData.username,
        'userFullName': userData.fullName,
        'userEmail': userData.email,
        'userCollege': userData.college || 'Not set',
        'userRollNumber': userData.rollNumber || 'Not set',
        'userCourse': userData.course || 'Not set',
        'userBranch': userData.branch || 'Not set',
        'userSemester': userData.semester || 'Not set',
        'userPhone': userData.phone || 'Not set'
    };

    Object.entries(fields).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    });

    // Show modal
    modal.classList.remove('hidden');
    modal.classList.add('active');
    document.body.classList.add('modal-open');
}

function handleEditSubmit(e) {
    e.preventDefault();
    const username = sessionStorage.getItem('username');
    const users = JSON.parse(localStorage.getItem(USERS_DB));
    
    const formData = new FormData(e.target);
    const newData = Object.fromEntries(formData.entries());
    
    users[username] = {
        ...users[username],
        ...newData
    };

    localStorage.setItem(USERS_DB, JSON.stringify(users));
    updateUserInfo();
    showMessage('Profile updated successfully!', 'success', 'editUserForm');
    
    const modal = document.getElementById('userDetailsModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

function showSection(sectionId) {
    const sections = document.querySelectorAll('main section');
    sections.forEach(section => {
        section.classList.remove('active-section');
        section.classList.add('hidden');
    });

    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.remove('hidden');
        targetSection.classList.add('active-section');
    }
}

function handleRegistration(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const userData = Object.fromEntries(formData.entries());

    if (!userData.username || !userData.password || !userData.fullName || !userData.email) {
        showMessage('All fields are required', 'error', 'registerForm');
        return;
    }

    try {
        const users = JSON.parse(localStorage.getItem(USERS_DB) || '{}');
        
        if (users[userData.username]) {
            showMessage('Username already exists', 'error', 'registerForm');
            return;
        }

        // Save user with complete data structure
        users[userData.username] = {
            password: userData.password,
            userData: {
                username: userData.username,
                fullName: userData.fullName,
                email: userData.email,
                college: userData.college || '',
                rollNumber: userData.rollNumber || '',
                course: userData.course || '',
                branch: userData.branch || '',
                semester: userData.semester || '',
                phone: userData.phone || ''
            }
        };

        localStorage.setItem(USERS_DB, JSON.stringify(users));
        showMessage('Registration successful! Please login', 'success', 'registerForm');
        
        // Clear form and switch to login
        e.target.reset();
        setTimeout(() => {
            showLoginForm();
        }, 1500);
    } catch (error) {
        console.error('Registration error:', error);
        showMessage('Registration failed', 'error', 'registerForm');
    }
}

// Update showEditForm function
function showEditForm(userData) {
    const modal = document.getElementById('userDetailsModal');
    if (!modal) return;

    const modalContent = modal.querySelector('.modal-content');
    modalContent.innerHTML = `
        <span class="close">&times;</span>
        <h2>Edit Profile</h2>
        <form id="editUserForm">
            <div class="form-group">
                <input type="text" name="fullName" value="${userData.fullName || ''}" required>
                <label>Full Name</label>
            </div>
            <div class="form-group">
                <input type="email" name="email" value="${userData.email || ''}" required>
                <label>Email</label>
            </div>
            <div class="form-group">
                <input type="text" name="college" value="${userData.college || ''}" required>
                <label>College</label>
            </div>
            <div class="form-group">
                <input type="text" name="rollNumber" value="${userData.rollNumber || ''}" required>
                <label>Roll Number</label>
            </div>
            <div class="form-group">
                <select name="course" required>
                    <option value="">Select Course</option>
                    <option value="B.Tech" ${userData.course === 'B.Tech' ? 'selected' : ''}>B.Tech</option>
                    <option value="M.Tech" ${userData.course === 'M.Tech' ? 'selected' : ''}>M.Tech</option>
                    <option value="BCA" ${userData.course === 'BCA' ? 'selected' : ''}>BCA</option>
                    <option value="MCA" ${userData.course === 'MCA' ? 'selected' : ''}>MCA</option>
                </select>
            </div>
            <div class="form-group">
                <select name="branch" required>
                    <option value="">Select Branch</option>
                    <option value="CSE" ${userData.branch === 'CSE' ? 'selected' : ''}>Computer Science</option>
                    <option value="IT" ${userData.branch === 'IT' ? 'selected' : ''}>Information Technology</option>
                    <option value="ECE" ${userData.branch === 'ECE' ? 'selected' : ''}>Electronics</option>
                    <option value="ME" ${userData.branch === 'ME' ? 'selected' : ''}>Mechanical</option>
                </select>
            </div>
            <div class="form-group">
                <select name="semester" required>
                    <option value="">Select Semester</option>
                    ${Array.from({length: 8}, (_, i) => 
                        `<option value="${i+1}" ${userData.semester === (i+1).toString() ? 'selected' : ''}>${i+1}</option>`
                    ).join('')}
                </select>
            </div>
            <div class="form-group">
                <input type="tel" name="phone" value="${userData.phone || ''}" pattern="[0-9]{10}">
                <label>Phone (10 digits)</label>
            </div>
            <button type="submit" class="edit-btn">Save Changes</button>
        </form>
    `;

    // Add form submission handler
    const form = modalContent.querySelector('form');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const newData = Object.fromEntries(formData.entries());
        
        try {
            const username = sessionStorage.getItem('username');
            const users = JSON.parse(localStorage.getItem(USERS_DB) || '{}');
            
            users[username].userData = {
                ...users[username].userData,
                ...newData
            };

            localStorage.setItem(USERS_DB, JSON.stringify(users));
            updateUserInfo();
            
            // Show success message and close modal
            showMessage('Profile updated successfully!', 'success', 'editUserForm');
            setTimeout(() => {
                modal.classList.add('hidden');
                showUserDetails(users[username].userData);
            }, 1500);
        } catch (error) {
            console.error('Error updating profile:', error);
            showMessage('Failed to update profile', 'error', 'editUserForm');
        }
    });

    // Add close handler
    const closeBtn = modalContent.querySelector('.close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.classList.add('hidden');
        });
    }
}
