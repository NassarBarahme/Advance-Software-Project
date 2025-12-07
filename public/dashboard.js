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
      // Patient stats
      const cases = await apiCall('/medical-cases', 'GET');
      stats.push({
        icon: '🏥',
        title: 'Medical Cases',
        value: cases?.length || 0,
        color: '#3498db'
      });

      const consultations = await apiCall('/consultations', 'GET');
      stats.push({
        icon: '💬',
        title: 'Consultations',
        value: consultations?.length || 0,
        color: '#9b59b6'
      });
    } else if (role === 'doctor') {
      const consultations = await apiCall('/consultations', 'GET');
      stats.push({
        icon: '💬',
        title: 'Consultations',
        value: consultations?.length || 0,
        color: '#9b59b6'
      });
    } else if (role === 'admin') {
      const users = await apiCall('/users', 'GET');
      stats.push({
        icon: '👥',
        title: 'Users',
        value: users?.length || 0,
        color: '#3498db'
      });

      const cases = await apiCall('/medical-cases', 'GET');
      stats.push({
        icon: '🏥',
        title: 'Medical Cases',
        value: cases?.length || 0,
        color: '#e74c3c'
      });
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
  } else if (role === 'doctor') {
    actions.push({
      icon: '💬',
      title: 'Consultations',
      description: 'View consultations',
      action: () => navigateToPage('consultations')
    });
  } else if (role === 'donor') {
    actions.push({
      icon: '❤️',
      title: 'New Donation',
      description: 'Make a donation',
      action: () => showAddDonationModal()
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
  }

  return actions;
}

// Display Quick Actions
function displayQuickActions(actions, container) {
  container.innerHTML = actions.map(action => `
    <div class="action-card" onclick="${action.action.toString()}()">
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
    const user = await apiCall('/users/me', 'GET');
    displayProfile(user, container);
  } catch (error) {
    showMessage('Error loading profile', 'error');
  }
}

// Display Profile
function displayProfile(user, container) {
  const roleNames = {
    patient: 'مريض',
    doctor: 'طبيب',
    donor: 'متبرع',
    ngo: 'منظمة',
    pharmacy: 'صيدلية',
    admin: 'مدير'
  };

  container.innerHTML = `
    <div class="profile-header">
      <div class="profile-avatar">${user.full_name?.charAt(0) || 'U'}</div>
      <div class="profile-info">
        <h2>${user.full_name || 'Not specified'}</h2>
        <p>${roleNames[user.role] || user.role}</p>
      </div>
    </div>
    <form class="profile-form" onsubmit="updateProfile(event)">
      <div class="form-group">
        <label>الاسم الكامل</label>
        <input type="text" name="full_name" value="${user.full_name || ''}" required>
      </div>
      <div class="form-group">
        <label>البريد الإلكتروني</label>
        <input type="email" name="email" value="${user.email || ''}" required>
      </div>
      <div class="form-group">
        <label>رقم الهاتف</label>
        <input type="tel" name="phone_number" value="${user.phone_number || ''}">
      </div>
      ${user.role === 'doctor' ? `
        <div class="form-group">
          <label>التخصص</label>
          <input type="text" name="specialization" value="${user.specialization || ''}">
        </div>
      ` : ''}
      <div class="modal-footer">
        <button type="submit" class="btn btn-primary">حفظ التغييرات</button>
      </div>
    </form>
  `;
}

// Update Profile
async function updateProfile(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData.entries());

  try {
    await apiCall(`/users/${currentUser.user_id}`, 'PUT', data);
    showMessage('Profile updated successfully', 'success');
    loadProfile();
  } catch (error) {
    showMessage('Error updating profile', 'error');
  }
}

// Load Medical Cases
async function loadMedicalCases() {
  const tbody = document.getElementById('medical-cases-tbody');
  if (!tbody) return;

  try {
    const cases = await apiCall('/medical-cases', 'GET');
    displayMedicalCases(cases, tbody);
  } catch (error) {
    showMessage('Error loading medical cases', 'error');
  }
}

// Display Medical Cases
function displayMedicalCases(cases, tbody) {
  if (!cases || cases.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No medical cases</td></tr>';
    return;
  }

  tbody.innerHTML = cases.map(caseItem => `
    <tr>
      <td>${caseItem.case_id}</td>
      <td>${caseItem.case_type || 'Not specified'}</td>
      <td><span class="status-badge status-${caseItem.status || 'pending'}">${caseItem.status || 'Pending'}</span></td>
      <td>${formatDate(caseItem.created_at)}</td>
      <td>
        <button class="btn btn-secondary" onclick="viewMedicalCase(${caseItem.case_id})">View</button>
      </td>
    </tr>
  `).join('');
}

// Load Consultations
async function loadConsultations() {
  const container = document.getElementById('consultations-list');
  if (!container) return;

  try {
    const consultations = await apiCall('/consultations', 'GET');
    displayConsultations(consultations, container);
  } catch (error) {
    showMessage('Error loading consultations', 'error');
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
  if (!tbody) return;

  try {
    const donations = await apiCall('/donations', 'GET');
    displayDonations(donations, tbody);
  } catch (error) {
    showMessage('Error loading donations', 'error');
  }
}

// Display Donations
function displayDonations(donations, tbody) {
  if (!donations || donations.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No donations</td></tr>';
    return;
  }

  tbody.innerHTML = donations.map(donation => `
    <tr>
      <td>${donation.donation_id}</td>
      <td>${donation.donation_type || 'Not specified'}</td>
      <td>${donation.amount || donation.quantity || 'Not specified'}</td>
      <td><span class="status-badge status-${donation.status || 'pending'}">${donation.status || 'Pending'}</span></td>
      <td>${formatDate(donation.created_at)}</td>
      <td>
        <button class="btn btn-secondary" onclick="viewDonation(${donation.donation_id})">عرض</button>
      </td>
    </tr>
  `).join('');
}

// Load Medication Requests
async function loadMedicationRequests() {
  const tbody = document.getElementById('medication-requests-tbody');
  if (!tbody) return;

  try {
    const requests = await apiCall('/medication_requests', 'GET');
    displayMedicationRequests(requests, tbody);
  } catch (error) {
    showMessage('Error loading medication requests', 'error');
  }
}

// Display Medication Requests
function displayMedicationRequests(requests, tbody) {
  if (!requests || requests.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No requests</td></tr>';
    return;
  }

  tbody.innerHTML = requests.map(request => `
    <tr>
      <td>${request.request_id}</td>
      <td>${request.medication_name || 'Not specified'}</td>
      <td>${request.quantity || 'Not specified'}</td>
      <td><span class="status-badge status-${request.status || 'pending'}">${request.status || 'Pending'}</span></td>
      <td>${formatDate(request.created_at)}</td>
      <td>
        <button class="btn btn-secondary" onclick="viewMedicationRequest(${request.request_id})">عرض</button>
      </td>
    </tr>
  `).join('');
}

// Load Mental Health Sessions
async function loadMentalHealthSessions() {
  const container = document.getElementById('mental-health-sessions-list');
  if (!container) return;

  try {
    const sessions = await apiCall('/mental_health_sessions', 'GET');
    displayMentalHealthSessions(sessions, container);
  } catch (error) {
    showMessage('Error loading sessions', 'error');
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
          <div class="card-title">جلسة #${session.session_id}</div>
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
    const groups = await apiCall('/support_groups', 'GET');
    displaySupportGroups(groups, container);
  } catch (error) {
    showMessage('Error loading support groups', 'error');
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
          <div class="card-title">${group.group_name || 'مجموعة دعم'}</div>
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
    const ngos = await apiCall('/ngos', 'GET');
    displayNGOs(ngos, container);
  } catch (error) {
    showMessage('Error loading NGOs', 'error');
  }
}

// Display NGOs
function displayNGOs(ngos, container) {
  if (!ngos || ngos.length === 0) {
    container.innerHTML = '<p style="text-align: center; padding: 40px; grid-column: 1/-1;">No NGOs</p>';
    return;
  }

  container.innerHTML = ngos.map(ngo => `
    <div class="ngo-card">
      <h3>${ngo.name || 'NGO'}</h3>
      <p>${ngo.description || 'No description'}</p>
      <p><strong>Address:</strong> ${ngo.address || 'Not specified'}</p>
      <p><strong>Phone:</strong> ${ngo.phone || 'Not specified'}</p>
      ${currentUser?.role === 'admin' ? `
        <div class="card-actions" style="margin-top: 15px;">
          <button class="btn btn-secondary" onclick="editNGO(${ngo.id})">Edit</button>
          <button class="btn btn-danger" onclick="deleteNGO(${ngo.id})">Delete</button>
        </div>
      ` : ''}
    </div>
  `).join('');
}

// Load Medical Inventory
async function loadMedicalInventory() {
  const tbody = document.getElementById('inventory-tbody');
  if (!tbody) return;

  try {
    const inventory = await apiCall('/medical_inventory', 'GET');
    displayMedicalInventory(inventory, tbody);
  } catch (error) {
    showMessage('Error loading inventory', 'error');
  }
}

// Display Medical Inventory
function displayMedicalInventory(inventory, tbody) {
  if (!inventory || inventory.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No inventory</td></tr>';
    return;
  }

  tbody.innerHTML = inventory.map(item => `
    <tr>
      <td>${item.item_name || 'Not specified'}</td>
      <td>${item.quantity || 0}</td>
      <td>${item.item_type || 'Not specified'}</td>
      <td>${item.expiry_date ? formatDate(item.expiry_date) : 'Not specified'}</td>
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
    patient: 'مريض',
    doctor: 'طبيب',
    donor: 'متبرع',
    ngo: 'منظمة',
    pharmacy: 'صيدلية',
    admin: 'مدير'
  };

  tbody.innerHTML = users.map(user => `
    <tr>
      <td>${user.full_name || 'Not specified'}</td>
      <td>${user.email || 'Not specified'}</td>
      <td>${roleNames[user.role] || user.role}</td>
      <td><span class="status-badge status-${user.is_active ? 'active' : 'pending'}">${user.is_active ? 'Active' : 'Inactive'}</span></td>
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
  // Create message element if it doesn't exist
  let messageEl = document.getElementById('global-message');
  if (!messageEl) {
    messageEl = document.createElement('div');
    messageEl.id = 'global-message';
    messageEl.className = 'message';
    document.querySelector('.content-area').prepend(messageEl);
  }

  messageEl.textContent = message;
  messageEl.className = `message ${type} show`;
  
  setTimeout(() => {
    messageEl.classList.remove('show');
  }, 5000);
}

// Format Date
function formatDate(dateString) {
  if (!dateString) return 'Not specified';
  const date = new Date(dateString);
  return date.toLocaleDateString('ar-SA');
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

// Modal Functions (Placeholders - to be implemented)
function showAddMedicalCaseModal() {
  showMessage('Add medical case form under development', 'info');
}

function showAddConsultationModal() {
  showMessage('Add consultation form under development', 'info');
}

function showAddDonationModal() {
  showMessage('Add donation form under development', 'info');
}

function showAddMedicationRequestModal() {
  showMessage('Add medication request form under development', 'info');
}

function showAddMentalHealthSessionModal() {
  showMessage('Add mental health session form under development', 'info');
}

function showAddSupportGroupModal() {
  showMessage('Add support group form under development', 'info');
}

function showAddNGOModal() {
  showMessage('Add NGO form under development', 'info');
}

function showAddInventoryModal() {
  showMessage('Add inventory form under development', 'info');
}

// View Functions (Placeholders)
function viewMedicalCase(id) {
  showMessage(`View medical case #${id}`, 'info');
}

function viewConsultation(id) {
  showMessage(`View consultation #${id}`, 'info');
}

function viewDonation(id) {
  showMessage(`View donation #${id}`, 'info');
}

function viewMedicationRequest(id) {
  showMessage(`View medication request #${id}`, 'info');
}

function viewUser(id) {
  showMessage(`View user #${id}`, 'info');
}

function editNGO(id) {
  showMessage(`Edit NGO #${id}`, 'info');
}

function deleteNGO(id) {
  if (confirm('Are you sure you want to delete this NGO?')) {
    showMessage('Delete NGO under development', 'info');
  }
}

function deleteUser(id) {
  if (confirm('Are you sure you want to delete this user?')) {
    showMessage('Delete user under development', 'info');
  }
}

function editInventory(id) {
  showMessage(`Edit inventory #${id}`, 'info');
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('active');
}

