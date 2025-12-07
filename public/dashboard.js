// API Configuration
const API_BASE_URL = 'http://localhost:3000/api';
let currentUser = null;
let accessToken = null;

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  setupNavigation();
  loadDashboard();
});

// Check Authentication
function checkAuth() {
  accessToken = localStorage.getItem('accessToken');
  const userStr = localStorage.getItem('user');

  if (!accessToken || !userStr) {
    window.location.href = '/login.html';
    return;
  }

  try {
    currentUser = JSON.parse(userStr);
    updateUserInfo();
    setupRoleBasedMenu();
  } catch (error) {
    console.error('Error parsing user data:', error);
    window.location.href = '/login.html';
  }
}

// Update User Info in UI
function updateUserInfo() {
  if (currentUser) {
    document.getElementById('user-name').textContent = currentUser.full_name || currentUser.email;
    const roleNames = {
      patient: 'Patient',
      doctor: 'Doctor',
      donor: 'Donor',
      ngo: 'NGO',
      pharmacy: 'Pharmacy',
      admin: 'Admin'
    };
    document.getElementById('user-role').textContent = roleNames[currentUser.role] || currentUser.role;
  }
}

// Setup Role-Based Menu
function setupRoleBasedMenu() {
  if (!currentUser) return;

  const role = currentUser.role;
  
  // Hide all menus first
  document.querySelectorAll('.nav-section[id$="-menu"]').forEach(menu => {
    menu.style.display = 'none';
  });

  // Show relevant menu based on role
  if (role === 'patient') {
    document.getElementById('patient-menu').style.display = 'block';
  } else if (role === 'doctor') {
    document.getElementById('doctor-menu').style.display = 'block';
  } else if (role === 'donor') {
    document.getElementById('donor-menu').style.display = 'block';
  } else if (role === 'ngo') {
    document.getElementById('ngo-menu').style.display = 'block';
  } else if (role === 'pharmacy') {
    document.getElementById('pharmacy-menu').style.display = 'block';
  } else if (role === 'admin') {
    document.getElementById('admin-menu').style.display = 'block';
    document.getElementById('add-ngo-btn').style.display = 'inline-flex';
  }
}

// Setup Navigation
function setupNavigation() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const page = item.getAttribute('data-page');
      if (page) {
        navigateToPage(page);
      }
    });
  });
}

// Navigate to Page
function navigateToPage(pageName) {
  // Update active nav item
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
  });
  document.querySelector(`[data-page="${pageName}"]`)?.classList.add('active');

  // Hide all pages
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });

  // Show target page
  const targetPage = document.getElementById(`page-${pageName}`);
  if (targetPage) {
    targetPage.classList.add('active');
    updatePageTitle(pageName);
    loadPageData(pageName);
  }
}

// Update Page Title
function updatePageTitle(pageName) {
  const titles = {
    'dashboard': 'Dashboard',
    'profile': 'Profile',
    'medical-cases': 'Medical Cases',
    'consultations': 'Consultations',
    'donations': 'Donations',
    'medication-requests': 'Medication Requests',
    'mental-health': 'Mental Health',
    'support-groups': 'Support Groups',
    'ngos': 'NGOs',
    'medical-inventory': 'Medical Inventory',
    'users': 'Users',
    'system': 'System Settings'
  };
  document.getElementById('page-title').textContent = titles[pageName] || pageName;
}

// Load Page Data
function loadPageData(pageName) {
  switch (pageName) {
    case 'dashboard':
      loadDashboard();
      break;
    case 'profile':
      loadProfile();
      break;
    case 'medical-cases':
      loadMedicalCases();
      break;
    case 'consultations':
      loadConsultations();
      break;
    case 'donations':
      loadDonations();
      break;
    case 'medication-requests':
      loadMedicationRequests();
      break;
    case 'mental-health':
      loadMentalHealthSessions();
      break;
    case 'support-groups':
      loadSupportGroups();
      break;
    case 'ngos':
      loadNGOs();
      break;
    case 'medical-inventory':
      loadMedicalInventory();
      break;
    case 'users':
      loadUsers();
      break;
    case 'system':
      loadSystemSettings();
      break;
  }
}

// Load Dashboard
async function loadDashboard() {
  const statsGrid = document.getElementById('stats-grid');
  const quickActionsGrid = document.getElementById('quick-actions-grid');

  if (!statsGrid || !quickActionsGrid) return;

  // Load stats based on user role
  const stats = await getDashboardStats();
  displayStats(stats, statsGrid);

  // Load quick actions based on user role
  const actions = getQuickActions();
  displayQuickActions(actions, quickActionsGrid);
}

// Get Dashboard Stats
async function getDashboardStats() {
  const role = currentUser?.role;
  const stats = [];

  try {
    if (role === 'patient') {
      // Patient stats - get user's cases
      try {
        const cases = await apiCall(`/medical-cases?patient_id=${currentUser.user_id}`, 'GET');
      stats.push({
        icon: '🏥',
          title: 'My Medical Cases',
          value: Array.isArray(cases) ? cases.length : 0,
        color: '#3498db'
      });
      } catch (e) {
        stats.push({ icon: '🏥', title: 'My Medical Cases', value: 0, color: '#3498db' });
      }

      try {
        const requests = await apiCall('/medication_requests', 'GET');
      stats.push({
          icon: '💊',
          title: 'Medication Requests',
          value: Array.isArray(requests) ? requests.length : 0,
          color: '#e67e22'
        });
      } catch (e) {
        stats.push({ icon: '💊', title: 'Medication Requests', value: 0, color: '#e67e22' });
      }

      try {
        const sessions = await apiCall('/mental_health_sessions', 'GET');
        stats.push({
          icon: '🧠',
          title: 'Mental Health Sessions',
          value: Array.isArray(sessions) ? sessions.length : 0,
        color: '#9b59b6'
      });
      } catch (e) {
        stats.push({ icon: '🧠', title: 'Mental Health Sessions', value: 0, color: '#9b59b6' });
      }
    } else if (role === 'doctor') {
      try {
      const consultations = await apiCall('/consultations', 'GET');
      stats.push({
        icon: '💬',
        title: 'Consultations',
          value: Array.isArray(consultations) ? consultations.length : 0,
        color: '#9b59b6'
      });
      } catch (e) {
        stats.push({ icon: '💬', title: 'Consultations', value: 0, color: '#9b59b6' });
      }

      try {
        const cases = await apiCall('/medical-cases', 'GET');
        stats.push({
          icon: '🏥',
          title: 'Medical Cases',
          value: Array.isArray(cases) ? cases.length : 0,
          color: '#3498db'
        });
      } catch (e) {
        stats.push({ icon: '🏥', title: 'Medical Cases', value: 0, color: '#3498db' });
      }
    } else if (role === 'donor') {
      try {
        const donations = await apiCall('/donations', 'GET');
        stats.push({
          icon: '❤️',
          title: 'My Donations',
          value: Array.isArray(donations) ? donations.length : 0,
          color: '#e74c3c'
        });
      } catch (e) {
        stats.push({ icon: '❤️', title: 'My Donations', value: 0, color: '#e74c3c' });
      }
    } else if (role === 'pharmacy') {
      try {
        const requests = await apiCall('/medication_requests', 'GET');
        stats.push({
          icon: '💊',
          title: 'Medication Requests',
          value: Array.isArray(requests) ? requests.length : 0,
          color: '#e67e22'
        });
      } catch (e) {
        stats.push({ icon: '💊', title: 'Medication Requests', value: 0, color: '#e67e22' });
      }

      try {
        const inventory = await apiCall('/medical_inventory', 'GET');
        stats.push({
          icon: '📦',
          title: 'Medical Inventory',
          value: Array.isArray(inventory) ? inventory.length : 0,
          color: '#27ae60'
        });
      } catch (e) {
        stats.push({ icon: '📦', title: 'Medical Inventory', value: 0, color: '#27ae60' });
      }
    } else if (role === 'admin') {
      try {
      const users = await apiCall('/users', 'GET');
      stats.push({
        icon: '👥',
        title: 'Users',
          value: Array.isArray(users) ? users.length : 0,
        color: '#3498db'
      });
      } catch (e) {
        stats.push({ icon: '👥', title: 'Users', value: 0, color: '#3498db' });
      }

      try {
      const cases = await apiCall('/medical-cases', 'GET');
      stats.push({
        icon: '🏥',
        title: 'Medical Cases',
          value: Array.isArray(cases) ? cases.length : 0,
        color: '#e74c3c'
      });
      } catch (e) {
        stats.push({ icon: '🏥', title: 'Medical Cases', value: 0, color: '#e74c3c' });
      }

      try {
        const ngos = await apiCall('/ngos', 'GET');
        stats.push({
          icon: '🏛️',
          title: 'NGOs',
          value: Array.isArray(ngos) ? ngos.length : 0,
          color: '#9b59b6'
        });
      } catch (e) {
        stats.push({ icon: '🏛️', title: 'NGOs', value: 0, color: '#9b59b6' });
      }

      try {
        const donations = await apiCall('/donations', 'GET');
        const totalAmount = Array.isArray(donations) 
          ? donations.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0) 
          : 0;
        stats.push({
          icon: '💰',
          title: 'Total Donations',
          value: totalAmount.toFixed(2),
          color: '#27ae60'
        });
      } catch (e) {
        stats.push({ icon: '💰', title: 'Total Donations', value: '0.00', color: '#27ae60' });
      }
    }
  } catch (error) {
    console.error('Error loading stats:', error);
  }

  return stats;
}

