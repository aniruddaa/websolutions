// Admin Dashboard JavaScript

// Data Storage (using localStorage)
const STORAGE_KEYS = {
    INQUIRIES: 'admin_inquiries',
    TEAM: 'admin_team'
};

let currentInquiryId = null;
let editingTeamMemberId = null;

// Initialize Admin Panel
document.addEventListener('DOMContentLoaded', () => {
    initializeAdmin();
    loadDashboard();
    setupEventListeners();
});

function initializeAdmin() {
    // Check if admin is logged in (basic check)
    const isLoggedIn = sessionStorage.getItem('adminLoggedIn');
    if (!isLoggedIn) {
        // In production, you'd redirect to login page
        sessionStorage.setItem('adminLoggedIn', 'true');
    }

    // Load data from localStorage
    loadInquiries();
    loadTeamMembers();
}

// ==================== Event Listeners ====================

function setupEventListeners() {
    // Navigation
    document.querySelectorAll('[data-section]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.getAttribute('data-section');
            switchSection(section);
        });
    });

    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', () => {
            const section = item.getAttribute('data-section');
            switchSection(section);
        });
    });

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', (e) => {
        e.preventDefault();
        logout();
    });

    // Team Form
    document.getElementById('addTeamBtn').addEventListener('click', openTeamForm);
    document.getElementById('memberForm').addEventListener('submit', handleTeamSubmit);
    document.getElementById('memberPhoto').addEventListener('change', handlePhotoPreview);

    // Filter
    document.getElementById('filterBtn').addEventListener('click', toggleFilter);
    document.getElementById('refreshBtn').addEventListener('click', refreshInquiries);

    // File upload drag and drop
    const fileUpload = document.querySelector('.file-upload');
    if (fileUpload) {
        fileUpload.addEventListener('click', () => {
            document.getElementById('memberPhoto').click();
        });

        fileUpload.addEventListener('dragover', (e) => {
            e.preventDefault();
            fileUpload.style.borderColor = 'var(--admin-primary)';
        });

        fileUpload.addEventListener('dragleave', () => {
            fileUpload.style.borderColor = 'var(--admin-border)';
        });

        fileUpload.addEventListener('drop', (e) => {
            e.preventDefault();
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                document.getElementById('memberPhoto').files = files;
                handlePhotoPreview();
            }
        });
    }
}

// ==================== Section Navigation ====================

function switchSection(section) {
    // Hide all sections
    document.querySelectorAll('.admin-section').forEach(sec => {
        sec.classList.remove('active');
    });

    // Remove active from nav links
    document.querySelectorAll('[data-section], .menu-item').forEach(item => {
        item.classList.remove('active');
    });

    // Show selected section
    document.getElementById(section).classList.add('active');

    // Add active to clicked nav items
    document.querySelectorAll(`[data-section="${section}"]`).forEach(item => {
        item.classList.add('active');
    });

    document.querySelector(`.menu-item[data-section="${section}"]`).classList.add('active');

    // Refresh data when switching sections
    if (section === 'inquiries') {
        refreshInquiries();
    } else if (section === 'team') {
        loadTeamMembers();
    }
}

function logout() {
    sessionStorage.removeItem('adminLoggedIn');
    if (confirm('Are you sure you want to logout?')) {
        window.location.href = 'index.html';
    }
}

// ==================== Dashboard ====================

function loadDashboard() {
    updateDashboardStats();
}

function updateDashboardStats() {
    const inquiries = getInquiries();
    const team = getTeamMembers();

    const unreadCount = inquiries.filter(i => !i.read).length;
    const readCount = inquiries.filter(i => i.read).length;

    document.getElementById('total-inquiries').textContent = inquiries.length;
    document.getElementById('total-team').textContent = team.length;
    document.getElementById('new-inquiries').textContent = unreadCount;
    document.getElementById('read-inquiries').textContent = readCount;
    document.getElementById('inquiries-badge').textContent = unreadCount;

    // Update badge visibility
    if (unreadCount === 0) {
        document.getElementById('inquiries-badge').style.display = 'none';
    } else {
        document.getElementById('inquiries-badge').style.display = 'inline-block';
    }
}

// ==================== Inquiries Management ====================

function getInquiries() {
    const data = localStorage.getItem(STORAGE_KEYS.INQUIRIES);
    return data ? JSON.parse(data) : [];
}

function saveInquiries(inquiries) {
    localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(inquiries));
    updateDashboardStats();
}

function loadInquiries() {
    const inquiries = getInquiries();
    displayInquiries(inquiries);
}

