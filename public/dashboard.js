// API Configuration
const API_BASE_URL = 'http://localhost:3000/api';
let currentUser = null;
let accessToken = null;

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  
  // Initialize language system
  if (typeof initLanguage === 'function') {
    initLanguage();
  }
  
  setupNavigation();
  loadDashboard();
  // Load user permissions on startup
  loadUserPermissions();
  
  // Setup button event listeners for buttons in HTML
  setupButtonListeners();
  
  // Setup logout button
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      if (typeof handleLogout === 'function') {
        handleLogout();
      } else if (typeof window.handleLogout === 'function') {
        window.handleLogout();
      }
    });
  }
  
  // Setup language toggle button
  const languageToggle = document.getElementById('language-toggle');
  if (languageToggle) {
    languageToggle.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      if (typeof toggleLanguage === 'function') {
        toggleLanguage();
      } else if (typeof window.toggleLanguage === 'function') {
        window.toggleLanguage();
      }
    });
  }
  
  // Listen for language changes
  document.addEventListener('languageChanged', () => {
    // Reload current page data when language changes
    const activePage = document.querySelector('.page.active');
    if (activePage) {
      const pageName = activePage.id.replace('page-', '');
      updatePageTitle(pageName);
      loadPageData(pageName);
    }
    
    // Reload quick actions to update translations
    const quickActionsGrid = document.getElementById('quick-actions-grid');
    if (quickActionsGrid) {
      const actions = getQuickActions();
      displayQuickActions(actions, quickActionsGrid);
    }
  });
});

// Setup button event listeners for buttons defined in HTML
function setupButtonListeners() {
  // Edit Medical History button
  const editMedicalHistoryBtn = document.querySelector('#page-medical-history .page-header .btn-primary');
  if (editMedicalHistoryBtn && !editMedicalHistoryBtn.hasAttribute('data-listener-attached')) {
    editMedicalHistoryBtn.setAttribute('data-listener-attached', 'true');
    editMedicalHistoryBtn.addEventListener('click', function(e) {
      e.preventDefault();
      if (typeof showEditMedicalHistoryModal === 'function') {
        showEditMedicalHistoryModal();
      } else if (typeof window.showEditMedicalHistoryModal === 'function') {
        window.showEditMedicalHistoryModal();
      }
    });
  }
  
  // New Profile button
  const newProfileBtn = document.querySelector('#page-patient-profiles .page-header .btn-primary');
  if (newProfileBtn && !newProfileBtn.hasAttribute('data-listener-attached')) {
    newProfileBtn.setAttribute('data-listener-attached', 'true');
    newProfileBtn.addEventListener('click', function(e) {
      e.preventDefault();
      if (typeof showAddPatientProfileModal === 'function') {
        showAddPatientProfileModal();
      } else if (typeof window.showAddPatientProfileModal === 'function') {
        window.showAddPatientProfileModal();
      }
    });
  }
  
  // New Group button
  const newGroupBtn = document.querySelector('#page-support-groups .page-header .btn-primary');
  if (newGroupBtn && !newGroupBtn.hasAttribute('data-listener-attached')) {
    newGroupBtn.setAttribute('data-listener-attached', 'true');
    newGroupBtn.addEventListener('click', function(e) {
      e.preventDefault();
      if (typeof showAddSupportGroupModal === 'function') {
        showAddSupportGroupModal();
      } else if (typeof window.showAddSupportGroupModal === 'function') {
        window.showAddSupportGroupModal();
      }
    });
  }
}

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
    
    // Setup button listeners after page loads
    setTimeout(() => {
      setupButtonListeners();
    }, 100);
  }
}

// Update Page Title
function updatePageTitle(pageName) {
  const pageTitleEl = document.getElementById('page-title');
  if (!pageTitleEl) return;
  
  // Use translation if available, otherwise use English fallback
  if (typeof t === 'function') {
    // Map page names to translation keys
    const pageKeyMap = {
      'dashboard': 'dashboard',
      'profile': 'profile',
      'medical-history': 'medicalHistory',
      'medical-cases': 'medicalCases',
      'patient-profiles': 'patientProfiles',
      'consultations': 'consultations',
      'donations': 'donations',
      'medication-requests': 'medicationRequests',
      'mental-health': 'mentalHealth',
      'support-groups': 'supportGroups',
      'health-content': 'healthContent',
      'health-alerts': 'healthAlerts',
      'ngos': 'ngos',
      'medical-inventory': 'inventory',
      'users': 'users',
      'system': 'systemSettings'
    };
    
    const translationKey = pageKeyMap[pageName] || pageName;
    pageTitleEl.textContent = t(translationKey) || pageName;
  } else {
    // Fallback to English
    const titles = {
      'dashboard': 'Dashboard',
      'profile': 'Profile',
      'medical-history': 'Medical History',
      'medical-cases': 'Medical Cases',
      'patient-profiles': 'My Profiles',
      'consultations': 'Consultations',
      'donations': 'Donations',
      'medication-requests': 'Medication Requests',
      'mental-health': 'Mental Health',
      'support-groups': 'Support Groups',
      'health-content': 'Health Content',
      'health-alerts': 'Health Alerts',
      'ngos': 'NGOs',
      'medical-inventory': 'Medical Inventory',
      'users': 'Users',
      'system': 'System Settings'
    };
    pageTitleEl.textContent = titles[pageName] || pageName;
  }
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
    case 'medical-history':
      loadMedicalHistory();
      break;
    case 'medical-cases':
      loadMedicalCases();
      break;
    case 'patient-profiles':
      loadPatientProfiles();
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
    case 'health-content':
      loadHealthContent();
      break;
    case 'health-alerts':
      loadHealthAlerts();
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
        const response = await apiCall('/medical-cases', 'GET');
        const cases = response?.cases || (Array.isArray(response) ? response : []);
        const totalRaised = Array.isArray(cases) ? cases.reduce((sum, c) => sum + (parseFloat(c.raised_amount) || 0), 0) : 0;
        stats.push({
          icon: '🏥',
          title: 'My Medical Cases',
          value: Array.isArray(cases) ? cases.length : 0,
          color: '#3498db'
        });
        if (totalRaised > 0) {
          stats.push({
            icon: '💰',
            title: 'Total Raised',
            value: totalRaised.toFixed(2) + ' USD',
            color: '#27ae60'
          });
        }
      } catch (e) {
        stats.push({ icon: '🏥', title: 'My Medical Cases', value: 0, color: '#3498db' });
      }

      try {
        const response = await apiCall('/consultations', 'GET');
        const consultations = response?.consultations || (Array.isArray(response) ? response : []);
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
        const response = await apiCall('/medication_requests', 'GET');
        const requests = response?.requests || (Array.isArray(response) ? response : []);
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

      try {
        const response = await apiCall(`/patients/${currentUser.user_id}/profiles`, 'GET');
        const profiles = response?.data || (Array.isArray(response) ? response : []);
        stats.push({
          icon: '📝',
          title: 'My Profiles',
          value: Array.isArray(profiles) ? profiles.length : 0,
          color: '#16a085'
        });
      } catch (e) {
        stats.push({ icon: '📝', title: 'My Profiles', value: 0, color: '#16a085' });
      }
    } else if (role === 'doctor') {
      try {
        const response = await apiCall('/consultations', 'GET');
        const consultations = response?.consultations || (Array.isArray(response) ? response : []);
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
        const response = await apiCall('/medical-cases', 'GET');
        const cases = response?.cases || (Array.isArray(response) ? response : []);
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
        const response = await apiCall('/donations', 'GET');
        const donations = response?.donations || (Array.isArray(response) ? response : []);
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
        const response = await apiCall('/medication_requests', 'GET');
        const requests = response?.requests || (Array.isArray(response) ? response : []);
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
        const response = await apiCall('/medical_inventory', 'GET');
        const inventory = response?.inventory || (Array.isArray(response) ? response : []);
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
        const response = await apiCall('/users', 'GET');
        const users = response?.users || (Array.isArray(response) ? response : []);
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
        const response = await apiCall('/medical-cases', 'GET');
        const cases = response?.cases || (Array.isArray(response) ? response : []);
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

  // Helper function to get translated text
  const getText = (key) => {
    return typeof t === 'function' ? t(key) : key;
  };

  if (role === 'patient') {
    actions.push({
      icon: '📋',
      title: getText('medicalHistory'),
      description: getText('viewEditMedicalHistory'),
      action: function() { navigateToPage('medical-history'); }
    });
    actions.push({
      icon: '🏥',
      title: getText('addMedicalCase'),
      description: getText('createNewMedicalCase'),
      action: function() { 
        if (typeof showAddMedicalCaseModal === 'function') {
          showAddMedicalCaseModal();
        } else if (typeof window.showAddMedicalCaseModal === 'function') {
          window.showAddMedicalCaseModal();
        }
      }
    });
    actions.push({
      icon: '📝',
      title: getText('createProfile'),
      description: getText('createNewPatientProfile'),
      action: function() { 
        if (typeof showAddPatientProfileModal === 'function') {
          showAddPatientProfileModal();
        } else if (typeof window.showAddPatientProfileModal === 'function') {
          window.showAddPatientProfileModal();
        }
      }
    });
    actions.push({
      icon: '💬',
      title: getText('newConsultation'),
      description: getText('requestConsultationFromDoctor'),
      action: function() { 
        if (typeof showAddConsultationModal === 'function') {
          showAddConsultationModal();
        } else if (typeof window.showAddConsultationModal === 'function') {
          window.showAddConsultationModal();
        }
      }
    });
    actions.push({
      icon: '💊',
      title: getText('requestMedication'),
      description: getText('requestMedicationFromPharmacy'),
      action: function() { 
        if (typeof showAddMedicationRequestModal === 'function') {
          showAddMedicationRequestModal();
        } else if (typeof window.showAddMedicationRequestModal === 'function') {
          window.showAddMedicationRequestModal();
        }
      }
    });
    actions.push({
      icon: '🧠',
      title: getText('mentalHealthSession'),
      description: getText('bookMentalHealthSession'),
      action: function() { 
        if (typeof showAddMentalHealthSessionModal === 'function') {
          showAddMentalHealthSessionModal();
        } else if (typeof window.showAddMentalHealthSessionModal === 'function') {
          window.showAddMentalHealthSessionModal();
        }
      }
    });
    actions.push({
      icon: '📚',
      title: getText('healthContent'),
      description: getText('browseHealthInformation'),
      action: function() { navigateToPage('health-content'); }
    });
    actions.push({
      icon: '🔔',
      title: getText('healthAlerts'),
      description: getText('viewHealthAlerts'),
      action: function() { navigateToPage('health-alerts'); }
    });
  } else if (role === 'doctor') {
    actions.push({
      icon: '💬',
      title: getText('newConsultation'),
      description: getText('createNewConsultation'),
      action: () => {
        if (typeof showAddConsultationModal === 'function') {
          showAddConsultationModal();
        }
      }
    });
    actions.push({
      icon: '💬',
      title: getText('myConsultations'),
      description: getText('viewAllConsultations'),
      action: () => navigateToPage('consultations')
    });
    actions.push({
      icon: '🏥',
      title: getText('medicalCases'),
      description: getText('viewManageMedicalCases'),
      action: () => navigateToPage('medical-cases')
    });
    actions.push({
      icon: '🏥',
      title: getText('addMedicalCase'),
      description: getText('createNewMedicalCase'),
      action: () => {
        if (typeof showAddMedicalCaseModal === 'function') {
          showAddMedicalCaseModal();
        } else if (typeof window.showAddMedicalCaseModal === 'function') {
          window.showAddMedicalCaseModal();
        }
      }
    });
  } else if (role === 'donor') {
    actions.push({
      icon: '❤️',
      title: getText('newDonation'),
      description: getText('makeDonation'),
      action: () => showAddDonationModal()
    });
    actions.push({
      icon: '🏥',
      title: getText('medicalCases'),
      description: getText('viewCasesNeedingDonations'),
      action: () => navigateToPage('medical-cases')
    });
  } else if (role === 'pharmacy') {
    actions.push({
      icon: '💊',
      title: getText('medicationRequests'),
      description: getText('viewMedicationRequests'),
      action: () => navigateToPage('medication-requests')
    });
    actions.push({
      icon: '📦',
      title: getText('medicalInventory'),
      description: getText('manageMedicalInventory'),
      action: () => navigateToPage('medical-inventory')
    });
  } else if (role === 'admin') {
    actions.push({
      icon: '👥',
      title: getText('users'),
      description: getText('manageUsers'),
      action: () => navigateToPage('users')
    });
    actions.push({
      icon: '🏛️',
      title: getText('ngos'),
      description: getText('manageNGOs'),
      action: () => navigateToPage('ngos')
    });
    actions.push({
      icon: '⚙️',
      title: getText('systemSettings'),
      description: getText('systemSettings'),
      action: () => navigateToPage('system')
    });
  }

  return actions;
}

// Display Quick Actions
function displayQuickActions(actions, container) {
  if (!container || !actions || actions.length === 0) {
    return;
  }
  
  // Helper function to get translated text
  const getText = (key) => {
    return typeof t === 'function' ? t(key) : key;
  };
  
  // Re-translate actions if language changed
  const translatedActions = actions.map(action => {
    // Extract translation key from title/description if they're already translated
    // For now, we'll regenerate using getQuickActions which uses t()
    return action;
  });
  
  container.innerHTML = translatedActions.map((action, index) => `
    <div class="action-card" data-action-index="${index}">
      <div class="action-card-icon">${action.icon}</div>
      <h4>${action.title}</h4>
      <p>${action.description}</p>
    </div>
  `).join('');
  
  // Store actions in container for later access
  container._quickActions = actions;
  
  // Attach event listeners to action cards
  container.querySelectorAll('.action-card').forEach((card, index) => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      const actionIndex = parseInt(this.getAttribute('data-action-index'));
      const storedActions = container._quickActions || actions;
      if (storedActions[actionIndex] && typeof storedActions[actionIndex].action === 'function') {
        try {
          storedActions[actionIndex].action();
        } catch (error) {
          console.error('Error executing quick action:', error);
          showMessage('Error executing action: ' + (error.message || 'Unknown error'), 'error');
        }
      }
    });
  });
}