// Display Stats
function displayStats(stats, container) {
  container.innerHTML = stats.map(stat => `
    <div class="stat-card">
      <div class="stat-icon" style="background: linear-gradient(135deg, ${stat.color} 0%, ${stat.color}dd 100%);">
        ${stat.icon}
      </div>
      <div class="stat-info">
        <h3>${stat.title}</h3>
        <div class="stat-value">${stat.value}</div>
      </div>
    </div>
  `).join('');
}

// Get Quick Actions
function getQuickActions() {
  const role = currentUser?.role;
  const actions = [];

  if (role === 'patient') {
    actions.push({
      icon: '🏥',
      title: 'Add Medical Case',
      description: 'Create a new medical case',
      action: () => showAddMedicalCaseModal()
    });
    actions.push({
      icon: '💬',
      title: 'New Consultation',
      description: 'Request a consultation from a doctor',
      action: () => showAddConsultationModal()
    });
    actions.push({
      icon: '💊',
      title: 'Request Medication',
      description: 'Request medication from pharmacy',
      action: () => showAddMedicationRequestModal()
    });
    actions.push({
      icon: '🧠',
      title: 'Mental Health Session',
      description: 'Book a mental health session',
      action: () => showAddMentalHealthSessionModal()
    });
  } else if (role === 'doctor') {
    actions.push({
      icon: '💬',
      title: 'Consultations',
      description: 'View consultations',
      action: () => navigateToPage('consultations')
    });
    actions.push({
      icon: '🏥',
      title: 'Medical Cases',
      description: 'View medical cases',
      action: () => navigateToPage('medical-cases')
    });
  } else if (role === 'donor') {
    actions.push({
      icon: '❤️',
      title: 'New Donation',
      description: 'Make a donation',
      action: () => showAddDonationModal()
    });
    actions.push({
      icon: '🏥',
      title: 'Medical Cases',
      description: 'View cases needing donations',
      action: () => navigateToPage('medical-cases')
    });
  } else if (role === 'pharmacy') {
    actions.push({
      icon: '💊',
      title: 'Medication Requests',
      description: 'View medication requests',
      action: () => navigateToPage('medication-requests')
    });
    actions.push({
      icon: '📦',
      title: 'Medical Inventory',
      description: 'Manage medical inventory',
      action: () => navigateToPage('medical-inventory')
    });
  } else if (role === 'admin') {
    actions.push({
      icon: '👥',
      title: 'Users',
      description: 'Manage users',
      action: () => navigateToPage('users')
    });
    actions.push({
      icon: '🏛️',
      title: 'NGOs',
      description: 'Manage NGOs',
      action: () => navigateToPage('ngos')
    });
    actions.push({
      icon: '⚙️',
      title: 'System Settings',
      description: 'System settings',
      action: () => navigateToPage('system')
    });
  }

  return actions;
}

// Display Quick Actions
function displayQuickActions(actions, container) {
  container.innerHTML = actions.map(action => `
    <div class="action-card" onclick="(${action.action})()">
      <div class="action-card-icon">${action.icon}</div>
      <h4>${action.title}</h4>
      <p>${action.description}</p>
    </div>
  `).join('');
}

// Load Profile
async function loadProfile() {
  const container = document.getElementById('profile-container');
  if (!container) return;

  try {
    const result = await apiCall('/users/me', 'GET');
    // Extract profile from response (API returns {message, profile})
    const user = result.profile || result;
    displayProfile(user, container);
  } catch (error) {
    console.error('Profile loading error:', error);
    showMessage('Error loading profile: ' + (error.message || 'Unknown error'), 'error');
  }
}

// Display Profile
function displayProfile(user, container) {
  const roleNames = {
    patient: 'Patient',
    doctor: 'Doctor',
    donor: 'Donor',
    ngo: 'NGO',
    pharmacy: 'Pharmacy',
    admin: 'Admin'
  };

  // Get role from user (could be role, role_name, or role_id)
  const userRole = user.role || user.role_name || '';
  
  // Get specialization from doctor_data if available
  const specialization = user.doctor_data?.specialization || user.specialization || '';
  
  // Format date_of_birth for input field (YYYY-MM-DD)
  let dateOfBirth = '';
  if (user.date_of_birth) {
    const date = new Date(user.date_of_birth);
    if (!isNaN(date.getTime())) {
      dateOfBirth = date.toISOString().split('T')[0];
    }
  }

  container.innerHTML = `
    <div class="profile-header">
      <div class="profile-avatar">${user.full_name?.charAt(0) || 'U'}</div>
      <div class="profile-info">
        <h2>${user.full_name || 'Not specified'}</h2>
        <p>${roleNames[userRole] || userRole || 'User'}</p>
      </div>
    </div>
    <form class="profile-form" onsubmit="updateProfile(event)">
      <div class="form-group">
        <label>Full Name *</label>
        <input type="text" name="full_name" value="${user.full_name || ''}" required>
      </div>
      <div class="form-group">
        <label>Email *</label>
        <input type="email" name="email" value="${user.email || ''}" required readonly>
        <small style="color: #666; font-size: 0.85em;">Email cannot be changed</small>
      </div>
      <div class="form-group">
        <label>Phone Number</label>
        <input type="tel" name="phone_number" value="${user.phone_number || ''}">
      </div>
      ${userRole === 'doctor' ? `
        <div class="form-group">
          <label>Specialization</label>
          <input type="text" name="specialization" value="${specialization}">
        </div>
      ` : ''}
      <div class="form-group">
        <label>Date of Birth</label>
        <input type="date" name="date_of_birth" value="${dateOfBirth}">
      </div>
      <div class="form-group">
        <label>Gender</label>
        <select name="gender">
          <option value="">Select</option>
          <option value="male" ${user.gender === 'male' ? 'selected' : ''}>Male</option>
          <option value="female" ${user.gender === 'female' ? 'selected' : ''}>Female</option>
          <option value="other" ${user.gender === 'other' ? 'selected' : ''}>Other</option>
        </select>
      </div>
      <div class="modal-footer">
        <button type="submit" class="btn btn-primary">Save Changes</button>
      </div>
    </form>
  `;
}

// Update Profile
async function updateProfile(e) {
  e.preventDefault();
  e.stopPropagation();
  
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData.entries());

  try {
    await apiCall(`/users/${currentUser.user_id}`, 'PUT', data);
    showMessage('Profile updated successfully!', 'success');
    // Reload profile after a short delay to show message first
    setTimeout(() => {
    loadProfile();
    }, 500);
  } catch (error) {
    showMessage('Error updating profile: ' + (error.message || 'Unknown error'), 'error');
  }
  
  return false;
}

