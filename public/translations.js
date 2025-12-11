// Translation System
const translations = {
  arabic: {
    // Navigation
    dashboard: 'لوحة التحكم',
    profile: 'الملف الشخصي',
    medicalHistory: 'السجل الطبي',
    medicalCases: 'الحالات الطبية',
    consultations: 'الاستشارات',
    donations: 'التبرعات',
    medicationRequests: 'طلبات الأدوية',
    mentalHealth: 'الصحة النفسية',
    supportGroups: 'مجموعات الدعم',
    ngos: 'المنظمات',
    inventory: 'المخزون الطبي',
    users: 'المستخدمون',
    patientProfiles: 'ملفات المرضى',
    healthContent: 'المحتوى الصحي',
    healthAlerts: 'التنبيهات الصحية',
    systemSettings: 'إعدادات النظام',
    logout: 'تسجيل الخروج',
    
    // Menu Sections
    mainMenu: 'القائمة الرئيسية',
    patient: 'المريض',
    doctor: 'الطبيب',
    donor: 'المتبرع',
    ngo: 'المنظمة',
    pharmacy: 'الصيدلية',
    admin: 'المدير',
    allCases: 'جميع الحالات',
    myProfiles: 'ملفاتي',
    
    // Dashboard
    welcome: 'مرحباً بك في HealthPal',
    welcomeSubtitle: 'منصة الرعاية الصحية الشاملة',
    quickActions: 'الإجراءات السريعة',
    stats: 'الإحصائيات',
    
    // Common
    save: 'حفظ',
    cancel: 'إلغاء',
    close: 'إغلاق',
    delete: 'حذف',
    edit: 'تعديل',
    view: 'عرض',
    add: 'إضافة',
    create: 'إنشاء',
    update: 'تحديث',
    search: 'بحث',
    filter: 'تصفية',
    loading: 'جاري التحميل...',
    noData: 'لا توجد بيانات',
    error: 'خطأ',
    success: 'نجح',
    confirm: 'تأكيد',
    yes: 'نعم',
    no: 'لا',
    
    // Profile
    fullName: 'الاسم الكامل',
    email: 'البريد الإلكتروني',
    phoneNumber: 'رقم الهاتف',
    dateOfBirth: 'تاريخ الميلاد',
    gender: 'الجنس',
    male: 'ذكر',
    female: 'أنثى',
    other: 'أخرى',
    preferredLanguage: 'اللغة المفضلة',
    saveChanges: 'حفظ التغييرات',
    
    // Medical Cases
    caseTitle: 'عنوان الحالة',
    caseDescription: 'وصف الحالة',
    targetAmount: 'المبلغ المستهدف',
    medicalCondition: 'الحالة الطبية',
    status: 'الحالة',
    active: 'نشط',
    inTreatment: 'قيد العلاج',
    funded: 'تم التمويل',
    completed: 'مكتمل',
    cancelled: 'ملغى',
    addMedicalCase: 'إضافة حالة طبية جديدة',
    editMedicalCase: 'تعديل الحالة الطبية',
    
    // Consultations
    consultationType: 'نوع الاستشارة',
    videoCall: 'مكالمة فيديو',
    audioCall: 'مكالمة صوتية',
    message: 'رسالة',
    inPerson: 'شخصياً',
    newConsultation: 'استشارة جديدة',
    myConsultations: 'استشاراتي',
    sendMessage: 'إرسال رسالة',
    messagePlaceholder: 'اكتب رسالتك هنا...',
    
    // Messages
    messages: 'الرسائل',
    noMessages: 'لا توجد رسائل بعد',
    
    // Doctor specific
    specialization: 'التخصص',
    licenseNumber: 'رقم الترخيص',
    experienceYears: 'سنوات الخبرة',
    profileBio: 'نبذة عن الطبيب',
    availabilitySchedule: 'جدول التوفر',
    
    // Status
    pending: 'معلق',
    confirmed: 'مؤكد',
    inProgress: 'قيد التنفيذ',
    noShow: 'لم يحضر',
    
    // Actions
    addCaseUpdate: 'إضافة تحديث للحالة',
    viewAllConsultations: 'عرض جميع الاستشارات',
    
    // Quick Actions
    medicalHistory: 'السجل الطبي',
    addMedicalCase: 'إضافة حالة طبية',
    createProfile: 'إنشاء ملف',
    newConsultation: 'استشارة جديدة',
    requestMedication: 'طلب دواء',
    mentalHealthSession: 'جلسة صحة نفسية',
    healthContent: 'المحتوى الصحي',
    healthAlerts: 'التنبيهات الصحية',
    medicalCases: 'الحالات الطبية',
    newDonation: 'تبرع جديد',
    medicationRequests: 'طلبات الأدوية',
    medicalInventory: 'المخزون الطبي',
    
    // Action Descriptions
    viewEditMedicalHistory: 'عرض وتعديل السجل الطبي',
    createNewMedicalCase: 'إنشاء حالة طبية جديدة',
    createNewPatientProfile: 'إنشاء ملف مريض جديد',
    requestConsultationFromDoctor: 'طلب استشارة من طبيب',
    requestMedicationFromPharmacy: 'طلب دواء من الصيدلية',
    bookMentalHealthSession: 'حجز جلسة صحة نفسية',
    browseHealthInformation: 'تصفح المعلومات الصحية',
    viewHealthAlerts: 'عرض التنبيهات الصحية',
    createNewConsultation: 'إنشاء استشارة جديدة',
    viewManageMedicalCases: 'عرض وإدارة الحالات الطبية',
    makeDonation: 'تقديم تبرع',
    viewCasesNeedingDonations: 'عرض الحالات التي تحتاج تبرعات',
    viewMedicationRequests: 'عرض طلبات الأدوية',
    manageMedicalInventory: 'إدارة المخزون الطبي',
    manageUsers: 'إدارة المستخدمين',
    manageNGOs: 'إدارة المنظمات',
    
    // Confirmations
    confirmLogout: 'هل أنت متأكد من تسجيل الخروج؟',
    confirmDelete: 'هل أنت متأكد من الحذف؟',
    
    // Errors
    errorLoading: 'خطأ في التحميل',
    errorSaving: 'خطأ في الحفظ',
    errorDeleting: 'خطأ في الحذف',
    requiredField: 'هذا الحقل مطلوب',
    invalidData: 'بيانات غير صحيحة',
    
    // Success
    savedSuccessfully: 'تم الحفظ بنجاح',
    deletedSuccessfully: 'تم الحذف بنجاح',
    updatedSuccessfully: 'تم التحديث بنجاح',
    createdSuccessfully: 'تم الإنشاء بنجاح',
    messageSent: 'تم إرسال الرسالة بنجاح',
    
    // Form Labels
    patient: 'المريض',
    selectPatient: 'اختر مريضاً...',
    enterPatientId: 'أدخل رقم المريض',
    caseTitlePlaceholder: 'مثال: تمويل عملية القلب',
    caseDescriptionPlaceholder: 'اوصف الحالة الطبية وسبب الحاجة للتمويل...',
    targetAmountPlaceholder: '0.00',
    medicalConditionPlaceholder: 'مثال: أمراض القلب، السرطان، إلخ.',
    
    // Messages
    pleaseFillAllFields: 'يرجى ملء جميع الحقول المطلوبة',
    enterValidAmount: 'يرجى إدخال مبلغ صحيح أكبر من 0',
    enterValidPatientId: 'يرجى إدخال رقم مريض صحيح',
    profileUpdatedSuccessfully: 'تم تحديث الملف الشخصي بنجاح!',
    medicalCaseCreatedSuccessfully: 'تم إنشاء الحالة الطبية بنجاح!',
    medicalCaseUpdatedSuccessfully: 'تم تحديث الحالة الطبية بنجاح!'
  },
  
  english: {
    // Navigation
    dashboard: 'Dashboard',
    profile: 'Profile',
    medicalHistory: 'Medical History',
    medicalCases: 'Medical Cases',
    consultations: 'Consultations',
    donations: 'Donations',
    medicationRequests: 'Medication Requests',
    mentalHealth: 'Mental Health',
    supportGroups: 'Support Groups',
    ngos: 'NGOs',
    inventory: 'Medical Inventory',
    users: 'Users',
    patientProfiles: 'Patient Profiles',
    healthContent: 'Health Content',
    healthAlerts: 'Health Alerts',
    systemSettings: 'System Settings',
    logout: 'Logout',
    
    // Menu Sections
    mainMenu: 'Main Menu',
    patient: 'Patient',
    doctor: 'Doctor',
    donor: 'Donor',
    ngo: 'NGO',
    pharmacy: 'Pharmacy',
    admin: 'Admin',
    allCases: 'All Cases',
    myProfiles: 'My Profiles',
    
    // Dashboard
    welcome: 'Welcome to HealthPal',
    welcomeSubtitle: 'Comprehensive Healthcare Platform',
    quickActions: 'Quick Actions',
    stats: 'Statistics',
    
    // Common
    save: 'Save',
    cancel: 'Cancel',
    close: 'Close',
    delete: 'Delete',
    edit: 'Edit',
    view: 'View',
    add: 'Add',
    create: 'Create',
    update: 'Update',
    search: 'Search',
    filter: 'Filter',
    loading: 'Loading...',
    noData: 'No data available',
    error: 'Error',
    success: 'Success',
    confirm: 'Confirm',
    yes: 'Yes',
    no: 'No',
    
    // Profile
    fullName: 'Full Name',
    email: 'Email',
    phoneNumber: 'Phone Number',
    dateOfBirth: 'Date of Birth',
    gender: 'Gender',
    male: 'Male',
    female: 'Female',
    other: 'Other',
    preferredLanguage: 'Preferred Language',
    saveChanges: 'Save Changes',
    
    // Medical Cases
    caseTitle: 'Case Title',
    caseDescription: 'Case Description',
    targetAmount: 'Target Amount',
    medicalCondition: 'Medical Condition',
    status: 'Status',
    active: 'Active',
    inTreatment: 'In Treatment',
    funded: 'Funded',
    completed: 'Completed',
    cancelled: 'Cancelled',
    addMedicalCase: 'Add Medical Case',
    editMedicalCase: 'Edit Medical Case',
    
    // Consultations
    consultationType: 'Consultation Type',
    videoCall: 'Video Call',
    audioCall: 'Audio Call',
    message: 'Message',
    inPerson: 'In Person',
    newConsultation: 'New Consultation',
    myConsultations: 'My Consultations',
    sendMessage: 'Send Message',
    messagePlaceholder: 'Type your message here...',
    
    // Messages
    messages: 'Messages',
    noMessages: 'No messages yet',
    
    // Doctor specific
    specialization: 'Specialization',
    licenseNumber: 'License Number',
    experienceYears: 'Experience (Years)',
    profileBio: 'Profile Bio',
    availabilitySchedule: 'Availability Schedule',
    
    // Status
    pending: 'Pending',
    confirmed: 'Confirmed',
    inProgress: 'In Progress',
    noShow: 'No Show',
    
    // Actions
    addCaseUpdate: 'Add Case Update',
    viewAllConsultations: 'View all consultations',
    
    // Quick Actions
    medicalHistory: 'Medical History',
    addMedicalCase: 'Add Medical Case',
    createProfile: 'Create Profile',
    newConsultation: 'New Consultation',
    requestMedication: 'Request Medication',
    mentalHealthSession: 'Mental Health Session',
    healthContent: 'Health Content',
    healthAlerts: 'Health Alerts',
    myConsultations: 'My Consultations',
    medicalCases: 'Medical Cases',
    newDonation: 'New Donation',
    medicationRequests: 'Medication Requests',
    medicalInventory: 'Medical Inventory',
    systemSettings: 'System Settings',
    
    // Action Descriptions
    viewEditMedicalHistory: 'View and edit your medical history',
    createNewMedicalCase: 'Create a new medical case',
    createNewPatientProfile: 'Create a new patient profile',
    requestConsultationFromDoctor: 'Request a consultation from a doctor',
    requestMedicationFromPharmacy: 'Request medication from pharmacy',
    bookMentalHealthSession: 'Book a mental health session',
    browseHealthInformation: 'Browse health information',
    viewHealthAlerts: 'View health alerts',
    createNewConsultation: 'Create a new consultation',
    viewManageMedicalCases: 'View and manage medical cases',
    makeDonation: 'Make a donation',
    viewCasesNeedingDonations: 'View cases needing donations',
    viewMedicationRequests: 'View medication requests',
    manageMedicalInventory: 'Manage medical inventory',
    manageUsers: 'Manage users',
    manageNGOs: 'Manage NGOs',
    
    // Confirmations
    confirmLogout: 'Are you sure you want to logout?',
    confirmDelete: 'Are you sure you want to delete?',
    
    // Errors
    errorLoading: 'Error loading data',
    errorSaving: 'Error saving data',
    errorDeleting: 'Error deleting data',
    requiredField: 'This field is required',
    invalidData: 'Invalid data',
    
    // Success
    savedSuccessfully: 'Saved successfully',
    deletedSuccessfully: 'Deleted successfully',
    updatedSuccessfully: 'Updated successfully',
    createdSuccessfully: 'Created successfully',
    messageSent: 'Message sent successfully',
    
    // Form Labels
    patient: 'Patient',
    selectPatient: 'Select a patient...',
    enterPatientId: 'Enter patient ID',
    caseTitlePlaceholder: 'e.g., Heart Surgery Fund',
    caseDescriptionPlaceholder: 'Describe the medical case and why funding is needed...',
    targetAmountPlaceholder: '0.00',
    medicalConditionPlaceholder: 'e.g., Heart Disease, Cancer, etc.',
    
    // Messages
    pleaseFillAllFields: 'Please fill in all required fields',
    enterValidAmount: 'Please enter a valid target amount greater than 0',
    enterValidPatientId: 'Please enter a valid patient ID',
    profileUpdatedSuccessfully: 'Profile updated successfully!',
    medicalCaseCreatedSuccessfully: 'Medical case created successfully!',
    medicalCaseUpdatedSuccessfully: 'Medical case updated successfully!'
  }
};