// Load User Permissions
let userPermissions = [];
async function loadUserPermissions() {
  try {
    const result = await apiCall('/roles/permissions/me', 'GET');
    userPermissions = result?.permissions || [];
    return userPermissions;
  } catch (error) {
    console.error('Error loading user permissions:', error);
    userPermissions = [];
    return [];
  }
}

// Check if user has permission
function hasPermission(permissionName) {
  return userPermissions.some(p => p.name === permissionName);
}

// Load Profile
async function loadProfile() {
  const container = document.getElementById('profile-container');
  if (!container) return;

  try {
    const result = await apiCall('/users/me', 'GET');
    // Extract profile from response (API returns {message, profile})
    const user = result.profile || result;
    
    // Load user permissions
    await loadUserPermissions();
    
    displayProfile(user, container);
    
    // Attach event listener to profile form
    setTimeout(() => {
      const form = document.getElementById('profile-update-form');
      if (form) {
        // Remove any existing listeners by cloning
        const newForm = form.cloneNode(true);
        form.parentNode.replaceChild(newForm, form);
        // Add new listener
        const updatedForm = document.getElementById('profile-update-form');
        if (updatedForm) {
          updatedForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            await updateProfile(e);
          });
        }
      }
    }, 200);
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
  
  // Get doctor-specific data
  const doctorData = user.doctor_data || {};
  const specialization = doctorData.specialization || user.specialization || '';
  const licenseNumber = doctorData.license_number || '';
  const experienceYears = doctorData.experience_years || 0;
  const profileBio = doctorData.profile_bio || '';
  const availabilitySchedule = doctorData.availability_schedule || null;
  const certifications = doctorData.certifications || [];
  
  // Format date_of_birth for input field (YYYY-MM-DD)
  let dateOfBirth = '';
  if (user.date_of_birth) {
    const date = new Date(user.date_of_birth);
    if (!isNaN(date.getTime())) {
      dateOfBirth = date.toISOString().split('T')[0];
    }
  }
  
  // Format availability schedule for display
  let availabilityScheduleText = '';
  if (availabilitySchedule) {
    try {
      const schedule = typeof availabilitySchedule === 'string' ? JSON.parse(availabilitySchedule) : availabilitySchedule;
      availabilityScheduleText = JSON.stringify(schedule, null, 2);
    } catch (e) {
      availabilityScheduleText = '';
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
    <form class="profile-form" id="profile-update-form">
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
          <label>Specialization *</label>
          <input type="text" name="specialization" value="${specialization}" required>
        </div>
        <div class="form-group">
          <label>License Number</label>
          <input type="text" name="license_number" value="${licenseNumber}" placeholder="Enter your medical license number">
        </div>
        <div class="form-group">
          <label>Experience (Years)</label>
          <input type="number" name="experience_years" value="${experienceYears}" min="0" max="100" placeholder="Years of experience">
        </div>
        <div class="form-group">
          <label>Profile Bio</label>
          <textarea name="profile_bio" rows="4" placeholder="Tell us about your medical background and expertise...">${profileBio}</textarea>
        </div>
        <div class="form-group">
          <label>Availability Schedule (JSON)</label>
          <textarea name="availability_schedule" rows="6" placeholder='{"monday": {"start": "09:00", "end": "17:00"}, "tuesday": {"start": "09:00", "end": "17:00"}}'>${availabilityScheduleText}</textarea>
          <small style="color: #666; font-size: 0.85em;">Enter your weekly availability schedule in JSON format</small>
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
      ${userPermissions.length > 0 ? `
        <div class="form-group">
          <label>My Permissions</label>
          <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px;">
            ${userPermissions.map(p => `
              <span style="background: #3498db; color: white; padding: 4px 12px; border-radius: 16px; font-size: 0.85em;">
                ${p.name}
              </span>
            `).join('')}
          </div>
          ${userPermissions.length === 0 ? '<p style="color: #666; font-size: 0.9em;">No permissions assigned</p>' : ''}
        </div>
      ` : ''}
      <div class="modal-footer">
        <button type="submit" class="btn btn-primary">Save Changes</button>
      </div>
    </form>
  `;
}

// Update Profile
async function updateProfile(e) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  
  const form = document.getElementById('profile-update-form');
  if (!form) {
    showMessage('Form not found', 'error');
    return false;
  }
  
  const formData = new FormData(form);
  const allData = Object.fromEntries(formData.entries());
  
  console.log('Updating profile with data:', allData);
  
  // Separate user data from doctor-specific data
  const userData = {};
  const doctorData = {};
  
  // User fields - always include full_name if it exists
  const userFields = ['full_name', 'phone_number', 'date_of_birth', 'gender', 'preferred_language'];
  userFields.forEach(field => {
    if (allData[field] !== undefined) {
      // Allow empty strings for optional fields, but not for required ones
      if (field === 'full_name' && !allData[field]) {
        showMessage('Full name is required', 'error');
        return false;
      }
      userData[field] = allData[field] || null;
    }
  });
  
  // Doctor-specific fields
  if (currentUser?.role === 'doctor') {
    const doctorFields = ['specialization', 'license_number', 'experience_years', 'profile_bio', 'availability_schedule'];
    doctorFields.forEach(field => {
      if (allData[field] !== undefined) {
        if (field === 'availability_schedule') {
          if (allData[field] && allData[field].trim()) {
            try {
              doctorData[field] = JSON.parse(allData[field]);
            } catch (e) {
              showMessage('Invalid JSON format for availability schedule', 'error');
              return false;
            }
          } else {
            doctorData[field] = null;
          }
        } else if (field === 'experience_years') {
          doctorData[field] = allData[field] ? parseInt(allData[field]) || 0 : 0;
        } else if (field === 'specialization') {
          // Specialization is required for doctors
          if (!allData[field] || !allData[field].trim()) {
            showMessage('Specialization is required', 'error');
            return false;
          }
          doctorData[field] = allData[field];
        } else {
          // For other fields, allow empty strings (will be converted to null by backend)
          doctorData[field] = allData[field] || null;
        }
      }
    });
  }

  console.log('User data to update:', userData);
  console.log('Doctor data to update:', doctorData);
  
  try {
    // Update user data first (always send if there's at least full_name)
    if (Object.keys(userData).length > 0) {
      console.log('Updating user data...');
      const userResult = await apiCall(`/users/${currentUser.user_id}`, 'PUT', userData);
      console.log('User update result:', userResult);
    } else {
      console.log('No user data to update');
    }
    
    // Update doctor-specific data if any
    if (currentUser?.role === 'doctor' && Object.keys(doctorData).length > 0) {
      console.log('Updating doctor data...');
      const doctorResult = await apiCall(`/doctors/${currentUser.user_id}`, 'PATCH', doctorData);
      console.log('Doctor update result:', doctorResult);
    } else if (currentUser?.role === 'doctor') {
      console.log('No doctor data to update');
    }
    
    showMessage('Profile updated successfully!', 'success');
    // Reload profile after a short delay to show message first
    setTimeout(() => {
      loadProfile();
    }, 500);
  } catch (error) {
    console.error('Error updating profile:', error);
    console.error('Error details:', error.response || error.message);
    const errorMsg = error.message || error.response?.error || error.response?.details || 'Unknown error';
    showMessage('Error updating profile: ' + errorMsg, 'error');
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
    const response = await apiCall('/medical-cases', 'GET').catch(() => null);
    // API returns: {message, cases} or just array
    const cases = response?.cases || (Array.isArray(response) ? response : []);
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
    tbody.innerHTML = '<tr><td colspan="8" style="text-align: center;">No medical cases</td></tr>';
    return;
  }

  tbody.innerHTML = cases.map(caseItem => `
    <tr>
      <td>${caseItem.case_id}</td>
      <td>${caseItem.case_title || 'Not specified'}</td>
      <td>${caseItem.patient_name || 'Unknown Patient'}</td>
      <td><span class="status-badge status-${caseItem.case_status || 'active'}">${getStatusText(caseItem.case_status || 'active')}</span></td>
      <td>${caseItem.target_amount || 0} ${caseItem.currency || 'USD'}</td>
      <td>${caseItem.raised_amount || 0} ${caseItem.currency || 'USD'}</td>
      <td>${formatDate(caseItem.created_at)}</td>
      <td>
        ${currentUser?.role === 'doctor' ? `<button class="btn btn-primary edit-case-btn" data-case-id="${caseItem.case_id}">Edit</button>` : ''}
        ${currentUser?.role !== 'doctor' ? `<button class="btn btn-secondary" onclick="window.viewMedicalCase(${caseItem.case_id})">View</button>` : ''}
        ${currentUser?.role === 'ngo' ? `<button class="btn btn-primary" onclick="window.showAddCaseUpdateModal(${caseItem.case_id})" style="margin-left: 5px;">Add Update</button>` : ''}
        ${currentUser?.role === 'admin' ? `<button class="btn btn-danger" onclick="window.deleteMedicalCase(${caseItem.case_id})" style="margin-left: 5px;">Delete</button>` : ''}
      </td>
    </tr>
  `).join('');
  
  // Add event listeners to edit buttons for doctors
  if (currentUser?.role === 'doctor') {
    tbody.querySelectorAll('.edit-case-btn').forEach(btn => {
      btn.addEventListener('click', async function(e) {
        e.preventDefault();
        e.stopPropagation();
        const caseId = parseInt(this.getAttribute('data-case-id'));
        if (caseId && !isNaN(caseId)) {
          try {
            if (typeof showEditMedicalCaseModal === 'function') {
              await showEditMedicalCaseModal(caseId);
            } else if (typeof window.showEditMedicalCaseModal === 'function') {
              await window.showEditMedicalCaseModal(caseId);
            } else {
              console.error('showEditMedicalCaseModal function not found');
              showMessage('Error: Edit function not available', 'error');
            }
          } catch (error) {
            console.error('Error opening edit modal:', error);
            showMessage('Error opening edit form: ' + (error.message || 'Unknown error'), 'error');
          }
        }
      });
    });
  }
}

async function deleteMedicalCase(id) {
  // Check permission (if permissions are loaded)
  if (userPermissions.length > 0 && !hasPermission('delete_medical_case') && currentUser?.role !== 'admin') {
    showMessage('You do not have permission to delete medical cases', 'error');
    return;
  }

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
  } else if (pageHeader && currentUser?.role === 'doctor') {
    // Remove add button for doctors if exists
    const existingBtn = pageHeader.querySelector('.btn-primary');
    if (existingBtn) {
      existingBtn.remove();
    }
  }

  try {
    const response = await apiCall('/consultations', 'GET').catch(() => null);
    // Handle both response formats: {consultations: [...]} or [...]
    const consultations = response?.consultations || (Array.isArray(response) ? response : []);
    
    // Filter consultations based on role
    let filteredConsultations = consultations;
    if (currentUser?.role === 'patient') {
      filteredConsultations = consultations.filter(c => c.patient_id === currentUser.user_id);
    } else if (currentUser?.role === 'doctor') {
      filteredConsultations = consultations.filter(c => c.doctor_id === currentUser.user_id);
    }
    
    displayConsultations(Array.isArray(filteredConsultations) ? filteredConsultations : [], container);
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
          <div class="card-title">Consultation #${consultation.consultation_id}</div>
          <div class="card-meta">${formatDate(consultation.created_at)}</div>
        </div>
        <span class="status-badge status-${consultation.status || 'pending'}">${consultation.status || 'Pending'}</span>
      </div>
      <div class="card-actions">
        <button class="btn btn-primary view-consultation-btn" data-consultation-id="${consultation.consultation_id}">View</button>
      </div>
    </div>
  `).join('');
  
  // Add event listeners to view buttons
  container.querySelectorAll('.view-consultation-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const consultationId = parseInt(btn.getAttribute('data-consultation-id'));
      if (consultationId && !isNaN(consultationId)) {
        try {
          await viewConsultation(consultationId);
        } catch (error) {
          console.error('Error viewing consultation:', error);
          showMessage('Error loading consultation details', 'error');
        }
      } else {
        showMessage('Invalid consultation ID', 'error');
      }
    });
  });

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
    const response = await apiCall('/donations', 'GET').catch(() => null);
    // API returns: {message, donations}
    const donations = response?.donations || (Array.isArray(response) ? response : []);
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
  
  // Count columns in the table
  const columnCount = document.querySelector('#donations-table thead tr')?.children.length || 7;

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
    const response = await apiCall('/medication_requests', 'GET').catch(() => null);
    // API returns: {message, requests}
    const requests = response?.requests || (Array.isArray(response) ? response : []);
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
    const response = await apiCall('/support_groups', 'GET').catch(() => null);
    let groups = [];
    
    // Handle different response formats
    if (response) {
      if (Array.isArray(response)) {
        groups = response;
      } else if (response.data && Array.isArray(response.data)) {
        groups = response.data;
      } else if (response.groups && Array.isArray(response.groups)) {
        groups = response.groups;
      }
    }
    
    if (groups && groups.length > 0) {
      displaySupportGroups(groups, container);
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
  
  // Setup button listeners after loading
  setTimeout(() => {
    setupButtonListeners();
  }, 100);
}