// Load Medical Cases
async function loadMedicalCases() {
  const tbody = document.getElementById('medical-cases-tbody');
  const pageHeader = document.querySelector('#page-medical-cases .page-header');
  if (!tbody) return;

  // Show/hide add button based on role
  if (pageHeader && currentUser?.role === 'patient') {
    const existingBtn = pageHeader.querySelector('.btn-primary');
    if (!existingBtn) {
      const addBtn = document.createElement('button');
      addBtn.className = 'btn btn-primary';
      addBtn.textContent = 'Add New Case';
      addBtn.onclick = showAddMedicalCaseModal;
      pageHeader.appendChild(addBtn);
    }
  }

  try {
    let cases;
    if (currentUser?.role === 'patient') {
      // Patients should see their own cases
      cases = await apiCall('/medical-cases', 'GET').catch(() => []);
      // Filter by patient_id if needed
      if (Array.isArray(cases) && currentUser.user_id) {
        cases = cases.filter(c => c.patient_id === currentUser.user_id);
      }
    } else {
      cases = await apiCall('/medical-cases', 'GET').catch(() => []);
    }
    displayMedicalCases(Array.isArray(cases) ? cases : [], tbody);
  } catch (error) {
    console.error('Error loading medical cases:', error);
    showMessage('Error loading medical cases', 'error');
    if (tbody) tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Error loading data</td></tr>';
  }
}

// Display Medical Cases
function displayMedicalCases(cases, tbody) {
  if (!cases || cases.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No medical cases</td></tr>';
    return;
  }

  tbody.innerHTML = cases.map(caseItem => `
    <tr>
      <td>${caseItem.case_id}</td>
      <td>${caseItem.case_title || 'Not specified'}</td>
      <td><span class="status-badge status-${caseItem.case_status || 'active'}">${getStatusText(caseItem.case_status || 'active')}</span></td>
      <td>${caseItem.target_amount || 0} ${caseItem.currency || 'USD'}</td>
      <td>${caseItem.raised_amount || 0} ${caseItem.currency || 'USD'}</td>
      <td>${formatDate(caseItem.created_at)}</td>
      <td>
        <button class="btn btn-secondary" onclick="viewMedicalCase(${caseItem.case_id})">View</button>
        ${currentUser?.role === 'admin' ? `<button class="btn btn-danger" onclick="deleteMedicalCase(${caseItem.case_id})">Delete</button>` : ''}
      </td>
    </tr>
  `).join('');
}

async function deleteMedicalCase(id) {
  if (confirm('Are you sure you want to delete this medical case?')) {
    try {
      await apiCall(`/medical-cases/${id}`, 'DELETE');
      showMessage('Medical case deleted successfully', 'success');
      loadMedicalCases();
      loadDashboard();
    } catch (error) {
      showMessage('Error deleting case: ' + (error.message || 'Unknown error'), 'error');
    }
  }
}

// Load Consultations
async function loadConsultations() {
  const container = document.getElementById('consultations-list');
  const pageHeader = document.querySelector('#page-consultations .page-header');
  if (!container) return;

  // Show/hide add button based on role
  if (pageHeader && currentUser?.role === 'patient') {
    const existingBtn = pageHeader.querySelector('.btn-primary');
    if (!existingBtn) {
      const addBtn = document.createElement('button');
      addBtn.className = 'btn btn-primary';
      addBtn.textContent = 'New Consultation';
      addBtn.onclick = showAddConsultationModal;
      pageHeader.appendChild(addBtn);
    }
  }

  try {
    // Note: There's no GET all consultations endpoint in the backend
    // This would need to be added to the backend routes
    container.innerHTML = '<p style="text-align: center; padding: 40px;">No consultations available. Use the "New Consultation" button to create a consultation.</p>';
  } catch (error) {
    console.error('Error loading consultations:', error);
    showMessage('Error loading consultations', 'error');
    if (container) container.innerHTML = '<p style="text-align: center; padding: 40px;">Error loading data</p>';
  }
}

// Display Consultations
function displayConsultations(consultations, container) {
  if (!consultations || consultations.length === 0) {
    container.innerHTML = '<p style="text-align: center; padding: 40px;">No consultations</p>';
    return;
  }

  container.innerHTML = consultations.map(consultation => `
    <div class="consultation-card">
      <div class="card-header">
        <div>
          <div class="card-title">استشارة #${consultation.consultation_id}</div>
          <div class="card-meta">${formatDate(consultation.created_at)}</div>
        </div>
        <span class="status-badge status-${consultation.status || 'pending'}">${consultation.status || 'Pending'}</span>
      </div>
      <div class="card-actions">
        <button class="btn btn-primary" onclick="viewConsultation(${consultation.consultation_id})">View</button>
      </div>
    </div>
  `).join('');
}

// Load Donations
async function loadDonations() {
  const tbody = document.getElementById('donations-tbody');
  const pageHeader = document.querySelector('#page-donations .page-header');
  if (!tbody) return;

  // Show/hide add button based on role
  if (pageHeader && currentUser?.role === 'donor') {
    const existingBtn = pageHeader.querySelector('.btn-primary');
    if (!existingBtn) {
      const addBtn = document.createElement('button');
      addBtn.className = 'btn btn-primary';
      addBtn.textContent = 'New Donation';
      addBtn.onclick = showAddDonationModal;
      pageHeader.appendChild(addBtn);
    }
  }

  try {
    // Note: There's no GET all donations endpoint, so we'll show empty state
    const donations = await apiCall('/donations', 'GET').catch(() => []);
    displayDonations(Array.isArray(donations) ? donations : [], tbody);
  } catch (error) {
    console.error('Error loading donations:', error);
    showMessage('Error loading donations', 'error');
    if (tbody) tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Error loading data</td></tr>';
  }
}

// Display Donations
function displayDonations(donations, tbody) {
  if (!donations || donations.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No donations</td></tr>';
    return;
  }

  tbody.innerHTML = donations.map(donation => `
    <tr>
      <td>${donation.donation_id}</td>
      <td>${donation.donation_type || 'Not specified'}</td>
      <td>${donation.amount || 0}</td>
      <td>${donation.currency || 'USD'}</td>
      <td><span class="status-badge status-${donation.payment_status || 'pending'}">${getStatusText(donation.payment_status || 'pending')}</span></td>
      <td>${formatDate(donation.created_at)}</td>
      <td>
        <button class="btn btn-secondary" onclick="viewDonation(${donation.donation_id})">View</button>
      </td>
    </tr>
  `).join('');
}

// Load Medication Requests
async function loadMedicationRequests() {
  const tbody = document.getElementById('medication-requests-tbody');
  const pageHeader = document.querySelector('#page-medication-requests .page-header');
  if (!tbody) return;

  // Show/hide add button based on role
  if (pageHeader && currentUser?.role === 'patient') {
    const existingBtn = pageHeader.querySelector('.btn-primary');
    if (!existingBtn) {
      const addBtn = document.createElement('button');
      addBtn.className = 'btn btn-primary';
      addBtn.textContent = 'New Request';
      addBtn.onclick = showAddMedicationRequestModal;
      pageHeader.appendChild(addBtn);
    }
  }

  try {
    const requests = await apiCall('/medication_requests', 'GET').catch(() => []);
    displayMedicationRequests(Array.isArray(requests) ? requests : [], tbody);
  } catch (error) {
    console.error('Error loading medication requests:', error);
    showMessage('Error loading medication requests', 'error');
    if (tbody) tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Error loading data</td></tr>';
  }
}

// Display Medication Requests
function displayMedicationRequests(requests, tbody) {
  if (!requests || requests.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No requests</td></tr>';
    return;
  }

  tbody.innerHTML = requests.map(request => `
    <tr>
      <td>${request.request_id}</td>
      <td>${request.medication_name || 'Not specified'}</td>
      <td>${request.quantity_needed || 0}</td>
      <td>${request.dosage || 'Not specified'}</td>
      <td><span class="status-badge status-${request.request_status || 'open'}">${getStatusText(request.request_status || 'open')}</span></td>
      <td>${formatDate(request.created_at)}</td>
      <td>
        <button class="btn btn-secondary" onclick="viewMedicationRequest(${request.request_id})">View</button>
        ${currentUser?.role === 'pharmacy' && request.request_status === 'open' ? `
          <button class="btn btn-success" onclick="approveMedicationRequest(${request.request_id})">Approve</button>
        ` : ''}
      </td>
    </tr>
  `).join('');
}