// Current language
let currentLanguage = 'arabic'; // Default to Arabic

// Get translation
function t(key, params = {}) {
  let translation = translations[currentLanguage][key] || translations.english[key] || key;
  
  // Replace parameters
  Object.keys(params).forEach(param => {
    translation = translation.replace(`{${param}}`, params[param]);
  });
  
  return translation;
}

// Set language
function setLanguage(lang) {
  if (translations[lang]) {
    currentLanguage = lang;
    localStorage.setItem('preferredLanguage', lang);
    applyTranslations();
    return true;
  }
  return false;
}

// Get current language
function getCurrentLanguage() {
  return currentLanguage;
}

// Initialize language from user preference
function initLanguage() {
  // Try to get from user data first (from dashboard.js)
  let userLang = null;
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      userLang = user.preferred_language;
    }
  } catch (e) {
    console.error('Error parsing user data:', e);
  }
  
  if (userLang && translations[userLang]) {
    currentLanguage = userLang;
  } else {
    // Fallback to localStorage
    const savedLang = localStorage.getItem('preferredLanguage');
    if (savedLang && translations[savedLang]) {
      currentLanguage = savedLang;
    }
  }
  
  // Apply RTL/LTR direction
  applyLanguageDirection();
  applyTranslations();
}

// Apply language direction
function applyLanguageDirection() {
  const html = document.documentElement;
  if (currentLanguage === 'arabic') {
    html.setAttribute('dir', 'rtl');
    html.setAttribute('lang', 'ar');
  } else {
    html.setAttribute('dir', 'ltr');
    html.setAttribute('lang', 'en');
  }
}