// Display Support Groups
function displaySupportGroups(groups, container) {
  if (!groups || groups.length === 0) {
    container.innerHTML = '<p style="text-align: center; padding: 40px;">No support groups available. Use the "New Group" button to create a support group.</p>';
    return;
  }

  container.innerHTML = groups.map(group => `
    <div class="group-card" style="background: white; border-radius: 8px; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 15px;">
      <div class="card-header" style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
        <div style="flex: 1;">
          <div class="card-title" style="font-size: 1.2rem; font-weight: 600; color: #2c3e50; margin-bottom: 8px;">${group.group_name || 'Support Group'}</div>
          <div class="card-meta" style="font-size: 0.9rem; color: #7f8c8d; margin-bottom: 5px;">
            <strong>Type:</strong> ${group.group_type ? group.group_type.charAt(0).toUpperCase() + group.group_type.slice(1) : 'Not specified'} | 
            <strong>Members:</strong> ${group.current_members || 0}/${group.max_members || 20}
          </div>
          ${group.description ? `<div class="card-meta" style="font-size: 0.9rem; color: #666; margin-top: 10px; line-height: 1.6;">${group.description}</div>` : ''}
          ${group.meeting_schedule ? `<div class="card-meta" style="font-size: 0.85rem; color: #3498db; margin-top: 8px;">📅 ${group.meeting_schedule}</div>` : ''}
          <div class="card-meta" style="font-size: 0.85rem; color: #999; margin-top: 10px;">
            Created: ${formatDate(group.created_at)}
          </div>
        </div>
        <span class="status-badge status-${group.is_active ? 'active' : 'inactive'}" style="padding: 4px 12px; border-radius: 12px; font-size: 0.85rem; font-weight: 500; display: inline-block;">
          ${group.is_active ? 'Active' : 'Inactive'}
        </span>
      </div>
    </div>
  `).join('');
}

// Load Medical History
async function loadMedicalHistory() {
  const container = document.getElementById('medical-history-container');
  if (!container) return;

  try {
    const patient = await apiCall(`/patients/${currentUser.user_id}`, 'GET');
    if (patient) {
      displayMedicalHistory(patient, container);
    } else {
      container.innerHTML = '<p style="text-align: center; padding: 40px;">No medical history found. Click "Edit Medical History" to add your information.</p>';
    }
  } catch (error) {
    console.error('Error loading medical history:', error);
    // If patient not found, show message to create one
    if (error.message && error.message.includes('not found')) {
      container.innerHTML = '<p style="text-align: center; padding: 40px;">No medical history found. Click "Edit Medical History" to create your patient profile.</p>';
    } else {
      showMessage('Error loading medical history: ' + (error.message || 'Unknown error'), 'error');
      if (container) {
        container.innerHTML = '<p style="text-align: center; padding: 40px;">Error loading data. Please try again later.</p>';
      }
    }
  }
  
  // Setup button listeners after loading
  setTimeout(() => {
    setupButtonListeners();
  }, 100);
}