async function approveMedicationRequest(id) {
  try {
    await apiCall(`/medication_requests/${id}`, 'PATCH', { request_status: 'matched' });
    showMessage('Request approved successfully', 'success');
    loadMedicationRequests();
  } catch (error) {
    showMessage('Error approving request: ' + (error.message || 'Unknown error'), 'error');
  }
}

// Load Mental Health Sessions
async function loadMentalHealthSessions() {
  const container = document.getElementById('mental-health-sessions-list');
  const pageHeader = document.querySelector('#page-mental-health .page-header');
  if (!container) return;

  // Show/hide add button based on role
  if (pageHeader && currentUser?.role === 'patient') {
    const existingBtn = pageHeader.querySelector('.btn-primary');
    if (!existingBtn) {
      const addBtn = document.createElement('button');
      addBtn.className = 'btn btn-primary';
      addBtn.textContent = 'New Session';
      addBtn.onclick = showAddMentalHealthSessionModal;
      pageHeader.appendChild(addBtn);
    }
  }

  try {
    // Note: There's no GET all mental health sessions endpoint in the backend
    // This would need to be added to the backend routes
    const response = await apiCall('/mental_health_sessions', 'GET').catch(() => null);
    if (response && Array.isArray(response)) {
      displayMentalHealthSessions(response, container);
    } else {
      container.innerHTML = '<p style="text-align: center; padding: 40px;">No sessions available. Use the "New Session" button to create a mental health session.</p>';
    }
  } catch (error) {
    console.error('Error loading sessions:', error);
    showMessage('Error loading sessions: ' + (error.message || 'Unknown error'), 'error');
    if (container) container.innerHTML = '<p style="text-align: center; padding: 40px;">Error loading data. Please try again later.</p>';
  }
}

// Display Mental Health Sessions
function displayMentalHealthSessions(sessions, container) {
  if (!sessions || sessions.length === 0) {
    container.innerHTML = '<p style="text-align: center; padding: 40px;">No sessions</p>';
    return;
  }

  container.innerHTML = sessions.map(session => `
    <div class="session-card">
      <div class="card-header">
        <div>
          <div class="card-title">Session #${session.session_id}</div>
          <div class="card-meta">Type: ${session.session_type || 'Not specified'} | Status: <span class="status-badge status-${session.session_status || 'scheduled'}">${getStatusText(session.session_status || 'scheduled')}</span></div>
          <div class="card-meta">${formatDate(session.created_at)}</div>
        </div>
      </div>
    </div>
  `).join('');
}

// Load Support Groups
async function loadSupportGroups() {
  const container = document.getElementById('support-groups-list');
  if (!container) return;

  try {
    // Note: There's no GET all support groups endpoint in the backend
    // This would need to be added to the backend routes
    const response = await apiCall('/support_groups', 'GET').catch(() => null);
    if (response && Array.isArray(response)) {
      displaySupportGroups(response, container);
    } else {
      container.innerHTML = '<p style="text-align: center; padding: 40px;">No support groups available. Use the "New Group" button to create a support group.</p>';
    }
  } catch (error) {
    console.error('Error loading support groups:', error);
    showMessage('Error loading support groups: ' + (error.message || 'Unknown error'), 'error');
    if (container) {
      container.innerHTML = '<p style="text-align: center; padding: 40px;">Error loading data. Please try again later.</p>';
    }
  }
}

// Display Support Groups
function displaySupportGroups(groups, container) {
  if (!groups || groups.length === 0) {
    container.innerHTML = '<p style="text-align: center; padding: 40px;">No groups</p>';
    return;
  }

  container.innerHTML = groups.map(group => `
    <div class="group-card">
      <div class="card-header">
        <div>
          <div class="card-title">${group.group_name || 'Support Group'}</div>
          <div class="card-meta">Type: ${group.group_type || 'Not specified'} | Members: ${group.current_members || 0}/${group.max_members || 20}</div>
          <div class="card-meta">${group.description || ''}</div>
        </div>
      </div>
    </div>
  `).join('');
}

// Load NGOs
async function loadNGOs() {
  const container = document.getElementById('ngos-grid');
  if (!container) return;

  try {
    const response = await apiCall('/ngos', 'GET');
    // Handle both response formats: {data: [...]} or [...]
    const ngos = Array.isArray(response) ? response : (response?.data || response || []);
    displayNGOs(ngos, container);
  } catch (error) {
    console.error('Error loading NGOs:', error);
    showMessage('Error loading NGOs: ' + (error.message || 'Unknown error'), 'error');
    if (container) {
      container.innerHTML = '<p style="text-align: center; padding: 40px; grid-column: 1/-1;">Error loading NGOs. Please try again later.</p>';
    }
  }
}

// Display NGOs
function displayNGOs(ngos, container) {
  if (!ngos || ngos.length === 0) {
    container.innerHTML = '<p style="text-align: center; padding: 40px; grid-column: 1/-1;">No NGOs found</p>';
    return;
  }

  container.innerHTML = ngos.map(ngo => {
    let description = 'No description';
    try {
      if (ngo.meta) {
        const meta = typeof ngo.meta === 'string' ? JSON.parse(ngo.meta) : ngo.meta;
        description = meta.description || description;
      }
    } catch (e) {
      console.error('Error parsing NGO meta:', e);
    }

    return `
    <div class="ngo-card">
        <h3>${ngo.organization_name || 'NGO'}</h3>
        <p>${description}</p>
        <p><strong>Contact Person:</strong> ${ngo.contact_person || 'Not specified'}</p>
        <p><strong>License:</strong> ${ngo.license_number || 'Not specified'}</p>
        <p><strong>Verified:</strong> ${ngo.verified ? 'Yes' : 'No'}</p>
      ${currentUser?.role === 'admin' ? `
        <div class="card-actions" style="margin-top: 15px;">
            <button class="btn btn-secondary" onclick="editNGO(${ngo.ngo_id})">Edit</button>
            <button class="btn btn-danger" onclick="deleteNGO(${ngo.ngo_id})">Delete</button>
        </div>
      ` : ''}
    </div>
    `;
  }).join('');
}

// Load Medical Inventory
async function loadMedicalInventory() {
  const tbody = document.getElementById('inventory-tbody');
  const pageHeader = document.querySelector('#page-medical-inventory .page-header');
  if (!tbody) return;

  // Show/hide add button based on role
  if (pageHeader && currentUser?.role === 'pharmacy') {
    const existingBtn = pageHeader.querySelector('.btn-primary');
    if (!existingBtn) {
      const addBtn = document.createElement('button');
      addBtn.className = 'btn btn-primary';
      addBtn.textContent = 'Add Item';
      addBtn.onclick = showAddInventoryModal;
      pageHeader.appendChild(addBtn);
    }
  }

  try {
    const inventory = await apiCall('/medical_inventory', 'GET').catch(() => []);
    displayMedicalInventory(Array.isArray(inventory) ? inventory : [], tbody);
  } catch (error) {
    console.error('Error loading inventory:', error);
    showMessage('Error loading inventory', 'error');
    if (tbody) tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Error loading data</td></tr>';
  }
}

// Display Medical Inventory
function displayMedicalInventory(inventory, tbody) {
  if (!inventory || inventory.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No inventory</td></tr>';
    return;
  }

  tbody.innerHTML = inventory.map(item => `
    <tr>
      <td>${item.item_name || 'Not specified'}</td>
      <td>${item.quantity_available || 0}</td>
      <td>${item.item_type || 'Not specified'}</td>
      <td>${item.expiry_date ? formatDate(item.expiry_date) : 'Not specified'}</td>
      <td><span class="status-badge status-${item.availability_status || 'available'}">${getStatusText(item.availability_status || 'available')}</span></td>
      <td>
        <button class="btn btn-secondary" onclick="editInventory(${item.inventory_id})">Edit</button>
      </td>
    </tr>
  `).join('');
}

// Load Users (Admin only)
async function loadUsers() {
  const tbody = document.getElementById('users-tbody');
  if (!tbody) return;

  try {
    const users = await apiCall('/users', 'GET');
    displayUsers(users, tbody);
  } catch (error) {
    showMessage('Error loading users', 'error');
  }
}