function displayInquiries(inquiries) {
    const list = document.getElementById('inquiriesList');

    if (inquiries.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <p>No inquiries yet</p>
                <small>Client inquiries will appear here</small>
            </div>
        `;
        return;
    }

    list.innerHTML = inquiries.map((inquiry, index) => `
        <div class="inquiry-card ${inquiry.read ? 'read' : 'unread'}">
            <div class="inquiry-header">
                <div class="inquiry-title">${escapeHtml(inquiry.subject)}</div>
                <span class="inquiry-status ${inquiry.read ? 'read' : 'unread'}">
                    ${inquiry.read ? 'Read' : 'Unread'}
                </span>
            </div>
            <div class="inquiry-meta">
                <div class="inquiry-meta-item">
                    <i class="fas fa-user"></i>
                    ${escapeHtml(inquiry.name)}
                </div>
                <div class="inquiry-meta-item">
                    <i class="fas fa-envelope"></i>
                    ${escapeHtml(inquiry.email)}
                </div>
                <div class="inquiry-meta-item">
                    <i class="fas fa-calendar"></i>
                    ${formatDate(inquiry.date)}
                </div>
            </div>
            <div class="inquiry-preview">${escapeHtml(inquiry.message.substring(0, 100))}...</div>
            <div class="inquiry-actions">
                <button class="btn-view" onclick="viewInquiry(${index})">
                    <i class="fas fa-eye"></i> View
                </button>
                <button class="btn-mark" onclick="toggleInquiryRead(${index})">
                    <i class="fas fa-${inquiry.read ? 'envelope' : 'check-circle'}"></i>
                    ${inquiry.read ? 'Mark Unread' : 'Mark Read'}
                </button>
            </div>
        </div>
    `).join('');
}

function viewInquiry(index) {
    const inquiries = getInquiries();
    const inquiry = inquiries[index];
    currentInquiryId = index;

    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <dl>
            <dt>Subject:</dt>
            <dd>${escapeHtml(inquiry.subject)}</dd>

            <dt>Name:</dt>
            <dd>${escapeHtml(inquiry.name)}</dd>

            <dt>Email:</dt>
            <dd><a href="mailto:${escapeHtml(inquiry.email)}">${escapeHtml(inquiry.email)}</a></dd>

            <dt>Phone (if provided):</dt>
            <dd>${inquiry.phone ? escapeHtml(inquiry.phone) : 'Not provided'}</dd>

            <dt>Date:</dt>
            <dd>${formatDate(inquiry.date)} at ${formatTime(inquiry.date)}</dd>

            <dt>Message:</dt>
            <dd style="white-space: pre-wrap;">${escapeHtml(inquiry.message)}</dd>
        </dl>
    `;

    document.getElementById('deleteInquiryBtn').onclick = () => {
        deleteInquiry(index);
    };

    document.getElementById('inquiryModal').classList.add('show');

    // Mark as read
    if (!inquiry.read) {
        inquiries[index].read = true;
        saveInquiries(inquiries);
        loadInquiries();
    }
}

function closeInquiryModal() {
    document.getElementById('inquiryModal').classList.remove('show');
    currentInquiryId = null;
}

function toggleInquiryRead(index) {
    const inquiries = getInquiries();
    inquiries[index].read = !inquiries[index].read;
    saveInquiries(inquiries);
    loadInquiries();
}

function deleteInquiry(index) {
    if (confirm('Are you sure you want to delete this inquiry?')) {
        let inquiries = getInquiries();
        inquiries.splice(index, 1);
        saveInquiries(inquiries);
        loadInquiries();
        closeInquiryModal();
    }
}

function toggleFilter() {
    const panel = document.getElementById('filterPanel');
    panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
}

function refreshInquiries() {
    loadInquiries();
}

// ==================== Team Management ====================

function getTeamMembers() {
    const data = localStorage.getItem(STORAGE_KEYS.TEAM);
    return data ? JSON.parse(data) : [];
}

function saveTeamMembers(team) {
    localStorage.setItem(STORAGE_KEYS.TEAM, JSON.stringify(team));
    updateDashboardStats();
}

function loadTeamMembers() {
    const team = getTeamMembers();
    displayTeamMembers(team);
}

function displayTeamMembers(team) {
    const grid = document.getElementById('teamGrid');

    if (team.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-users"></i>
                <p>No team members yet</p>
                <button class="btn-primary" onclick="openTeamForm()">Add First Team Member</button>
            </div>
        `;
        return;
    }

    grid.innerHTML = team.map((member, index) => `
        <div class="team-card">
            <img src="${member.photo}" alt="${escapeHtml(member.name)}" class="team-card-image">
            <div class="team-card-content">
                <h3>${escapeHtml(member.name)}</h3>
                <p>${escapeHtml(member.position)}</p>
                <div class="bio">${escapeHtml(member.bio)}</div>
                <div class="team-card-actions">
                    <button class="btn-edit" onclick="editTeamMember(${index})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn-delete" onclick="deleteTeamMember(${index})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function openTeamForm() {
    editingTeamMemberId = null;
    document.getElementById('formTitle').textContent = 'Add Team Member';
    document.getElementById('memberForm').reset();
    document.getElementById('photoPreview').style.display = 'none';
    document.getElementById('teamForm').style.display = 'block';
    document.getElementById('memberName').focus();
}

function closeTeamForm() {
    document.getElementById('teamForm').style.display = 'none';
    editingTeamMemberId = null;
}

function editTeamMember(index) {
    const team = getTeamMembers();
    const member = team[index];
    editingTeamMemberId = index;

    document.getElementById('formTitle').textContent = 'Edit Team Member';
    document.getElementById('memberName').value = member.name;
    document.getElementById('memberPosition').value = member.position;
    document.getElementById('memberBio').value = member.bio;

    // Show photo preview
    const preview = document.getElementById('photoPreview');
    const previewImg = document.getElementById('previewImg');
    previewImg.src = member.photo;
    preview.style.display = 'block';

    document.getElementById('teamForm').style.display = 'block';
    document.getElementById('memberName').focus();
}

function handlePhotoPreview() {
    const file = document.getElementById('memberPhoto').files[0];
    if (file) {
        if (file.size > 5 * 1024 * 1024) {
            alert('File size must be less than 5MB');
            document.getElementById('memberPhoto').value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = document.getElementById('photoPreview');
            const previewImg = document.getElementById('previewImg');
            previewImg.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

function clearPhoto() {
    document.getElementById('memberPhoto').value = '';
    document.getElementById('photoPreview').style.display = 'none';
}

function handleTeamSubmit(e) {
    e.preventDefault();

    const name = document.getElementById('memberName').value.trim();
    const position = document.getElementById('memberPosition').value.trim();
    const bio = document.getElementById('memberBio').value.trim();
    const photoFile = document.getElementById('memberPhoto').files[0];

    if (!name || !position || !bio) {
        alert('Please fill in all required fields');
        return;
    }

    // If editing existing member and no new photo, use old photo
    let team = getTeamMembers();
    if (editingTeamMemberId !== null && !photoFile) {
        const oldMember = team[editingTeamMemberId];
        saveMember(name, position, bio, oldMember.photo);
    } else if (photoFile) {
        const reader = new FileReader();
        reader.onload = (e) => {
            saveMember(name, position, bio, e.target.result);
        };
        reader.readAsDataURL(photoFile);
    } else {
        alert('Please upload a photo for the team member');
    }
}

function saveMember(name, position, bio, photoData) {
    let team = getTeamMembers();
    const member = {
        name,
        position,
        bio,
        photo: photoData,
        dateAdded: new Date().toISOString()
    };

    if (editingTeamMemberId !== null) {
        team[editingTeamMemberId] = member;
    } else {
        team.push(member);
    }

    saveTeamMembers(team);
    closeTeamForm();
    loadTeamMembers();

    alert(editingTeamMemberId !== null ? 'Team member updated!' : 'Team member added successfully!');
}

function deleteTeamMember(index) {
    if (confirm('Are you sure you want to delete this team member?')) {
        let team = getTeamMembers();
        team.splice(index, 1);
        saveTeamMembers(team);
        loadTeamMembers();
        alert('Team member deleted!');
    }
}

// ==================== Form Integration ====================

// When contact form is submitted on main site, save to inquiries
function addInquiryFromWebsite(name, email, subject, message, phone = '') {
    const inquiries = getInquiries();
    inquiries.push({
        name,
        email,
        subject,
        message,
        phone,
        date: new Date().toISOString(),
        read: false
    });
    saveInquiries(inquiries);
}

// ==================== Utility Functions ====================

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Make functions globally accessible
window.viewInquiry = viewInquiry;
window.closeInquiryModal = closeInquiryModal;
window.toggleInquiryRead = toggleInquiryRead;
window.deleteInquiry = deleteInquiry;
window.openTeamForm = openTeamForm;
window.closeTeamForm = closeTeamForm;
window.editTeamMember = editTeamMember;
window.deleteTeamMember = deleteTeamMember;
window.clearPhoto = clearPhoto;