// Display Medical History
function displayMedicalHistory(patient, container) {
  const medicalHistory = patient.medical_history || {};
  const chronicConditions = patient.chronic_conditions || {};
  
  container.innerHTML = `
    <div class="medical-history-card" style="background: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 20px;">
      <h3 style="margin-bottom: 20px; color: #2c3e50;">Personal Information</h3>
      <div class="info-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px;">
        <div>
          <strong>Blood Type:</strong>
          <p style="margin-top: 5px; color: #666;">${patient.blood_type || 'Not specified'}</p>
        </div>
        <div>
          <strong>Date of Birth:</strong>
          <p style="margin-top: 5px; color: #666;">${patient.date_of_birth ? formatDate(patient.date_of_birth) : 'Not specified'}</p>
        </div>
        <div>
          <strong>Gender:</strong>
          <p style="margin-top: 5px; color: #666;">${patient.gender ? patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1) : 'Not specified'}</p>
        </div>
        <div>
          <strong>Phone Number:</strong>
          <p style="margin-top: 5px; color: #666;">${patient.phone_number || 'Not specified'}</p>
        </div>
      </div>

      <h3 style="margin-bottom: 20px; color: #2c3e50; margin-top: 30px;">Medical History</h3>
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        ${Object.keys(medicalHistory).length > 0 
          ? Object.entries(medicalHistory).map(([key, value]) => `
              <div style="margin-bottom: 15px;">
                <strong>${key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</strong>
                <p style="margin-top: 5px; color: #666;">${typeof value === 'object' ? JSON.stringify(value, null, 2) : value}</p>
              </div>
            `).join('')
          : '<p style="color: #999;">No medical history recorded yet.</p>'
        }
      </div>

      <h3 style="margin-bottom: 20px; color: #2c3e50; margin-top: 30px;">Chronic Conditions</h3>
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
        ${Object.keys(chronicConditions).length > 0
          ? Object.entries(chronicConditions).map(([key, value]) => `
              <div style="margin-bottom: 15px;">
                <strong>${key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</strong>
                <p style="margin-top: 5px; color: #666;">${typeof value === 'object' ? JSON.stringify(value, null, 2) : value}</p>
              </div>
            `).join('')
          : '<p style="color: #999;">No chronic conditions recorded.</p>'
        }
      </div>
    </div>
  `;
}

// Load Patient Profiles
async function loadPatientProfiles() {
  const container = document.getElementById('patient-profiles-grid');
  if (!container) return;

  try {
    const profiles = await apiCall(`/patients/${currentUser.user_id}/profiles`, 'GET');
    const profilesArray = Array.isArray(profiles) ? profiles : (profiles?.data ? profiles.data : []);
    displayPatientProfiles(profilesArray, container);
  } catch (error) {
    console.error('Error loading patient profiles:', error);
    showMessage('Error loading patient profiles: ' + (error.message || 'Unknown error'), 'error');
    if (container) {
      container.innerHTML = '<p style="text-align: center; padding: 40px;">Error loading data. Please try again later.</p>';
    }
  }
  
  // Setup button listeners after loading
  setTimeout(() => {
    setupButtonListeners();
  }, 100);
}

// Display Patient Profiles
function displayPatientProfiles(profiles, container) {
  if (!profiles || profiles.length === 0) {
    container.innerHTML = '<p style="text-align: center; padding: 40px; grid-column: 1/-1;">No profiles found. Create your first profile to get started.</p>';
    return;
  }

  container.innerHTML = profiles.map(profile => `
    <div class="profile-card" style="background: white; border-radius: 8px; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
        <h3 style="margin: 0; color: #2c3e50;">Profile #${profile.profile_id}</h3>
        <span class="status-badge status-${profile.status || 'active'}">${getStatusText(profile.status || 'active')}</span>
      </div>
      <div style="margin-bottom: 15px;">
        <strong>Goal Amount:</strong>
        <p style="margin-top: 5px; color: #666; font-size: 1.2em; font-weight: bold;">${profile.goal_amount ? parseFloat(profile.goal_amount).toFixed(2) : '0.00'} USD</p>
      </div>
      <div style="margin-bottom: 15px;">
        <strong>Current Amount:</strong>
        <p style="margin-top: 5px; color: #27ae60; font-size: 1.2em; font-weight: bold;">${profile.current_amount ? parseFloat(profile.current_amount).toFixed(2) : '0.00'} USD</p>
      </div>
      <div style="margin-bottom: 15px;">
        <strong>Progress:</strong>
        <div style="background: #e0e0e0; border-radius: 10px; height: 20px; margin-top: 5px; overflow: hidden;">
          <div style="background: #27ae60; height: 100%; width: ${profile.goal_amount && parseFloat(profile.goal_amount) > 0 ? Math.min((parseFloat(profile.current_amount || 0) / parseFloat(profile.goal_amount)) * 100, 100) : 0}%; transition: width 0.3s ease;"></div>
        </div>
        <p style="margin-top: 5px; color: #666; font-size: 0.9em;">
          ${profile.goal_amount && parseFloat(profile.goal_amount) > 0 
            ? Math.round((parseFloat(profile.current_amount || 0) / parseFloat(profile.goal_amount)) * 100) 
            : 0}% Complete
        </p>
      </div>
      ${profile.story ? `
        <div style="margin-bottom: 15px;">
          <strong>Story:</strong>
          <p style="margin-top: 5px; color: #666; line-height: 1.6;">${profile.story}</p>
        </div>
      ` : ''}
      <div style="color: #999; font-size: 0.85em; margin-top: 15px;">
        Created: ${formatDate(profile.created_at)}
      </div>
    </div>
  `).join('');
}

// Load Health Content
async function loadHealthContent() {
  const container = document.getElementById('health-content-grid');
  if (!container) return;

  try {
    const content = await apiCall('/health_content', 'GET');
    const contentArray = Array.isArray(content) ? content : (content?.data ? content.data : []);
    displayHealthContent(contentArray, container);
  } catch (error) {
    console.error('Error loading health content:', error);
    showMessage('Error loading health content: ' + (error.message || 'Unknown error'), 'error');
    if (container) {
      container.innerHTML = '<p style="text-align: center; padding: 40px;">Error loading data. Please try again later.</p>';
    }
  }
}

// Display Health Content
function displayHealthContent(content, container) {
  if (!content || content.length === 0) {
    container.innerHTML = '<p style="text-align: center; padding: 40px; grid-column: 1/-1;">No health content available.</p>';
    return;
  }

  container.innerHTML = content.map(item => `
    <div class="content-card" style="background: white; border-radius: 8px; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      <h3 style="margin: 0 0 10px 0; color: #2c3e50;">${item.title || 'Health Content'}</h3>
      <p style="color: #666; margin-bottom: 15px; line-height: 1.6;">${item.content || item.description || 'No description available.'}</p>
      ${item.category ? `<span style="background: #3498db; color: white; padding: 4px 12px; border-radius: 16px; font-size: 0.85em; display: inline-block; margin-bottom: 10px;">${item.category}</span>` : ''}
      <div style="color: #999; font-size: 0.85em; margin-top: 15px;">
        ${item.created_at ? `Published: ${formatDate(item.created_at)}` : ''}
      </div>
    </div>
  `).join('');
}

// Load Health Alerts
async function loadHealthAlerts() {
  const container = document.getElementById('health-alerts-list');
  if (!container) return;

  try {
    const alerts = await apiCall('/health_alerts', 'GET');
    const alertsArray = Array.isArray(alerts) ? alerts : (alerts?.data ? alerts.data : []);
    displayHealthAlerts(alertsArray, container);
  } catch (error) {
    console.error('Error loading health alerts:', error);
    showMessage('Error loading health alerts: ' + (error.message || 'Unknown error'), 'error');
    if (container) {
      container.innerHTML = '<p style="text-align: center; padding: 40px;">Error loading data. Please try again later.</p>';
    }
  }
}

// Display Health Alerts
function displayHealthAlerts(alerts, container) {
  if (!alerts || alerts.length === 0) {
    container.innerHTML = '<p style="text-align: center; padding: 40px;">No health alerts at this time.</p>';
    return;
  }

  container.innerHTML = alerts.map(alert => `
    <div class="alert-card" style="background: white; border-radius: 8px; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 15px; border-left: 4px solid ${alert.alert_type === 'urgent' ? '#e74c3c' : alert.alert_type === 'warning' ? '#f39c12' : '#3498db'};">
      <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
        <h3 style="margin: 0; color: #2c3e50;">${alert.title || 'Health Alert'}</h3>
        ${alert.alert_type ? `<span style="background: ${alert.alert_type === 'urgent' ? '#e74c3c' : alert.alert_type === 'warning' ? '#f39c12' : '#3498db'}; color: white; padding: 4px 12px; border-radius: 16px; font-size: 0.85em;">${alert.alert_type.charAt(0).toUpperCase() + alert.alert_type.slice(1)}</span>` : ''}
      </div>
      <p style="color: #666; margin-bottom: 10px; line-height: 1.6;">${alert.message || alert.description || 'No description available.'}</p>
      <div style="color: #999; font-size: 0.85em;">
        ${alert.created_at ? `Published: ${formatDate(alert.created_at)}` : ''}
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
    const response = await apiCall('/medical_inventory', 'GET').catch(() => null);
    // API returns: {message, inventory}
    const inventory = response?.inventory || (Array.isArray(response) ? response : []);
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
        ${currentUser?.role === 'pharmacy' ? `<button class="btn btn-danger" onclick="deleteInventory(${item.inventory_id})">Delete</button>` : ''}
      </td>
    </tr>
  `).join('');
}

// Load Users (Admin only)
async function loadUsers() {
  const tbody = document.getElementById('users-tbody');
  if (!tbody) return;

  try {
    const response = await apiCall('/users', 'GET');
    // API returns: {message, users, count} or just array
    const users = response?.users || (Array.isArray(response) ? response : []);
    displayUsers(Array.isArray(users) ? users : [], tbody);
  } catch (error) {
    console.error('Error loading users:', error);
    showMessage('Error loading users', 'error');
    if (tbody) tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Error loading data</td></tr>';
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
async function loadSystemSettings() {
  const container = document.getElementById('system-settings');
  if (!container) return;

  // Only admin can access this page
  if (currentUser?.role !== 'admin') {
    container.innerHTML = `
      <div class="profile-container">
        <h3>Access Denied</h3>
        <p>You need admin privileges to access system settings.</p>
      </div>
    `;
    return;
  }

  try {
    // Load roles and permissions
    const [rolesResult, permissionsResult] = await Promise.all([
      apiCall('/roles', 'GET').catch(() => ({ roles: [] })),
      apiCall('/roles/permissions/all', 'GET').catch(() => ({ permissions: [] }))
    ]);

    const roles = rolesResult?.roles || [];
    const allPermissions = permissionsResult?.permissions || [];

    // Load permissions for each role
    const rolesWithPermissions = await Promise.all(
      roles.map(async (role) => {
        try {
          const permResult = await apiCall(`/roles/${role.role_id}/permissions`, 'GET');
          return {
            ...role,
            permissions: permResult?.permissions || []
          };
        } catch (error) {
          return {
            ...role,
            permissions: []
          };
        }
      })
    );

    displaySystemSettings(rolesWithPermissions, allPermissions, container);
  } catch (error) {
    console.error('Error loading system settings:', error);
    container.innerHTML = `
      <div class="profile-container">
        <h3>Error</h3>
        <p>Error loading system settings: ${error.message || 'Unknown error'}</p>
      </div>
    `;
  }
}

// Display System Settings
function displaySystemSettings(roles, allPermissions, container) {
  container.innerHTML = `
    <div class="system-settings-container">
      <div class="settings-section">
        <h3>Roles & Permissions Management</h3>
        <p style="color: #666; margin-bottom: 20px;">Manage roles and their assigned permissions</p>
        
        <div class="roles-permissions-grid">
          ${roles.map(role => `
            <div class="role-card" style="border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h4 style="margin: 0; color: #2c3e50;">${role.name.charAt(0).toUpperCase() + role.name.slice(1)}</h4>
                <span style="background: #3498db; color: white; padding: 4px 12px; border-radius: 16px; font-size: 0.85em;">
                  ${role.permissions.length} permission${role.permissions.length !== 1 ? 's' : ''}
                </span>
              </div>
              
              <div style="margin-bottom: 15px;">
                <strong>Current Permissions:</strong>
                <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px;">
                  ${role.permissions.length > 0 
                    ? role.permissions.map(p => `
                        <span style="background: #27ae60; color: white; padding: 4px 12px; border-radius: 16px; font-size: 0.85em; display: inline-flex; align-items: center; gap: 6px;">
                          ${p.name}
                          <button onclick="removePermissionFromRole(${role.role_id}, ${p.permission_id})" 
                                  style="background: rgba(255,255,255,0.3); border: none; color: white; border-radius: 50%; width: 18px; height: 18px; cursor: pointer; font-size: 12px; line-height: 1;">×</button>
                        </span>
                      `).join('')
                    : '<span style="color: #999; font-size: 0.9em;">No permissions assigned</span>'
                  }
                </div>
              </div>
              
              <div>
                <strong>Add Permission:</strong>
                <select id="permission-select-${role.role_id}" style="width: 100%; padding: 8px; margin-top: 8px; border: 1px solid #ddd; border-radius: 4px;">
                  <option value="">Select a permission...</option>
                  ${allPermissions
                    .filter(p => !role.permissions.some(rp => rp.permission_id === p.permission_id))
                    .map(p => `<option value="${p.permission_id}">${p.name}${p.description ? ' - ' + p.description : ''}</option>`)
                    .join('')
                  }
                </select>
                <button onclick="addPermissionToRole(${role.role_id})" 
                        class="btn btn-primary" 
                        style="margin-top: 10px; width: 100%;">
                  Add Permission
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

// Add Permission to Role
async function addPermissionToRole(roleId) {
  const select = document.getElementById(`permission-select-${roleId}`);
  const permissionId = select?.value;

  if (!permissionId) {
    showMessage('Please select a permission', 'error');
    return;
  }

  try {
    await apiCall(`/roles/${roleId}/permissions`, 'PUT', { permission_id: parseInt(permissionId) });
    showMessage('Permission added successfully', 'success');
    loadSystemSettings();
  } catch (error) {
    showMessage('Error adding permission: ' + (error.message || 'Unknown error'), 'error');
  }
}

// Remove Permission from Role
async function removePermissionFromRole(roleId, permissionId) {
  if (!confirm('Are you sure you want to remove this permission from the role?')) {
    return;
  }

  try {
    await apiCall(`/roles/${roleId}/permissions/${permissionId}`, 'DELETE');
    showMessage('Permission removed successfully', 'success');
    loadSystemSettings();
  } catch (error) {
    showMessage('Error removing permission: ' + (error.message || 'Unknown error'), 'error');
  }
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
    const errorMsg = result.error || result.message || result.details || 'Request error';
    const error = new Error(errorMsg);
    error.response = result;
    throw error;
  }

  
  if (result.success !== undefined) {
    return result.data !== undefined ? result.data : result;
  }
  
  return result.data !== undefined ? result.data : result;
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
  if (!status) return 'Not specified';
  
  const statusMap = {
    // General statuses
    'pending': 'Pending',
    'approved': 'Approved',
    'rejected': 'Rejected',
    'active': 'Active',
    'inactive': 'Inactive',
    'completed': 'Completed',
    'cancelled': 'Cancelled',
    
    // Medical case statuses
    'funded': 'Funded',
    'in_treatment': 'In Treatment',
    
    // Consultation statuses
    'confirmed': 'Confirmed',
    'in_progress': 'In Progress',
    'no_show': 'No Show',
    'scheduled': 'Scheduled',
    
    // Medication request statuses
    'open': 'Open',
    'matched': 'Matched',
    'fulfilled': 'Fulfilled',
    
    // Payment statuses
    'completed': 'Completed',
    'failed': 'Failed',
    'refunded': 'Refunded',
    
    // Inventory statuses
    'available': 'Available',
    'reserved': 'Reserved',
    'distributed': 'Distributed'
  };
  
  return statusMap[status.toLowerCase()] || status.charAt(0).toUpperCase() + status.slice(1);
}

// Toggle Sidebar (Mobile)
function toggleSidebar() {
  document.querySelector('.sidebar').classList.toggle('open');
}

// Logout
function handleLogout() {
  const confirmMsg = typeof t === 'function' ? t('confirmLogout') : 'Are you sure you want to logout?';
  if (confirm(confirmMsg)) {
    try {
      // Clear all localStorage data
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      localStorage.removeItem('refreshToken');
      
      // Clear any session storage
      sessionStorage.clear();
      
      // Redirect to login page
      window.location.href = '/login.html';
    } catch (error) {
      console.error('Error during logout:', error);
      // Force redirect even if there's an error
      window.location.href = '/login.html';
    }
  }
}

// Toggle Language
function toggleLanguage() {
  const currentLang = typeof getCurrentLanguage === 'function' ? getCurrentLanguage() : (currentUser?.preferred_language || 'arabic');
  const newLang = currentLang === 'arabic' ? 'english' : 'arabic';
  
  if (typeof setLanguage === 'function') {
    if (setLanguage(newLang)) {
      // Update user preference in database if logged in
      if (currentUser && currentUser.user_id) {
        updateUserLanguagePreference(newLang);
      }
      // Reload dashboard to apply translations
      loadDashboard();
      // Ensure translations are applied after dashboard loads
      setTimeout(() => {
        if (typeof applyTranslations === 'function') {
          applyTranslations();
        } else if (typeof window.applyTranslations === 'function') {
          window.applyTranslations();
        }
      }, 100);
    }
  }
}

// Update user language preference in database
async function updateUserLanguagePreference(lang) {
  try {
    await apiCall(`/users/${currentUser.user_id}`, 'PUT', { preferred_language: lang });
    // Update current user object
    if (currentUser) {
      currentUser.preferred_language = lang;
      localStorage.setItem('user', JSON.stringify(currentUser));
    }
  } catch (error) {
    console.error('Error updating language preference:', error);
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
        <button class="modal-close" id="modal-close-btn">×</button>
      </div>
      <div class="modal-body">
        ${content}
      </div>
    </div>
  `;
  overlay.classList.add('active');
  
  // Setup close button listener
  setTimeout(() => {
    const closeBtn = document.getElementById('modal-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        closeModal();
      });
    }
    
    // Function to setup cancel button
    const setupCancelButton = (btn) => {
      if (btn.hasAttribute('data-close-listener')) return; // Already set up
      
      // Remove onclick to prevent conflicts
      if (btn.hasAttribute('onclick')) {
        btn.removeAttribute('onclick');
      }
      
      // Add event listener
      btn.setAttribute('data-close-listener', 'true');
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        closeModal();
      }, true); // Use capture phase for priority
    };
    
    // Setup all Cancel/Close buttons in the modal - comprehensive approach
    const allButtons = overlay.querySelectorAll('button');
    allButtons.forEach(btn => {
      const btnText = btn.textContent.trim().toLowerCase();
      const hasOnclickClose = btn.getAttribute('onclick') && btn.getAttribute('onclick').includes('closeModal');
      const isCancelBtn = btnText === 'cancel' || btnText === 'close' || btnText === '×' || 
                         btn.classList.contains('modal-cancel-btn') || btn.classList.contains('modal-close');
      
      if (hasOnclickClose || isCancelBtn) {
        setupCancelButton(btn);
      }
    });
    
    // Second pass - catch any buttons we might have missed
    setTimeout(() => {
      overlay.querySelectorAll('button').forEach(btn => {
        const btnText = btn.textContent.trim().toLowerCase();
        if ((btnText === 'cancel' || btnText === 'close') && !btn.hasAttribute('data-close-listener')) {
          setupCancelButton(btn);
        }
      });
    }, 150);
  }, 150);
  
  // Close modal when clicking on overlay (but not on modal content)
  overlay.onclick = (e) => {
    
    if (e.target === overlay) {
      closeModal();
    }
  };
  
  // Prevent modal from closing when clicking inside modal
  const modal = overlay.querySelector('.modal');
  if (modal) {
    modal.onclick = (e) => {
      e.stopPropagation();
    };
  }
  
}

function closeModal() {
  const overlay = document.getElementById('modal-overlay');
  if (overlay) {
    overlay.classList.remove('active');
    
    const parent = overlay.parentNode;
    const newOverlay = overlay.cloneNode(false);
    parent.replaceChild(newOverlay, overlay);
    
    setTimeout(() => {
      newOverlay.innerHTML = '';
    }, 300);
  }
}

// Add Medical Case Modal
async function showAddMedicalCaseModal() {
  let patientSelect = '';
  
  // If doctor, show patient selection
  if (currentUser?.role === 'doctor') {
    try {
      // Get patients from medical cases (they have patient_name)
      const cases = await apiCall('/medical-cases', 'GET').catch(() => ({ cases: [] }));
      const casesArray = cases?.cases || (Array.isArray(cases) ? cases : []);
      
      // Extract unique patients from cases
      const patientMap = new Map();
      casesArray.forEach(c => {
        if (c.patient_id && !patientMap.has(c.patient_id)) {
          patientMap.set(c.patient_id, {
            user_id: c.patient_id,
            full_name: c.patient_name || 'Unknown Patient',
            email: c.patient_email || ''
          });
        }
      });
      
      // Also try to get from existing consultations
      try {
        const consultations = await apiCall('/consultations', 'GET').catch(() => ({ consultations: [] }));
        const consultationsArray = consultations?.consultations || (Array.isArray(consultations) ? consultations : []);
        consultationsArray.forEach(consult => {
          if (consult.patient_id && !patientMap.has(consult.patient_id)) {
            patientMap.set(consult.patient_id, {
              user_id: consult.patient_id,
              full_name: consult.patient_name || 'Unknown Patient',
              email: ''
            });
          }
        });
      } catch (e) {
        console.error('Error loading consultations for patients:', e);
      }
      
      const patientList = Array.from(patientMap.values());
      
      const getText = (key) => typeof t === 'function' ? t(key) : key;
      
      if (patientList.length > 0) {
        patientSelect = `
          <div class="form-group">
            <label>${getText('patient')} *</label>
            <select name="patient_id" required>
              <option value="">${getText('selectPatient')}</option>
              ${patientList.map(p => `<option value="${p.user_id}">${p.full_name}${p.email ? ' (' + p.email + ')' : ''}</option>`).join('')}
            </select>
          </div>
        `;
      } else {
        patientSelect = `
          <div class="form-group">
            <label>${getText('patient')} ID *</label>
            <input type="number" name="patient_id" required placeholder="${getText('enterPatientId')}">
            <small style="color: #666; font-size: 0.85em;">${getText('enterPatientId')}</small>
          </div>
        `;
      }
    } catch (error) {
      console.error('Error loading patients:', error);
      const getText = (key) => typeof t === 'function' ? t(key) : key;
      // Fallback to manual input
      patientSelect = `
        <div class="form-group">
          <label>${getText('patient')} ID *</label>
          <input type="number" name="patient_id" required placeholder="${getText('enterPatientId')}">
          <small style="color: #666; font-size: 0.85em;">${getText('enterPatientId')}</small>
        </div>
      `;
    }
  }
  
  const getText = (key) => typeof t === 'function' ? t(key) : key;
  const modalTitle = getText('addMedicalCase');
  
  const content = `
    <form id="add-medical-case-form">
      ${patientSelect}
      <div class="form-group">
        <label>${getText('caseTitle')} *</label>
        <input type="text" name="case_title" required placeholder="${getText('caseTitlePlaceholder')}">
      </div>
      <div class="form-group">
        <label>${getText('caseDescription')} *</label>
        <textarea name="case_description" rows="4" required placeholder="${getText('caseDescriptionPlaceholder')}"></textarea>
      </div>
      <div class="form-group">
        <label>${getText('targetAmount')} (USD) *</label>
        <input type="number" name="target_amount" step="0.01" min="0" required placeholder="${getText('targetAmountPlaceholder')}">
      </div>
      <div class="form-group">
        <label>${getText('medicalCondition')}</label>
        <input type="text" name="medical_condition" placeholder="${getText('medicalConditionPlaceholder')}">
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary modal-cancel-btn">${getText('cancel')}</button>
        <button type="submit" class="btn btn-primary">${getText('create')}</button>
      </div>
    </form>
  `;
  showModal(modalTitle, content);
  
  // Attach event listener after modal is shown
  setTimeout(() => {
    const form = document.getElementById('add-medical-case-form');
    if (form) {
      // Remove any existing listeners
      const newForm = form.cloneNode(true);
      form.parentNode.replaceChild(newForm, form);
      // Add new listener
      document.getElementById('add-medical-case-form').addEventListener('submit', handleAddMedicalCase);
    }
  }, 100);
}

async function handleAddMedicalCase(e) {
  e.preventDefault();
  e.stopPropagation();
  
  // Check permission (if permissions are loaded)
  if (userPermissions.length > 0 && !hasPermission('create_medical_case') && currentUser?.role !== 'patient' && currentUser?.role !== 'doctor') {
    showMessage('You do not have permission to create medical cases', 'error');
    return false;
  }

  const formData = new FormData(e.target);
  
  // Validate required fields
  const caseTitle = formData.get('case_title');
  const caseDescription = formData.get('case_description');
  const targetAmount = formData.get('target_amount');
  const patientId = formData.get('patient_id');
  
  // For doctors, patient_id is required
  // For patients, use their own user_id
  let finalPatientId = patientId;
  if (currentUser?.role === 'patient') {
    finalPatientId = currentUser.user_id;
  }
  
  const getText = (key) => typeof t === 'function' ? t(key) : key;
  
  if (!caseTitle || !caseDescription || !targetAmount || !finalPatientId) {
    showMessage(getText('pleaseFillAllFields'), 'error');
    return false;
  }
  
  const data = {
    patient_id: parseInt(finalPatientId),
    case_title: caseTitle.trim(),
    case_description: caseDescription.trim(),
    target_amount: parseFloat(targetAmount),
    medical_condition: formData.get('medical_condition')?.trim() || null
  };

  // Validate target amount
  if (isNaN(data.target_amount) || data.target_amount <= 0) {
    showMessage(getText('enterValidAmount'), 'error');
    return false;
  }
  
  // Validate patient_id
  if (isNaN(data.patient_id) || data.patient_id <= 0) {
    showMessage(getText('enterValidPatientId'), 'error');
    return false;
  }

  try {
    const result = await apiCall('/medical-cases', 'POST', data);
    showMessage(getText('medicalCaseCreatedSuccessfully'), 'success');
    closeModal();
    // Reload data after a short delay
    setTimeout(() => {
      loadMedicalCases();
      loadDashboard();
    }, 500);
  } catch (error) {
    console.error('Error creating medical case:', error);
    const errorMessage = error.message || error.response?.error || error.response?.details || 'Unknown error';
    showMessage('Error creating medical case: ' + errorMessage, 'error');
  }
  
  return false;
}

// Edit Medical Case Modal
async function showEditMedicalCaseModal(caseId) {
  try {
    if (!caseId || isNaN(parseInt(caseId))) {
      showMessage('Invalid case ID', 'error');
      return;
    }

    const caseIdNum = parseInt(caseId);
    
    const caseData = await apiCall(`/medical-cases/${caseIdNum}`, 'GET');
    
    if (!caseData) {
      showMessage('Medical case not found', 'error');
      return;
    }

    // Escape HTML properly
    const escapeHtml = (text) => {
      if (!text) return '';
      return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    };

    const content = `
      <form id="edit-medical-case-form">
        <div class="form-group">
          <label>Case Title *</label>
          <input type="text" name="case_title" value="${escapeHtml(caseData.case_title || '')}" required placeholder="e.g., Heart Surgery Fund">
        </div>
        <div class="form-group">
          <label>Case Description *</label>
          <textarea name="case_description" rows="4" required placeholder="Describe the medical case and why funding is needed...">${escapeHtml(caseData.case_description || '')}</textarea>
        </div>
        <div class="form-group">
          <label>Target Amount (USD) *</label>
          <input type="number" name="target_amount" step="0.01" min="0" value="${caseData.target_amount || 0}" required placeholder="0.00">
        </div>
        <div class="form-group">
          <label>Medical Condition</label>
          <input type="text" name="medical_condition" value="${escapeHtml(caseData.medical_condition || '')}" placeholder="e.g., Heart Disease, Cancer, etc.">
        </div>
        <div class="form-group">
          <label>Status *</label>
          <select name="case_status" required>
            <option value="active" ${caseData.case_status === 'active' ? 'selected' : ''}>Active</option>
            <option value="in_treatment" ${caseData.case_status === 'in_treatment' ? 'selected' : ''}>In Treatment</option>
            <option value="funded" ${caseData.case_status === 'funded' ? 'selected' : ''}>Funded</option>
            <option value="completed" ${caseData.case_status === 'completed' ? 'selected' : ''}>Completed</option>
            <option value="cancelled" ${caseData.case_status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
          </select>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary modal-cancel-btn">Cancel</button>
          <button type="submit" class="btn btn-primary">Save Changes</button>
        </div>
      </form>
    `;
    
    showModal('Edit Medical Case', content);
    
    // Attach event listener after modal is shown
    setTimeout(() => {
      const form = document.getElementById('edit-medical-case-form');
      if (form) {
        // Remove any existing listeners by cloning
        const newForm = form.cloneNode(true);
        form.parentNode.replaceChild(newForm, form);
        // Add new listener
        const updatedForm = document.getElementById('edit-medical-case-form');
        if (updatedForm) {
          updatedForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            await handleEditMedicalCase(e, caseIdNum);
          });
        }
      }
    }, 200);
  } catch (error) {
    console.error('Error loading medical case:', error);
    showMessage('Error loading medical case: ' + (error.message || 'Unknown error'), 'error');
  }
}

async function handleEditMedicalCase(e, caseId) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  
  if (!caseId || isNaN(parseInt(caseId))) {
    showMessage('Invalid case ID', 'error');
    return false;
  }

  const form = document.getElementById('edit-medical-case-form');
  if (!form) {
    showMessage('Form not found', 'error');
    return false;
  }

  const formData = new FormData(form);
  
  // Validate required fields
  const caseTitle = formData.get('case_title');
  const caseDescription = formData.get('case_description');
  const targetAmount = formData.get('target_amount');
  const caseStatus = formData.get('case_status');
  
  if (!caseTitle || !caseDescription || !targetAmount || !caseStatus) {
    showMessage('Please fill in all required fields', 'error');
    return false;
  }
  
  const data = {
    case_title: caseTitle.trim(),
    case_description: caseDescription.trim(),
    target_amount: parseFloat(targetAmount),
    medical_condition: formData.get('medical_condition')?.trim() || null,
    case_status: caseStatus
  };

  // Validate target amount
  if (isNaN(data.target_amount) || data.target_amount <= 0) {
    showMessage('Please enter a valid target amount greater than 0', 'error');
    return false;
  }

  try {
    await apiCall(`/medical-cases/${caseId}`, 'PUT', data);
    showMessage('Medical case updated successfully!', 'success');
    closeModal();
    // Reload data after a short delay
    setTimeout(() => {
      loadMedicalCases();
      loadDashboard();
    }, 500);
  } catch (error) {
    console.error('Error updating medical case:', error);
    const errorMessage = error.message || error.response?.error || error.response?.details || 'Unknown error';
    showMessage('Error updating medical case: ' + errorMessage, 'error');
  }
  
  return false;
}

// Add Consultation Modal
async function showAddConsultationModal() {
  let patientSelect = '';
  
  // If doctor, show patient selection
  if (currentUser?.role === 'doctor') {
    try {
      // Get patients from medical cases (they have patient_name)
      const cases = await apiCall('/medical-cases', 'GET').catch(() => ({ cases: [] }));
      const casesArray = cases?.cases || (Array.isArray(cases) ? cases : []);
      
      // Extract unique patients from cases
      const patientMap = new Map();
      casesArray.forEach(c => {
        if (c.patient_id && !patientMap.has(c.patient_id)) {
          patientMap.set(c.patient_id, {
            user_id: c.patient_id,
            full_name: c.patient_name || 'Unknown Patient',
            email: c.patient_email || ''
          });
        }
      });
      
      //  try to get from existing consultations
      try {
        const consultations = await apiCall('/consultations', 'GET').catch(() => ({ consultations: [] }));
        const consultationsArray = consultations?.consultations || (Array.isArray(consultations) ? consultations : []);
        consultationsArray.forEach(consult => {
          if (consult.patient_id && !patientMap.has(consult.patient_id)) {
            patientMap.set(consult.patient_id, {
              user_id: consult.patient_id,
              full_name: consult.patient_name || 'Unknown Patient',
              email: ''
            });
          }
        });
      } catch (e) {
        console.error('Error loading consultations for patients:', e);
      }
      
      const patientList = Array.from(patientMap.values());
      
      if (patientList.length > 0) {
        patientSelect = `
          <div class="form-group">
            <label>Patient *</label>
            <select name="patient_id" required>
              <option value="">Select a patient...</option>
              ${patientList.map(p => `<option value="${p.user_id}">${p.full_name}${p.email ? ' (' + p.email + ')' : ''}</option>`).join('')}
            </select>
          </div>
        `;
      } else {
        patientSelect = `
          <div class="form-group">
            <label>Patient ID *</label>
            <input type="number" name="patient_id" required placeholder="Enter patient ID">
            <small style="color: #666; font-size: 0.85em;">Enter the patient's user ID</small>
          </div>
        `;
      }
    } catch (error) {
      console.error('Error loading patients:', error);
      // Fallback to manual input
      patientSelect = `
        <div class="form-group">
          <label>Patient ID *</label>
          <input type="number" name="patient_id" required placeholder="Enter patient ID">
          <small style="color: #666; font-size: 0.85em;">Enter the patient's user ID</small>
        </div>
      `;
    }
  }
  
  const content = `
    <form id="add-consultation-form">
      ${patientSelect}
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
        <textarea name="notes" rows="3" placeholder="Any additional notes..."></textarea>
      </div>
      <div class="form-group">
        <label>
          <input type="checkbox" name="low_bandwidth"> Low bandwidth connection
        </label>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
        <button type="submit" class="btn btn-primary">Create Consultation</button>
      </div>
    </form>
  `;
  showModal('Add New Consultation', content);
  
  // Attach event listener after modal is shown
  setTimeout(() => {
    const form = document.getElementById('add-consultation-form');
    if (form) {
      // Remove any existing listeners
      const newForm = form.cloneNode(true);
      form.parentNode.replaceChild(newForm, form);
      
      document.getElementById('add-consultation-form').addEventListener('submit', handleAddConsultation);
    }
  }, 100);
}

async function handleAddConsultation(e) {
  e.preventDefault();
  e.stopPropagation();
  
  const formData = new FormData(e.target);
  const data = {
    consultation_type: formData.get('consultation_type'),
    scheduled_at: formData.get('scheduled_at') || null,
    duration_minutes: formData.get('duration_minutes') ? parseInt(formData.get('duration_minutes')) : null,
    notes: formData.get('notes') || null,
    low_bandwidth: formData.has('low_bandwidth'),
    status: 'pending'
  };
  
  // Set patient_id or doctor_id based on user role
  if (currentUser?.role === 'patient') {
    data.patient_id = currentUser.user_id;
  } else if (currentUser?.role === 'doctor') {
    data.doctor_id = currentUser.user_id;
    // Patient ID is required for doctors
    const patientId = formData.get('patient_id');
    if (!patientId) {
      showMessage('Please select or enter a patient ID', 'error');
      return false;
    }
    data.patient_id = parseInt(patientId);
    if (isNaN(data.patient_id) || data.patient_id <= 0) {
      showMessage('Invalid patient ID', 'error');
      return false;
    }
  }

  try {
    const result = await apiCall('/consultations', 'POST', data);
    showMessage('Consultation created successfully!', 'success');
    closeModal();
    // Reload data after a short delay
    setTimeout(() => {
      loadConsultations();
      loadDashboard();
    }, 500);
  } catch (error) {
    console.error('Error creating consultation:', error);
    const errorMsg = error.message || error.error || error.details || 'Unknown error';
    showMessage('Error creating consultation: ' + errorMsg, 'error');
  }
  
  return false;
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
    <form id="add-medication-request-form">
      <div class="form-group">
        <label>Medication Name *</label>
        <input type="text" name="medication_name" required placeholder="e.g., Aspirin, Paracetamol">
      </div>
      <div class="form-group">
        <label>Quantity Needed *</label>
        <input type="number" name="quantity_needed" min="1" required placeholder="1">
      </div>
      <div class="form-group">
        <label>Dosage</label>
        <input type="text" name="dosage" placeholder="e.g., 500mg twice daily">
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
        <input type="text" name="medical_condition" placeholder="e.g., Heart Disease">
      </div>
      <div class="form-group">
        <label>Related Medical Case ID (optional)</label>
        <input type="number" name="medical_case_id" placeholder="Enter case ID if related">
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
        <button type="submit" class="btn btn-primary">Create Request</button>
      </div>
    </form>
  `;
  showModal('Add New Medication Request', content);
  
  // Attach event listener after modal is shown
  setTimeout(() => {
    const form = document.getElementById('add-medication-request-form');
    if (form) {
      // Remove any existing listeners
      const newForm = form.cloneNode(true);
      form.parentNode.replaceChild(newForm, form);
      // Add new listener
      document.getElementById('add-medication-request-form').addEventListener('submit', handleAddMedicationRequest);
    }
  }, 100);
}

async function handleAddMedicationRequest(e) {
  e.preventDefault();
  e.stopPropagation();
  
  const formData = new FormData(e.target);
  
  // Validate required fields
  const medicationName = formData.get('medication_name');
  const quantityNeeded = formData.get('quantity_needed');
  
  if (!medicationName || !quantityNeeded) {
    showMessage('Please fill in all required fields', 'error');
    return false;
  }
  
  const data = {
    patient_id: currentUser.user_id,
    medication_name: medicationName.trim(),
    quantity_needed: parseInt(quantityNeeded),
    dosage: formData.get('dosage')?.trim() || null,
    urgency_level: formData.get('urgency_level') || 'medium',
    medical_condition: formData.get('medical_condition')?.trim() || null,
    medical_case_id: formData.get('medical_case_id') ? parseInt(formData.get('medical_case_id')) : null,
    request_status: 'open'
  };

  // Validate quantity
  if (isNaN(data.quantity_needed) || data.quantity_needed <= 0) {
    showMessage('Please enter a valid quantity greater than 0', 'error');
    return false;
  }

  try {
    const result = await apiCall('/medication_requests', 'POST', data);
    showMessage('Medication request created successfully!', 'success');
    closeModal();
    // Reload data after a short delay
    setTimeout(() => {
      loadMedicationRequests();
      loadDashboard();
    }, 500);
  } catch (error) {
    console.error('Error creating medication request:', error);
    showMessage('Error creating medication request: ' + (error.message || 'Unknown error'), 'error');
  }
  
  return false;
}

// Add Mental Health Session Modal
function showAddMentalHealthSessionModal() {
  const content = `
    <form id="add-mental-health-form">
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
        <textarea name="session_notes" rows="3" placeholder="Any notes about the session..."></textarea>
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
        <button type="submit" class="btn btn-primary">Create Session</button>
      </div>
    </form>
  `;
  showModal('Add New Mental Health Session', content);
  
  // Attach event listener after modal is shown
  setTimeout(() => {
    const form = document.getElementById('add-mental-health-form');
    if (form) {
      // Remove any existing listeners
      const newForm = form.cloneNode(true);
      form.parentNode.replaceChild(newForm, form);
      // Add new listener
      document.getElementById('add-mental-health-form').addEventListener('submit', handleAddMentalHealthSession);
    }
  }, 100);
}

async function handleAddMentalHealthSession(e) {
  e.preventDefault();
  e.stopPropagation();
  
  const formData = new FormData(e.target);
  const data = {
    patient_id: currentUser.user_id,
    session_type: formData.get('session_type'),
    scheduled_datetime: formData.get('scheduled_datetime') || null,
    duration_minutes: formData.get('duration_minutes') ? parseInt(formData.get('duration_minutes')) : 60,
    session_notes: formData.get('session_notes')?.trim() || null,
    trauma_type: formData.get('trauma_type') || null,
    is_anonymous: formData.has('is_anonymous'),
    session_status: 'scheduled'
  };

  try {
    const result = await apiCall('/mental_health_sessions', 'POST', data);
    showMessage('Mental health session created successfully!', 'success');
    closeModal();
    
    setTimeout(() => {
      loadMentalHealthSessions();
      loadDashboard();
    }, 500);
  } catch (error) {
    console.error('Error creating mental health session:', error);
    showMessage('Error creating session: ' + (error.message || 'Unknown error'), 'error');
  }
  
  return false;
}

// Add Support Group Modal
function showAddSupportGroupModal() {
  const content = `
    <form id="add-support-group-form">
      <div class="form-group">
        <label>Group Name *</label>
        <input type="text" name="group_name" required placeholder="e.g., PTSD Support Group">
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
        <textarea name="description" rows="4" required placeholder="Describe the support group..."></textarea>
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
        <button type="submit" class="btn btn-primary">Create Group</button>
      </div>
    </form>
  `;
  showModal('Add New Support Group', content);
  
  // Attach event listener after modal is shown
  setTimeout(() => {
    const form = document.getElementById('add-support-group-form');
    if (form) {
      // Remove any existing listeners
      const newForm = form.cloneNode(true);
      form.parentNode.replaceChild(newForm, form);
      // Add new listener
      document.getElementById('add-support-group-form').addEventListener('submit', handleAddSupportGroup);
    }
  }, 100);
}

async function handleAddSupportGroup(e) {
  e.preventDefault();
  e.stopPropagation();
  
  const formData = new FormData(e.target);
  
  // Validate required fields
  const groupName = formData.get('group_name');
  const groupType = formData.get('group_type');
  const description = formData.get('description');
  
  if (!groupName || !groupType || !description) {
    showMessage('Please fill in all required fields', 'error');
    return false;
  }
  
  const data = {
    group_name: groupName.trim(),
    group_type: groupType,
    description: description.trim(),
    max_members: formData.get('max_members') ? parseInt(formData.get('max_members')) : 20,
    meeting_schedule: formData.get('meeting_schedule')?.trim() || null,
    moderator_id: currentUser.user_id,
    current_members: 0,
    is_active: true
  };

  // Validate max_members
  if (isNaN(data.max_members) || data.max_members <= 0) {
    showMessage('Please enter a valid number of max members', 'error');
    return false;
  }

  try {
    const result = await apiCall('/support_groups', 'POST', data);
    showMessage('Support group created successfully!', 'success');
    closeModal();
   
    setTimeout(() => {
      // Always reload support groups to show the new group
      loadSupportGroups();
      loadDashboard();
    }, 300);
  } catch (error) {
    console.error('Error creating support group:', error);
    showMessage('Error creating support group: ' + (error.message || 'Unknown error'), 'error');
  }
  
  return false;
}

// Add NGO Modal
function showAddNGOModal() {
  
  if (userPermissions.length > 0 && !hasPermission('create_ngo') && currentUser?.role !== 'admin') {
    showMessage('You do not have permission to add NGOs', 'error');
    return;
  }

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
    const updates = await apiCall(`/medical-cases/${id}/updates`, 'GET').catch(() => []);
    
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
      ${updates && updates.length > 0 ? `
        <div style="margin-bottom: 20px;">
          <h4>Case Updates:</h4>
          <div style="max-height: 200px; overflow-y: auto;">
            ${updates.map(update => `
              <div style="padding: 10px; margin-bottom: 10px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #3498db;">
                <p style="margin: 0 0 5px 0;"><strong>${formatDate(update.created_at)}</strong></p>
                <p style="margin: 0;">${update.update_content || update.update_text || 'No content'}</p>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
      ${donations.donations && donations.donations.length > 0 ? `
        <div style="margin-bottom: 20px;">
          <h4>Donations:</h4>
          <ul>
            ${donations.donations.map(d => `<li>${d.amount} ${d.currency} - ${formatDate(d.created_at)}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
      <div class="modal-footer">
        ${currentUser?.role === 'doctor' || currentUser?.role === 'ngo' ? `<button class="btn btn-primary" onclick="closeModal(); showAddCaseUpdateModal(${id});">Add Update</button>` : ''}
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
    if (!id || isNaN(parseInt(id))) {
      showMessage('Invalid consultation ID', 'error');
      return;
    }

    // Fetch consultation details
    const response = await apiCall(`/consultations/${id}`, 'GET');
    
    // Handle different response structures from backend
    let consultationData = null;
    if (response && response.consultation) {
      consultationData = response.consultation;
    } else if (response && response.consultation_id) {
      consultationData = response;
    } else if (response && typeof response === 'object') {
      consultationData = response;
    }
    
    if (!consultationData || !consultationData.consultation_id) {
      showMessage('Consultation not found', 'error');
      return;
    }
    
    // Get messages for this consultation
    let messagesData = [];
    try {
      const messagesResponse = await apiCall(`/consultations/${id}/messages`, 'GET');
      if (Array.isArray(messagesResponse)) {
        messagesData = messagesResponse;
      } else if (messagesResponse && Array.isArray(messagesResponse.messages)) {
        messagesData = messagesResponse.messages;
      } else if (messagesResponse && Array.isArray(messagesResponse.data)) {
        messagesData = messagesResponse.data;
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      // Don't show error to user, just continue without messages
      messagesData = [];
    }
    
    // Format consultation type
    const consultationTypeMap = {
      'video': 'Video Call',
      'audio': 'Audio Call',
      'message': 'Message',
      'in_person': 'In Person'
    };
    const consultationType = consultationTypeMap[consultationData.consultation_type] || consultationData.consultation_type || 'Not specified';
    
    // Build the content HTML
    const content = `
      <div style="margin-bottom: 20px;">
        <div style="margin-bottom: 15px;">
          <h3 style="margin-bottom: 10px; color: #333;">Consultation #${consultationData.consultation_id || id}</h3>
          <p style="color: #666; font-size: 14px; margin: 5px 0;">Created: ${formatDate(consultationData.created_at)}</p>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
          <div>
            <p style="margin: 8px 0;"><strong>Consultation Type:</strong> ${consultationType}</p>
            <p style="margin: 8px 0;"><strong>Status:</strong> <span class="status-badge status-${consultationData.status || 'pending'}">${getStatusText(consultationData.status || 'pending')}</span></p>
          </div>
          <div>
            ${consultationData.patient_name ? `<p style="margin: 8px 0;"><strong>Patient:</strong> ${consultationData.patient_name}</p>` : ''}
            ${consultationData.doctor_name ? `<p style="margin: 8px 0;"><strong>Doctor:</strong> ${consultationData.doctor_name}</p>` : ''}
          </div>
        </div>
        
        ${consultationData.scheduled_at ? `
          <p style="margin: 8px 0;"><strong>Scheduled At:</strong> ${formatDate(consultationData.scheduled_at)}</p>
        ` : ''}
        
        ${consultationData.duration_minutes ? `
          <p style="margin: 8px 0;"><strong>Duration:</strong> ${consultationData.duration_minutes} minutes</p>
        ` : ''}
        
        ${consultationData.low_bandwidth !== undefined && consultationData.low_bandwidth ? `
          <p style="margin: 8px 0;"><strong>Low Bandwidth Mode:</strong> Enabled</p>
        ` : ''}
        
        ${consultationData.notes ? `
          <div style="margin-top: 15px;">
            <p style="margin-bottom: 5px;"><strong>Notes:</strong></p>
            <div style="padding: 10px; background: #f8f9fa; border-radius: 8px; margin-top: 5px; white-space: pre-wrap;">
              ${(consultationData.notes || '').replace(/\n/g, '<br>')}
            </div>
          </div>
        ` : ''}
      </div>
      
      ${messagesData && messagesData.length > 0 ? `
        <div style="margin-top: 20px;">
          <h4 style="margin-bottom: 10px; color: #333;">Messages (${messagesData.length}):</h4>
          <div style="max-height: 300px; overflow-y: auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 10px; background: #fafafa;">
            ${messagesData.map(m => `
              <div style="padding: 10px; margin-bottom: 10px; background: #ffffff; border-radius: 8px; border-left: 3px solid #007bff; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">
                <p style="margin: 0 0 5px 0; color: #333; white-space: pre-wrap;">${(m.message_text || m.content || '').replace(/\n/g, '<br>')}</p>
                <small style="color: #666;">${formatDate(m.sent_at || m.created_at)}</small>
              </div>
            `).join('')}
          </div>
        </div>
      ` : '<p style="color: #666; margin-top: 20px; font-style: italic;">No messages yet.</p>'}
      
      <div class="modal-footer" style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #e0e0e0;">
        <button class="btn btn-secondary" onclick="closeModal()">Close</button>
        <button class="btn btn-primary" id="send-message-trigger-btn" data-consultation-id="${id}">Send Message</button>
      </div>
    `;
    
    showModal('Consultation Details', content);
    
    // Attach event listener to Send Message button
    setTimeout(() => {
      const sendBtn = document.getElementById('send-message-trigger-btn');
      if (sendBtn) {
        sendBtn.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          const consultationId = parseInt(this.getAttribute('data-consultation-id'));
          closeModal();
          setTimeout(() => {
            if (typeof showSendMessageModal === 'function') {
              showSendMessageModal(consultationId);
            } else if (typeof window.showSendMessageModal === 'function') {
              window.showSendMessageModal(consultationId);
            }
          }, 300);
        });
      }
    }, 200);
  } catch (error) {
    console.error('Error loading consultation:', error);
    const errorMessage = error.message || error.response?.error || error.response?.details || 'Unknown error';
    showMessage('Error loading consultation: ' + errorMessage, 'error');
  }
}

function showSendMessageModal(consultationId) {
  console.log('showSendMessageModal called with consultationId:', consultationId);
  
  if (!consultationId || isNaN(parseInt(consultationId))) {
    showMessage('Invalid consultation ID', 'error');
    return;
  }

  const consultationIdNum = parseInt(consultationId);
  console.log('Parsed consultation ID:', consultationIdNum);
  
  const content = `
    <form id="send-message-form">
      <div class="form-group">
        <label>Message *</label>
        <textarea name="content" id="message-content" rows="4" required placeholder="Type your message here..."></textarea>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary modal-cancel-btn">Cancel</button>
        <button type="button" class="btn btn-primary" id="send-message-submit-btn">Send</button>
      </div>
    </form>
  `;
  showModal('Send Message', content);
  
  // Attach event listener after modal is shown
  setTimeout(() => {
    const form = document.getElementById('send-message-form');
    const submitBtn = document.getElementById('send-message-submit-btn');
    
    if (form && submitBtn) {
      console.log('Form and button found, attaching event listeners');
      
      // Add click listener to submit button
      submitBtn.addEventListener('click', async (e) => {
        console.log('Submit button clicked');
        e.preventDefault();
        e.stopPropagation();
        await handleSendMessage(null, consultationIdNum);
      });
      
      // Also add form submit listener as backup
      form.addEventListener('submit', async (e) => {
        console.log('Form submitted');
        e.preventDefault();
        e.stopPropagation();
        await handleSendMessage(e, consultationIdNum);
      });
      
      console.log('Event listeners attached');
    } else {
      console.error('Form or button not found. Form:', form, 'Button:', submitBtn);
    }
  }, 300);
}

async function handleSendMessage(e, consultationId) {
  console.log('handleSendMessage called with consultationId:', consultationId);
  
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  
  if (!consultationId || isNaN(parseInt(consultationId))) {
    console.error('Invalid consultation ID:', consultationId);
    showMessage('Invalid consultation ID', 'error');
    return false;
  }

  const form = document.getElementById('send-message-form');
  if (!form) {
    console.error('Form not found');
    showMessage('Form not found', 'error');
    return false;
  }

  const formData = new FormData(form);
  const messageContent = formData.get('content')?.trim();
  
  console.log('Message content:', messageContent);
  
  if (!messageContent) {
    showMessage('Please enter a message', 'error');
    return false;
  }

  const data = {
    content: messageContent,
    content_type: 'text'
  };

  console.log('Sending message with data:', data);
  console.log('API endpoint:', `/consultations/${consultationId}/messages`);

  try {
    const result = await apiCall(`/consultations/${consultationId}/messages`, 'POST', data);
    console.log('Message sent successfully, result:', result);
    showMessage('Message sent successfully!', 'success');
    closeModal();
    // Reload consultation to show the new message
    setTimeout(() => {
      viewConsultation(consultationId);
    }, 500);
  } catch (error) {
    console.error('Error sending message:', error);
    console.error('Error details:', error.response || error.message);
    const errorMessage = error.message || error.response?.error || error.response?.details || 'Unknown error';
    showMessage('Error sending message: ' + errorMessage, 'error');
  }
  
  return false;
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
  // Check permission (if permissions are loaded)
  if (userPermissions.length > 0 && !hasPermission('delete_ngo') && currentUser?.role !== 'admin') {
    showMessage('You do not have permission to delete NGOs', 'error');
    return;
  }

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
  // Check permission (if permissions are loaded)
  if (userPermissions.length > 0 && !hasPermission('delete_user') && currentUser?.role !== 'admin') {
    showMessage('You do not have permission to delete users', 'error');
    return;
  }

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
    await apiCall(`/medical_inventory/${id}`, 'PATCH', data);
    showMessage('Item updated successfully', 'success');
    closeModal();
    loadMedicalInventory();
  } catch (error) {
    showMessage('Error updating item: ' + (error.message || 'Unknown error'), 'error');
  }
}

async function deleteInventory(id) {
  if (confirm('Are you sure you want to delete this inventory item?')) {
    try {
      await apiCall(`/medical_inventory/${id}`, 'DELETE');
      showMessage('Inventory item deleted successfully', 'success');
      loadMedicalInventory();
      loadDashboard();
    } catch (error) {
      showMessage('Error deleting inventory: ' + (error.message || 'Unknown error'), 'error');
    }
  }
}

// Edit Medical History Modal
async function showEditMedicalHistoryModal() {
  try {
    let patient = null;
    let medicalHistory = {};
    let chronicConditions = {};
    let bloodType = '';

    // Try to load existing patient data, but don't fail if it doesn't exist
    try {
      patient = await apiCall(`/patients/${currentUser.user_id}`, 'GET');
      if (patient) {
        medicalHistory = patient.medical_history || {};
        chronicConditions = patient.chronic_conditions || {};
        bloodType = patient.blood_type || '';
      }
    } catch (error) {
      // Patient doesn't exist yet, that's okay - we'll create it
      console.log('Patient not found, will create new record');
    }
    
    const content = `
      <form id="edit-medical-history-form">
        <div class="form-group">
          <label>Blood Type</label>
          <select name="blood_type">
            <option value="">Select</option>
            <option value="A+" ${bloodType === 'A+' ? 'selected' : ''}>A+</option>
            <option value="A-" ${bloodType === 'A-' ? 'selected' : ''}>A-</option>
            <option value="B+" ${bloodType === 'B+' ? 'selected' : ''}>B+</option>
            <option value="B-" ${bloodType === 'B-' ? 'selected' : ''}>B-</option>
            <option value="AB+" ${bloodType === 'AB+' ? 'selected' : ''}>AB+</option>
            <option value="AB-" ${bloodType === 'AB-' ? 'selected' : ''}>AB-</option>
            <option value="O+" ${bloodType === 'O+' ? 'selected' : ''}>O+</option>
            <option value="O-" ${bloodType === 'O-' ? 'selected' : ''}>O-</option>
          </select>
        </div>
        <div class="form-group">
          <label>Medical History (JSON format)</label>
          <textarea name="medical_history" rows="6" placeholder='{"allergies": "None", "surgeries": "None", "medications": "None"}'>${Object.keys(medicalHistory).length > 0 ? JSON.stringify(medicalHistory, null, 2) : ''}</textarea>
          <small style="color: #666; font-size: 0.85em;">Enter medical history as JSON object. Example: {"allergies": "Peanuts", "surgeries": "Appendectomy 2020", "medications": "Aspirin"}</small>
        </div>
        <div class="form-group">
          <label>Chronic Conditions (JSON format)</label>
          <textarea name="chronic_conditions" rows="6" placeholder='{"diabetes": false, "hypertension": false, "asthma": false}'>${Object.keys(chronicConditions).length > 0 ? JSON.stringify(chronicConditions, null, 2) : ''}</textarea>
          <small style="color: #666; font-size: 0.85em;">Enter chronic conditions as JSON object. Example: {"diabetes": true, "hypertension": false, "asthma": true}</small>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">Save</button>
        </div>
      </form>
    `;
    showModal('Edit Medical History', content);
    
    // Attach event listener after modal is shown
    setTimeout(() => {
      const form = document.getElementById('edit-medical-history-form');
      if (form) {
        // Remove any existing listeners
        const newForm = form.cloneNode(true);
        form.parentNode.replaceChild(newForm, form);
        // Add new listener
        document.getElementById('edit-medical-history-form').addEventListener('submit', handleEditMedicalHistory);
      }
    }, 100);
  } catch (error) {
    console.error('Error in showEditMedicalHistoryModal:', error);
    showMessage('Error loading medical history form: ' + (error.message || 'Unknown error'), 'error');
  }
}

async function handleEditMedicalHistory(e) {
  e.preventDefault();
  e.stopPropagation();
  
  const formData = new FormData(e.target);
  
  let medicalHistory = {};
  let chronicConditions = {};
  
  // Parse medical history JSON
  try {
    const medicalHistoryStr = formData.get('medical_history');
    if (medicalHistoryStr && medicalHistoryStr.trim()) {
      medicalHistory = JSON.parse(medicalHistoryStr);
    }
  } catch (error) {
    showMessage('Invalid JSON format for medical history. Please check your JSON syntax.', 'error');
    return;
  }
  
  // Parse chronic conditions JSON
  try {
    const chronicConditionsStr = formData.get('chronic_conditions');
    if (chronicConditionsStr && chronicConditionsStr.trim()) {
      chronicConditions = JSON.parse(chronicConditionsStr);
    }
  } catch (error) {
    showMessage('Invalid JSON format for chronic conditions. Please check your JSON syntax.', 'error');
    return;
  }
  
  const data = {
    patient_id: currentUser.user_id,
    blood_type: formData.get('blood_type') || null,
    medical_history: Object.keys(medicalHistory).length > 0 ? medicalHistory : null,
    chronic_conditions: Object.keys(chronicConditions).length > 0 ? chronicConditions : null
  };

  try {
    const result = await apiCall('/patients', 'POST', data);
    showMessage('Medical history saved successfully!', 'success');
    closeModal();
    // Reload medical history after a short delay
    setTimeout(() => {
      loadMedicalHistory();
    }, 500);
  } catch (error) {
    console.error('Error updating medical history:', error);
    showMessage('Error saving medical history: ' + (error.message || 'Unknown error'), 'error');
  }
  
  return false;
}

// Add Patient Profile Modal
function showAddPatientProfileModal() {
  const content = `
    <form id="add-patient-profile-form">
      <div class="form-group">
        <label>Goal Amount *</label>
        <input type="number" name="goal_amount" step="0.01" min="0" required placeholder="Enter goal amount in USD">
      </div>
      <div class="form-group">
        <label>Story</label>
        <textarea name="story" rows="6" placeholder="Tell your story..."></textarea>
      </div>
      <div class="form-group">
        <label>Status</label>
        <select name="status">
          <option value="active" selected>Active</option>
          <option value="completed">Completed</option>
          <option value="paused">Paused</option>
        </select>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
        <button type="submit" class="btn btn-primary">Create Profile</button>
      </div>
    </form>
  `;
  showModal('Create New Patient Profile', content);
  
  // Attach event listener after modal is shown
  setTimeout(() => {
    const form = document.getElementById('add-patient-profile-form');
    if (form) {
      form.addEventListener('submit', handleAddPatientProfile);
    }
  }, 100);
}

async function handleAddPatientProfile(e) {
  e.preventDefault();
  e.stopPropagation();
  
  const formData = new FormData(e.target);
  
  // Validate required fields
  const goalAmount = formData.get('goal_amount');
  
  if (!goalAmount) {
    showMessage('Please enter a goal amount', 'error');
    return false;
  }
  
  const data = {
    goal_amount: parseFloat(goalAmount),
    story: formData.get('story')?.trim() || null,
    status: formData.get('status') || 'active'
  };

  // Validate goal amount
  if (isNaN(data.goal_amount) || data.goal_amount <= 0) {
    showMessage('Please enter a valid goal amount greater than 0', 'error');
    return false;
  }

  try {
    const result = await apiCall(`/patients/${currentUser.user_id}/profiles`, 'POST', data);
    showMessage('Patient profile created successfully!', 'success');
    closeModal();
    // Reload data after a short delay
    setTimeout(() => {
      loadPatientProfiles();
      loadDashboard();
    }, 500);
  } catch (error) {
    console.error('Error creating patient profile:', error);
    showMessage('Error creating profile: ' + (error.message || 'Unknown error'), 'error');
  }
  
  return false;
}

// Make all functions globally available for onclick handlers
window.closeModal = closeModal;
window.showEditMedicalHistoryModal = showEditMedicalHistoryModal;
window.showAddPatientProfileModal = showAddPatientProfileModal;
window.handleEditMedicalHistory = handleEditMedicalHistory;
window.handleAddPatientProfile = handleAddPatientProfile;
window.showAddMedicalCaseModal = showAddMedicalCaseModal;
window.handleAddMedicalCase = handleAddMedicalCase;
window.showEditMedicalCaseModal = showEditMedicalCaseModal;
window.handleEditMedicalCase = handleEditMedicalCase;
window.showAddConsultationModal = showAddConsultationModal;
window.handleAddConsultation = handleAddConsultation;
window.showAddDonationModal = showAddDonationModal;
window.showAddMedicationRequestModal = showAddMedicationRequestModal;
window.handleAddMedicationRequest = handleAddMedicationRequest;
window.showAddMentalHealthSessionModal = showAddMentalHealthSessionModal;
window.handleAddMentalHealthSession = handleAddMentalHealthSession;
window.showAddSupportGroupModal = showAddSupportGroupModal;
window.handleAddSupportGroup = handleAddSupportGroup;
window.showAddNGOModal = showAddNGOModal;
window.showAddInventoryModal = showAddInventoryModal;
window.viewMedicalCase = viewMedicalCase;
window.viewConsultation = viewConsultation;
window.showSendMessageModal = showSendMessageModal;
window.handleSendMessage = handleSendMessage;
window.viewDonation = viewDonation;
window.viewMedicationRequest = viewMedicationRequest;
window.deleteMedicalCase = deleteMedicalCase;
window.deleteNGO = deleteNGO;
window.deleteUser = deleteUser;
window.deleteInventory = deleteInventory;
window.editNGO = editNGO;
window.editInventory = editInventory;
window.approveMedicationRequest = approveMedicationRequest;
window.addPermissionToRole = addPermissionToRole;
window.removePermissionFromRole = removePermissionFromRole;
window.updateProfile = updateProfile;
window.handleLogout = handleLogout;
window.toggleSidebar = toggleSidebar;
window.navigateToPage = navigateToPage;
window.toggleLanguage = toggleLanguage;
window.updateUserLanguagePreference = updateUserLanguagePreference;

// Add Case Update Modal
function showAddCaseUpdateModal(caseId = null) {
  const content = `
    <form id="add-case-update-form" onsubmit="handleAddCaseUpdate(event, ${caseId || 'null'})">
      <div class="form-group">
        <label>Medical Case ID ${caseId ? `(Current: ${caseId})` : '*'}</label>
        <input type="number" name="case_id" value="${caseId || ''}" ${caseId ? 'readonly' : 'required'} placeholder="Enter case ID">
      </div>
      <div class="form-group">
        <label>Update Title</label>
        <input type="text" name="update_title" placeholder="Brief title for this update">
      </div>
      <div class="form-group">
        <label>Update Content *</label>
        <textarea name="update_text" rows="6" required placeholder="Enter the update details..."></textarea>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
        <button type="submit" class="btn btn-primary">Add Update</button>
      </div>
    </form>
  `;
  showModal('Add Case Update', content);
}

async function handleAddCaseUpdate(e, caseId) {
  e.preventDefault();
  e.stopPropagation();
  
  const formData = new FormData(e.target);
  const case_id = caseId || parseInt(formData.get('case_id'));
  
  if (!case_id) {
    showMessage('Case ID is required', 'error');
    return false;
  }
  
  const data = {
    update_text: formData.get('update_text'),
    update_title: formData.get('update_title') || null
  };
  
  if (!data.update_text) {
    showMessage('Update content is required', 'error');
    return false;
  }
  
  try {
    await apiCall(`/medical-cases/${case_id}/updates`, 'POST', data);
    showMessage('Case update added successfully', 'success');
    closeModal();
    loadMedicalCases();
    loadDashboard();
  } catch (error) {
    showMessage('Error adding case update: ' + (error.message || 'Unknown error'), 'error');
  }
  
  return false;
}

window.showAddCaseUpdateModal = showAddCaseUpdateModal;
window.handleAddCaseUpdate = handleAddCaseUpdate;