// Display Users
function displayUsers(users, tbody) {
  if (!users || users.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No users</td></tr>';
    return;
  }

  const roleNames = {
    patient: 'Patient',
    doctor: 'Doctor',
    donor: 'Donor',
    ngo: 'NGO',
    pharmacy: 'Pharmacy',
    admin: 'Admin'
  };

  tbody.innerHTML = users.map(user => `
    <tr>
      <td>${user.full_name || 'Not specified'}</td>
      <td>${user.email || 'Not specified'}</td>
      <td>${roleNames[user.role] || user.role}</td>
      <td><span class="status-badge status-${user.is_active ? 'active' : 'inactive'}">${user.is_active ? 'Active' : 'Inactive'}</span></td>
      <td>
        <button class="btn btn-secondary" onclick="viewUser(${user.user_id})">View</button>
        <button class="btn btn-danger" onclick="deleteUser(${user.user_id})">Delete</button>
      </td>
    </tr>
  `).join('');
}

// Load System Settings
function loadSystemSettings() {
  const container = document.getElementById('system-settings');
  if (!container) return;

  container.innerHTML = `
    <div class="profile-container">
      <h3>System Settings</h3>
      <p>Settings page under development</p>
    </div>
  `;
}

// API Call Helper
async function apiCall(endpoint, method = 'GET', data = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    }
  };

  if (data && method !== 'GET') {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

  if (response.status === 401) {
    // Unauthorized - redirect to login
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    window.location.href = '/login.html';
    return;
  }

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Request error');
  }

  return result.data || result;
}

// Show Message
function showMessage(message, type = 'info') {
  // Remove existing message if any
  const existingMessage = document.getElementById('global-message');
  if (existingMessage) {
    existingMessage.remove();
  }
  
  // Create new message element
  const messageEl = document.createElement('div');
  messageEl.id = 'global-message';
  messageEl.className = `message ${type}`;
  messageEl.textContent = message;
  
  // Find the best place to insert the message
  const contentArea = document.querySelector('.content-area');
  const currentPage = document.querySelector('.page.active');
  
  if (currentPage) {
    // Insert at the top of the current active page, after page-header
    const pageHeader = currentPage.querySelector('.page-header');
    if (pageHeader) {
      pageHeader.insertAdjacentElement('afterend', messageEl);
    } else {
      currentPage.insertBefore(messageEl, currentPage.firstChild);
    }
  } else if (contentArea) {
    contentArea.insertBefore(messageEl, contentArea.firstChild);
  } else {
    document.body.insertBefore(messageEl, document.body.firstChild);
  }
  
  // Force reflow and then show message with animation
  messageEl.offsetHeight;
  setTimeout(() => {
    messageEl.classList.add('show');
  }, 10);
  
  // Remove message after 5 seconds
  setTimeout(() => {
    messageEl.classList.remove('show');
    setTimeout(() => {
      if (messageEl.parentNode) {
        messageEl.remove();
      }
    }, 300);
  }, 5000);
}