// Apply translations to the page
function applyTranslations() {
  // Map page IDs to translation keys
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
  
  // Update page title
  const pageTitle = document.getElementById('page-title');
  if (pageTitle) {
    const currentPage = document.querySelector('.page.active');
    if (currentPage) {
      const pageId = currentPage.id.replace('page-', '');
      const translationKey = pageKeyMap[pageId] || pageId;
      pageTitle.textContent = t(translationKey) || t('dashboard');
    }
  }
  
  // Update navigation items
  document.querySelectorAll('[data-page]').forEach(item => {
    const pageId = item.getAttribute('data-page');
    const textElement = item.querySelector('span:not(.nav-icon)');
    if (textElement && pageId) {
      // Handle special cases
      let translationKey = pageKeyMap[pageId] || pageId;
      const currentText = textElement.textContent.trim();
      if (currentText === 'My Profiles' || currentText === 'ملفاتي') {
        translationKey = 'myProfiles';
      } else if (currentText === 'All Cases' || currentText === 'جميع الحالات') {
        translationKey = 'allCases';
      }
      textElement.textContent = t(translationKey);
    }
  });
  
  // Update menu section titles
  document.querySelectorAll('.nav-section-title').forEach(title => {
    const titleText = title.textContent.trim();
    let translationKey = null;
    
    if (titleText === 'Main Menu' || titleText === 'القائمة الرئيسية') {
      translationKey = 'mainMenu';
    } else if (titleText === 'Patient' || titleText === 'المريض') {
      translationKey = 'patient';
    } else if (titleText === 'Doctor' || titleText === 'الطبيب') {
      translationKey = 'doctor';
    } else if (titleText === 'Donor' || titleText === 'المتبرع') {
      translationKey = 'donor';
    } else if (titleText === 'NGO' || titleText === 'المنظمة') {
      translationKey = 'ngo';
    } else if (titleText === 'Pharmacy' || titleText === 'الصيدلية') {
      translationKey = 'pharmacy';
    } else if (titleText === 'Admin' || titleText === 'المدير') {
      translationKey = 'admin';
    }
    
    if (translationKey) {
      title.textContent = t(translationKey);
    }
  });
  
  // Update logout button
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    const logoutText = logoutBtn.querySelector('span:not(.nav-icon)');
    if (logoutText) {
      logoutText.textContent = t('logout');
    }
  }
  
  // Update welcome section
  const welcomeSection = document.querySelector('.welcome-section h2');
  if (welcomeSection) {
    welcomeSection.textContent = t('welcome');
  }
  
  const welcomeSubtitle = document.querySelector('.welcome-section p');
  if (welcomeSubtitle) {
    welcomeSubtitle.textContent = t('welcomeSubtitle');
  }
  
  // Update quick actions title
  const quickActionsTitle = document.querySelector('.quick-actions h3');
  if (quickActionsTitle) {
    quickActionsTitle.textContent = t('quickActions');
  }
  
  // Update page headers
  document.querySelectorAll('.page-header h2').forEach(header => {
    const page = header.closest('.page');
    if (page) {
      const pageId = page.id.replace('page-', '');
      const translationKey = pageKeyMap[pageId] || pageId;
      header.textContent = t(translationKey);
    }
  });
  
  // Trigger custom event for dynamic content
  document.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: currentLanguage } }));
}

// Update user's preferred language in the database
async function updateUserLanguagePreference(lang) {
  if (!currentUser || !currentUser.user_id) return;
  try {
    await apiCall(`/users/${currentUser.user_id}`, 'PUT', { preferred_language: lang });
    console.log('User language preference updated in DB:', lang);
    // Update currentUser object
    currentUser.preferred_language = lang;
    localStorage.setItem('user', JSON.stringify(currentUser));
  } catch (error) {
    console.error('Error updating user language preference:', error);
  }
}

// Make functions globally available
window.t = t;
window.setLanguage = setLanguage;
window.getCurrentLanguage = getCurrentLanguage;
window.initLanguage = initLanguage;
window.applyTranslations = applyTranslations;
window.translations = translations;
window.updateUserLanguagePreference = updateUserLanguagePreference;