// Format Date
function formatDate(dateString) {
  if (!dateString) return 'Not specified';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Get Status Text
function getStatusText(status) {
  const statusMap = {
    'pending': 'Pending',
    'approved': 'Approved',
    'rejected': 'Rejected',
    'active': 'Active',
    'inactive': 'Inactive',
    'completed': 'Completed',
    'cancelled': 'Cancelled',
    'open': 'Open',
    'matched': 'Matched',
    'fulfilled': 'Fulfilled',
    'confirmed': 'Confirmed',
    'in_progress': 'In Progress',
    'no_show': 'No Show',
    'scheduled': 'Scheduled',
    'in_treatment': 'In Treatment',
    'funded': 'Funded',
    'available': 'Available',
    'reserved': 'Reserved',
    'distributed': 'Distributed'
  };
  return statusMap[status] || status;
}

// Toggle Sidebar (Mobile)
function toggleSidebar() {
  document.querySelector('.sidebar').classList.toggle('open');
}

// Logout
function handleLogout() {
  if (confirm('Are you sure you want to logout?')) {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    window.location.href = '/login.html';
  }
}

// Modal Functions
function showModal(title, content) {
  const overlay = document.getElementById('modal-overlay');
  if (!overlay) return;

  overlay.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h3>${title}</h3>
        <button class="modal-close" onclick="closeModal()">×</button>
      </div>
      <div class="modal-body">
        ${content}
      </div>
    </div>
  `;
  overlay.classList.add('active');
}

function closeModal() {
  const overlay = document.getElementById('modal-overlay');
  if (overlay) {
    overlay.classList.remove('active');
  }
}

// Add Medical Case Modal
function showAddMedicalCaseModal() {
  const content = `
    <form id="add-medical-case-form" onsubmit="handleAddMedicalCase(event)">
      <div class="form-group">
        <label>Case Title *</label>
        <input type="text" name="case_title" required>
      </div>
      <div class="form-group">
        <label>Case Description *</label>
        <textarea name="case_description" rows="4" required></textarea>
      </div>
      <div class="form-group">
        <label>Target Amount *</label>
        <input type="number" name="target_amount" step="0.01" min="0" required>
      </div>
      <div class="form-group">
        <label>Medical Condition</label>
        <input type="text" name="medical_condition">
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
        <button type="submit" class="btn btn-primary">Add</button>
      </div>
    </form>
  `;
  showModal('Add New Medical Case', content);
}

async function handleAddMedicalCase(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = {
    patient_id: currentUser.user_id,
    case_title: formData.get('case_title'),
    case_description: formData.get('case_description'),
    target_amount: parseFloat(formData.get('target_amount')),
    medical_condition: formData.get('medical_condition') || null
  };

  try {
    await apiCall('/medical-cases', 'POST', data);
    showMessage('Medical case added successfully', 'success');
    closeModal();
    loadMedicalCases();
    loadDashboard();
  } catch (error) {
    showMessage('Error adding medical case: ' + (error.message || 'Unknown error'), 'error');
  }
}

// Add Consultation Modal
function showAddConsultationModal() {
  const content = `
    <form id="add-consultation-form" onsubmit="handleAddConsultation(event)">
      <div class="form-group">
        <label>Consultation Type *</label>
        <select name="consultation_type" required>
          <option value="video">Video</option>
          <option value="audio">Audio</option>
          <option value="message">Message</option>
          <option value="in_person">In Person</option>
        </select>
      </div>
      <div class="form-group">
        <label>Scheduled Date & Time</label>
        <input type="datetime-local" name="scheduled_at">
      </div>
      <div class="form-group">
        <label>Duration (minutes)</label>
        <input type="number" name="duration_minutes" min="15" step="15" value="30">
      </div>
      <div class="form-group">
        <label>Notes</label>
        <textarea name="notes" rows="3"></textarea>
      </div>
      <div class="form-group">
        <label>
          <input type="checkbox" name="low_bandwidth"> Low bandwidth connection
        </label>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
        <button type="submit" class="btn btn-primary">Add</button>
      </div>
    </form>
  `;
  showModal('Add New Consultation', content);
}

async function handleAddConsultation(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = {
    patient_id: currentUser.user_id,
    consultation_type: formData.get('consultation_type'),
    scheduled_at: formData.get('scheduled_at') || null,
    duration_minutes: formData.get('duration_minutes') ? parseInt(formData.get('duration_minutes')) : null,
    notes: formData.get('notes') || null,
    low_bandwidth: formData.has('low_bandwidth'),
    status: 'pending'
  };

  try {
    await apiCall('/consultations', 'POST', data);
    showMessage('Consultation added successfully', 'success');
    closeModal();
    loadConsultations();
    loadDashboard();
  } catch (error) {
    showMessage('Error adding consultation: ' + (error.message || 'Unknown error'), 'error');
  }
}

// Add Donation Modal
function showAddDonationModal() {
  const content = `
    <form id="add-donation-form" onsubmit="handleAddDonation(event)">
      <div class="form-group">
        <label>Medical Case ID *</label>
        <input type="number" name="medical_case_id" required>
      </div>
      <div class="form-group">
        <label>Amount *</label>
        <input type="number" name="amount" step="0.01" min="0" required>
      </div>
      <div class="form-group">
        <label>Currency</label>
        <select name="currency">
          <option value="USD">USD</option>
          <option value="SAR">SAR</option>
          <option value="EUR">EUR</option>
        </select>
      </div>
      <div class="form-group">
        <label>Donation Type</label>
        <select name="donation_type">
          <option value="one_time">One Time</option>
          <option value="recurring">Recurring</option>
        </select>
      </div>
      <div class="form-group">
        <label>Payment Method</label>
        <input type="text" name="payment_method">
      </div>
      <div class="form-group">
        <label>Donor Message</label>
        <textarea name="donor_message" rows="3"></textarea>
      </div>
      <div class="form-group">
        <label>
          <input type="checkbox" name="is_anonymous"> Anonymous Donation
        </label>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
        <button type="submit" class="btn btn-primary">Add</button>
      </div>
    </form>
  `;
  showModal('Add New Donation', content);
}

async function handleAddDonation(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = {
    donor_id: currentUser.user_id,
    medical_case_id: parseInt(formData.get('medical_case_id')),
    amount: parseFloat(formData.get('amount')),
    currency: formData.get('currency') || 'USD',
    donation_type: formData.get('donation_type') || 'one_time',
    payment_method: formData.get('payment_method') || null,
    donor_message: formData.get('donor_message') || null,
    is_anonymous: formData.has('is_anonymous')
  };

  try {
    await apiCall('/donations', 'POST', data);
    showMessage('Donation added successfully', 'success');
    closeModal();
    loadDonations();
    loadDashboard();
  } catch (error) {
    showMessage('Error adding donation: ' + (error.message || 'Unknown error'), 'error');
  }
}

// Add Medication Request Modal
function showAddMedicationRequestModal() {
  const content = `
    <form id="add-medication-request-form" onsubmit="handleAddMedicationRequest(event)">
      <div class="form-group">
        <label>Medication Name *</label>
        <input type="text" name="medication_name" required>
      </div>
      <div class="form-group">
        <label>Quantity Needed *</label>
        <input type="number" name="quantity_needed" min="1" required>
      </div>
      <div class="form-group">
        <label>Dosage</label>
        <input type="text" name="dosage">
      </div>
      <div class="form-group">
        <label>Urgency Level</label>
        <select name="urgency_level">
          <option value="low">Low</option>
          <option value="medium" selected>Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </div>
      <div class="form-group">
        <label>Medical Condition (optional)</label>
        <input type="text" name="medical_condition">
      </div>
      <div class="form-group">
        <label>Related Medical Case ID (optional)</label>
        <input type="number" name="medical_case_id">
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
        <button type="submit" class="btn btn-primary">Add</button>
      </div>
    </form>
  `;
  showModal('Add New Medication Request', content);
}

async function handleAddMedicationRequest(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = {
    patient_id: currentUser.user_id,
    medication_name: formData.get('medication_name'),
    quantity_needed: parseInt(formData.get('quantity_needed')),
    dosage: formData.get('dosage') || null,
    urgency_level: formData.get('urgency_level') || 'medium',
    medical_condition: formData.get('medical_condition') || null,
    medical_case_id: formData.get('medical_case_id') ? parseInt(formData.get('medical_case_id')) : null,
    request_status: 'open'
  };

  try {
    await apiCall('/medication_requests', 'POST', data);
    showMessage('Medication request added successfully', 'success');
    closeModal();
    loadMedicationRequests();
    loadDashboard();
  } catch (error) {
    showMessage('Error adding medication request: ' + (error.message || 'Unknown error'), 'error');
  }
}

// Add Mental Health Session Modal
function showAddMentalHealthSessionModal() {
  const content = `
    <form id="add-mental-health-form" onsubmit="handleAddMentalHealthSession(event)">
      <div class="form-group">
        <label>Session Type *</label>
        <select name="session_type" required>
          <option value="individual">Individual</option>
          <option value="group">Group</option>
          <option value="anonymous_chat">Anonymous Chat</option>
          <option value="support_group">Support Group</option>
        </select>
      </div>
      <div class="form-group">
        <label>Scheduled Date & Time</label>
        <input type="datetime-local" name="scheduled_datetime">
      </div>
      <div class="form-group">
        <label>Duration (minutes)</label>
        <input type="number" name="duration_minutes" min="15" step="15" value="60">
      </div>
      <div class="form-group">
        <label>Session Notes</label>
        <textarea name="session_notes" rows="3"></textarea>
      </div>
      <div class="form-group">
        <label>Trauma Type</label>
        <select name="trauma_type">
          <option value="">Select</option>
          <option value="war">War</option>
          <option value="loss">Loss</option>
          <option value="chronic_illness">Chronic Illness</option>
          <option value="disability">Disability</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div class="form-group">
        <label>
          <input type="checkbox" name="is_anonymous"> Anonymous Session
        </label>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
        <button type="submit" class="btn btn-primary">Add</button>
      </div>
    </form>
  `;
  showModal('Add New Mental Health Session', content);
}

async function handleAddMentalHealthSession(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = {
    patient_id: currentUser.user_id,
    session_type: formData.get('session_type'),
    scheduled_datetime: formData.get('scheduled_datetime') || null,
    duration_minutes: formData.get('duration_minutes') ? parseInt(formData.get('duration_minutes')) : 60,
    session_notes: formData.get('session_notes') || null,
    trauma_type: formData.get('trauma_type') || null,
    is_anonymous: formData.has('is_anonymous'),
    session_status: 'scheduled'
  };

  try {
    await apiCall('/mental_health_sessions', 'POST', data);
    showMessage('Mental health session added successfully', 'success');
    closeModal();
    loadMentalHealthSessions();
    loadDashboard();
  } catch (error) {
    showMessage('Error adding session: ' + (error.message || 'Unknown error'), 'error');
  }
}

// Add Support Group Modal
function showAddSupportGroupModal() {
  const content = `
    <form id="add-support-group-form" onsubmit="handleAddSupportGroup(event)">
      <div class="form-group">
        <label>Group Name *</label>
        <input type="text" name="group_name" required>
      </div>
      <div class="form-group">
        <label>Group Type *</label>
        <select name="group_type" required>
          <option value="ptsd">PTSD</option>
          <option value="grief">Grief</option>
          <option value="chronic_illness">Chronic Illness</option>
          <option value="disability">Disability</option>
          <option value="general">General</option>
        </select>
      </div>
      <div class="form-group">
        <label>Description *</label>
        <textarea name="description" rows="4" required></textarea>
      </div>
      <div class="form-group">
        <label>Max Members</label>
        <input type="number" name="max_members" min="1" value="20">
      </div>
      <div class="form-group">
        <label>Meeting Schedule</label>
        <input type="text" name="meeting_schedule" placeholder="e.g., Every Monday at 6 PM">
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
        <button type="submit" class="btn btn-primary">Add</button>
      </div>
    </form>
  `;
  showModal('Add New Support Group', content);
}

async function handleAddSupportGroup(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = {
    group_name: formData.get('group_name'),
    group_type: formData.get('group_type'),
    description: formData.get('description'),
    max_members: formData.get('max_members') ? parseInt(formData.get('max_members')) : 20,
    meeting_schedule: formData.get('meeting_schedule') || null,
    moderator_id: currentUser.user_id,
    current_members: 0,
    is_active: true
  };

  try {
    await apiCall('/support_groups', 'POST', data);
    showMessage('Support group added successfully', 'success');
    closeModal();
    loadSupportGroups();
  } catch (error) {
    showMessage('Error adding support group: ' + (error.message || 'Unknown error'), 'error');
  }
}

// Add NGO Modal
function showAddNGOModal() {
  const content = `
    <form id="add-ngo-form" onsubmit="handleAddNGO(event)">
      <div class="form-group">
        <label>User ID (NGO User) *</label>
        <input type="number" name="ngo_id" required placeholder="Enter the user ID for this NGO">
      </div>
      <div class="form-group">
        <label>Organization Name *</label>
        <input type="text" name="organization_name" required>
      </div>
      <div class="form-group">
        <label>Description *</label>
        <textarea name="description" rows="4" required></textarea>
      </div>
      <div class="form-group">
        <label>Contact Person</label>
        <input type="text" name="contact_person">
      </div>
      <div class="form-group">
        <label>License Number</label>
        <input type="text" name="license_number">
      </div>
      <div class="form-group">
        <label>
          <input type="checkbox" name="verified"> Verified
        </label>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
        <button type="submit" class="btn btn-primary">Add</button>
      </div>
    </form>
  `;
  showModal('Add New NGO', content);
}

async function handleAddNGO(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const meta = {
    description: formData.get('description')
  };
  const data = {
    ngo_id: parseInt(formData.get('ngo_id')),
    organization_name: formData.get('organization_name'),
    contact_person: formData.get('contact_person') || null,
    license_number: formData.get('license_number') || null,
    verified: formData.has('verified'),
    meta: meta,
    created_by: currentUser.user_id
  };

  try {
    await apiCall('/ngos', 'POST', data);
    showMessage('NGO added successfully', 'success');
    closeModal();
    loadNGOs();
    loadDashboard();
  } catch (error) {
    showMessage('Error adding NGO: ' + (error.message || 'Unknown error'), 'error');
  }
}

// Add Inventory Modal
function showAddInventoryModal() {
  const content = `
    <form id="add-inventory-form" onsubmit="handleAddInventory(event)">
      <div class="form-group">
        <label>Item Name *</label>
        <input type="text" name="item_name" required>
      </div>
      <div class="form-group">
        <label>Quantity Available *</label>
        <input type="number" name="quantity_available" min="0" required>
      </div>
      <div class="form-group">
        <label>Item Type *</label>
        <select name="item_type" required>
          <option value="medication">Medication</option>
          <option value="equipment">Equipment</option>
          <option value="supplies">Supplies</option>
        </select>
      </div>
      <div class="form-group">
        <label>Expiry Date</label>
        <input type="date" name="expiry_date">
      </div>
      <div class="form-group">
        <label>Description</label>
        <textarea name="description" rows="3"></textarea>
      </div>
      <div class="form-group">
        <label>Condition Status</label>
        <select name="condition_status">
          <option value="new">New</option>
          <option value="good" selected>Good</option>
          <option value="fair">Fair</option>
          <option value="poor">Poor</option>
        </select>
      </div>
      <div class="form-group">
        <label>Location</label>
        <input type="text" name="location">
      </div>
      <div class="form-group">
        <label>Availability Status</label>
        <select name="availability_status">
          <option value="available" selected>Available</option>
          <option value="reserved">Reserved</option>
          <option value="distributed">Distributed</option>
        </select>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
        <button type="submit" class="btn btn-primary">Add</button>
      </div>
    </form>
  `;
  showModal('Add Inventory Item', content);
}

async function handleAddInventory(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = {
    provider_id: currentUser.user_id,
    item_name: formData.get('item_name'),
    quantity_available: parseInt(formData.get('quantity_available')),
    item_type: formData.get('item_type'),
    expiry_date: formData.get('expiry_date') || null,
    description: formData.get('description') || null,
    condition_status: formData.get('condition_status') || 'good',
    location: formData.get('location') || null,
    availability_status: formData.get('availability_status') || 'available'
  };

  try {
    await apiCall('/medical_inventory', 'POST', data);
    showMessage('Inventory item added successfully', 'success');
    closeModal();
    loadMedicalInventory();
    loadDashboard();
  } catch (error) {
    showMessage('Error adding inventory item: ' + (error.message || 'Unknown error'), 'error');
  }
}

// View Functions
async function viewMedicalCase(id) {
  try {
    const caseData = await apiCall(`/medical-cases/${id}`, 'GET');
    const donations = await apiCall(`/medical-cases/${id}/donations`, 'GET').catch(() => ({ donations: [] }));
    
    const content = `
      <div style="margin-bottom: 20px;">
        <h4>${caseData.case_title || 'Medical Case'}</h4>
        <p><strong>Description:</strong> ${caseData.case_description || 'Not specified'}</p>
        <p><strong>Target Amount:</strong> ${caseData.target_amount || 0} ${caseData.currency || 'USD'}</p>
        <p><strong>Raised Amount:</strong> ${caseData.raised_amount || 0} ${caseData.currency || 'USD'}</p>
        <p><strong>Status:</strong> <span class="status-badge status-${caseData.case_status || 'active'}">${getStatusText(caseData.case_status || 'active')}</span></p>
        <p><strong>Medical Condition:</strong> ${caseData.medical_condition || 'Not specified'}</p>
        <p><strong>Created At:</strong> ${formatDate(caseData.created_at)}</p>
      </div>
      ${donations.donations && donations.donations.length > 0 ? `
        <div>
          <h4>Donations:</h4>
          <ul>
            ${donations.donations.map(d => `<li>${d.amount} ${d.currency} - ${formatDate(d.created_at)}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeModal()">Close</button>
      </div>
    `;
    showModal('Medical Case Details', content);
  } catch (error) {
    showMessage('Error loading case: ' + (error.message || 'Unknown error'), 'error');
  }
}

async function viewConsultation(id) {
  try {
    const consultation = await apiCall(`/consultations/${id}`, 'GET');
    const messages = await apiCall(`/consultations/${id}/messages`, 'GET').catch(() => ({ messages: [] }));
    
    const content = `
      <div style="margin-bottom: 20px;">
        <p><strong>Consultation Type:</strong> ${consultation.consultation.consultation_type || 'Not specified'}</p>
        <p><strong>Status:</strong> <span class="status-badge status-${consultation.consultation.status || 'pending'}">${getStatusText(consultation.consultation.status || 'pending')}</span></p>
        <p><strong>Scheduled At:</strong> ${consultation.consultation.scheduled_at ? formatDate(consultation.consultation.scheduled_at) : 'Not specified'}</p>
        <p><strong>Notes:</strong> ${consultation.consultation.notes || 'None'}</p>
      </div>
      ${messages.messages && messages.messages.length > 0 ? `
        <div>
          <h4>Messages:</h4>
          <div style="max-height: 300px; overflow-y: auto;">
            ${messages.messages.map(m => `
              <div style="padding: 10px; margin-bottom: 10px; background: #f8f9fa; border-radius: 8px;">
                <p>${m.message_text || ''}</p>
                <small>${formatDate(m.sent_at)}</small>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeModal()">Close</button>
        <button class="btn btn-primary" onclick="showSendMessageModal(${id})">Send Message</button>
      </div>
    `;
    showModal('Consultation Details', content);
  } catch (error) {
    showMessage('Error loading consultation: ' + (error.message || 'Unknown error'), 'error');
  }
}

function showSendMessageModal(consultationId) {
  const content = `
    <form id="send-message-form" onsubmit="handleSendMessage(event, ${consultationId})">
      <div class="form-group">
        <label>Message *</label>
        <textarea name="content" rows="4" required></textarea>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" onclick="closeModal(); viewConsultation(${consultationId})">Cancel</button>
        <button type="submit" class="btn btn-primary">Send</button>
      </div>
    </form>
  `;
  showModal('Send Message', content);
}

async function handleSendMessage(e, consultationId) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = {
    content: formData.get('content'),
    content_type: 'text'
  };

  try {
    await apiCall(`/consultations/${consultationId}/messages`, 'POST', data);
    showMessage('Message sent successfully', 'success');
    closeModal();
    viewConsultation(consultationId);
  } catch (error) {
    showMessage('Error sending message: ' + (error.message || 'Unknown error'), 'error');
  }
}

async function viewDonation(id) {
  try {
    const donation = await apiCall(`/donations/${id}`, 'GET');
    const donationData = donation.donation || donation;
    const content = `
      <div style="margin-bottom: 20px;">
        <p><strong>Amount:</strong> ${donationData.amount || 0} ${donationData.currency || 'USD'}</p>
        <p><strong>Donation Type:</strong> ${donationData.donation_type || 'Not specified'}</p>
        <p><strong>Payment Status:</strong> <span class="status-badge status-${donationData.payment_status || 'pending'}">${getStatusText(donationData.payment_status || 'pending')}</span></p>
        <p><strong>Payment Method:</strong> ${donationData.payment_method || 'Not specified'}</p>
        <p><strong>Donor Message:</strong> ${donationData.donor_message || 'None'}</p>
        <p><strong>Is Anonymous:</strong> ${donationData.is_anonymous ? 'Yes' : 'No'}</p>
        <p><strong>Created At:</strong> ${formatDate(donationData.created_at)}</p>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeModal()">Close</button>
      </div>
    `;
    showModal('Donation Details', content);
  } catch (error) {
    showMessage('Error loading donation: ' + (error.message || 'Unknown error'), 'error');
  }
}

async function viewMedicationRequest(id) {
  try {
    const request = await apiCall(`/medication_requests/${id}`, 'GET');
    const content = `
      <div style="margin-bottom: 20px;">
        <p><strong>Medication Name:</strong> ${request.medication_name || 'Not specified'}</p>
        <p><strong>Quantity Needed:</strong> ${request.quantity_needed || 0}</p>
        <p><strong>Dosage:</strong> ${request.dosage || 'Not specified'}</p>
        <p><strong>Status:</strong> <span class="status-badge status-${request.request_status || 'open'}">${getStatusText(request.request_status || 'open')}</span></p>
        <p><strong>Urgency Level:</strong> ${request.urgency_level || 'Not specified'}</p>
        <p><strong>Medical Condition:</strong> ${request.medical_condition || 'Not specified'}</p>
        <p><strong>Created At:</strong> ${formatDate(request.created_at)}</p>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeModal()">Close</button>
      </div>
    `;
    showModal('Medication Request Details', content);
  } catch (error) {
    showMessage('Error loading request: ' + (error.message || 'Unknown error'), 'error');
  }
}

async function viewUser(id) {
  try {
    const user = await apiCall(`/users/${id}`, 'GET');
    const roleNames = {
      patient: 'Patient',
      doctor: 'Doctor',
      donor: 'Donor',
      ngo: 'NGO',
      pharmacy: 'Pharmacy',
      admin: 'Admin'
    };
    const content = `
      <div style="margin-bottom: 20px;">
        <p><strong>Name:</strong> ${user.full_name || 'Not specified'}</p>
        <p><strong>Email:</strong> ${user.email || 'Not specified'}</p>
        <p><strong>Role:</strong> ${roleNames[user.role] || user.role}</p>
        <p><strong>Phone Number:</strong> ${user.phone_number || 'Not specified'}</p>
        <p><strong>Status:</strong> <span class="status-badge status-${user.is_active ? 'active' : 'inactive'}">${user.is_active ? 'Active' : 'Inactive'}</span></p>
        <p><strong>Date of Birth:</strong> ${user.date_of_birth ? formatDate(user.date_of_birth) : 'Not specified'}</p>
        <p><strong>Gender:</strong> ${user.gender || 'Not specified'}</p>
        <p><strong>Created At:</strong> ${formatDate(user.created_at)}</p>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeModal()">Close</button>
      </div>
    `;
    showModal('User Details', content);
  } catch (error) {
    showMessage('Error loading user: ' + (error.message || 'Unknown error'), 'error');
  }
}

async function editNGO(id) {
  try {
    const response = await apiCall(`/ngos/${id}`, 'GET');
    const ngo = response.data || response;
    let description = '';
    try {
      if (ngo.meta) {
        const meta = typeof ngo.meta === 'string' ? JSON.parse(ngo.meta) : ngo.meta;
        description = meta.description || '';
      }
    } catch (e) {
      console.error('Error parsing NGO meta:', e);
    }

    const content = `
      <form id="edit-ngo-form" onsubmit="handleEditNGO(event, ${id})">
        <div class="form-group">
          <label>Organization Name *</label>
          <input type="text" name="organization_name" value="${ngo.organization_name || ''}" required>
        </div>
        <div class="form-group">
          <label>Description *</label>
          <textarea name="description" rows="4" required>${description}</textarea>
        </div>
        <div class="form-group">
          <label>Contact Person</label>
          <input type="text" name="contact_person" value="${ngo.contact_person || ''}">
        </div>
        <div class="form-group">
          <label>License Number</label>
          <input type="text" name="license_number" value="${ngo.license_number || ''}">
        </div>
        <div class="form-group">
          <label>
            <input type="checkbox" name="verified" ${ngo.verified ? 'checked' : ''}> Verified
          </label>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">Save</button>
        </div>
      </form>
    `;
    showModal('Edit NGO', content);
  } catch (error) {
    showMessage('Error loading NGO: ' + (error.message || 'Unknown error'), 'error');
  }
}

async function handleEditNGO(e, id) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const meta = {
    description: formData.get('description')
  };
  const data = {
    organization_name: formData.get('organization_name'),
    contact_person: formData.get('contact_person') || null,
    license_number: formData.get('license_number') || null,
    verified: formData.has('verified'),
    meta: meta
  };

  try {
    await apiCall(`/ngos/${id}`, 'PUT', data);
    showMessage('NGO updated successfully', 'success');
    closeModal();
    loadNGOs();
  } catch (error) {
    showMessage('Error updating NGO: ' + (error.message || 'Unknown error'), 'error');
  }
}

async function deleteNGO(id) {
  if (confirm('Are you sure you want to delete this NGO?')) {
    try {
      await apiCall(`/ngos/${id}`, 'DELETE');
      showMessage('NGO deleted successfully', 'success');
      loadNGOs();
      loadDashboard();
    } catch (error) {
      showMessage('Error deleting NGO: ' + (error.message || 'Unknown error'), 'error');
    }
  }
}

async function deleteUser(id) {
  if (confirm('Are you sure you want to delete this user?')) {
    try {
      await apiCall(`/users/${id}`, 'DELETE');
      showMessage('User deleted successfully', 'success');
      loadUsers();
      loadDashboard();
    } catch (error) {
      showMessage('Error deleting user: ' + (error.message || 'Unknown error'), 'error');
    }
  }
}

async function editInventory(id) {
  try {
    const item = await apiCall(`/medical_inventory/${id}`, 'GET');
    const content = `
      <form id="edit-inventory-form" onsubmit="handleEditInventory(event, ${id})">
        <div class="form-group">
          <label>Item Name *</label>
          <input type="text" name="item_name" value="${item.item_name || ''}" required>
        </div>
        <div class="form-group">
          <label>Quantity Available *</label>
          <input type="number" name="quantity_available" value="${item.quantity_available || 0}" min="0" required>
        </div>
        <div class="form-group">
          <label>Type *</label>
          <select name="item_type" required>
            <option value="medication" ${item.item_type === 'medication' ? 'selected' : ''}>Medication</option>
            <option value="equipment" ${item.item_type === 'equipment' ? 'selected' : ''}>Equipment</option>
            <option value="supplies" ${item.item_type === 'supplies' ? 'selected' : ''}>Supplies</option>
          </select>
        </div>
        <div class="form-group">
          <label>Expiry Date</label>
          <input type="date" name="expiry_date" value="${item.expiry_date ? item.expiry_date.split('T')[0] : ''}">
        </div>
        <div class="form-group">
          <label>Availability Status</label>
          <select name="availability_status">
            <option value="available" ${item.availability_status === 'available' ? 'selected' : ''}>Available</option>
            <option value="reserved" ${item.availability_status === 'reserved' ? 'selected' : ''}>Reserved</option>
            <option value="distributed" ${item.availability_status === 'distributed' ? 'selected' : ''}>Distributed</option>
          </select>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">Save</button>
        </div>
      </form>
    `;
    showModal('Edit Inventory Item', content);
  } catch (error) {
    showMessage('Error loading item: ' + (error.message || 'Unknown error'), 'error');
  }
}

async function handleEditInventory(e, id) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = {
    item_name: formData.get('item_name'),
    quantity_available: parseInt(formData.get('quantity_available')),
    item_type: formData.get('item_type'),
    expiry_date: formData.get('expiry_date') || null,
    availability_status: formData.get('availability_status') || 'available'
  };

  try {
    await apiCall(`/medical_inventory/${id}`, 'PUT', data);
    showMessage('Item updated successfully', 'success');
    closeModal();
    loadMedicalInventory();
  } catch (error) {
    showMessage('Error updating item: ' + (error.message || 'Unknown error'), 'error');
  }
}

