-- ================================
-- HealthPal Database
-- ================================
DROP DATABASE IF EXISTS healthpal;
CREATE DATABASE healthpal CHARACTER SET = 'utf8mb4' COLLATE = 'utf8mb4_general_ci';
USE healthpal;

-- ================================
-- ROLES & PERMISSIONS

CREATE TABLE roles (
  role_id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL UNIQUE,
  PRIMARY KEY (role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO roles (name) VALUES ('patient'), ('doctor'), ('donor'), ('ngo'), ('pharmacy'), ('admin');

CREATE TABLE permissions (
  permission_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT DEFAULT NULL,
  PRIMARY KEY (permission_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE role_permissions (
  role_id TINYINT UNSIGNED NOT NULL,
  permission_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (role_id, permission_id),
  CONSTRAINT fk_rp_role FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE,
  CONSTRAINT fk_rp_permission FOREIGN KEY (permission_id) REFERENCES permissions(permission_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ================================
-- USERS
-- ================================
CREATE TABLE users (
  user_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) DEFAULT NULL,
  phone_number VARCHAR(32) DEFAULT NULL,
  role_id TINYINT UNSIGNED NOT NULL,
  date_of_birth DATE DEFAULT NULL,
  gender ENUM('male','female','other') DEFAULT NULL,
  profile_data JSON DEFAULT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  preferred_language ENUM('arabic','english') DEFAULT 'arabic',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id),
  CONSTRAINT fk_user_role FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ================================
-- PATIENTS
-- ================================
CREATE TABLE patients (
  patient_id BIGINT UNSIGNED NOT NULL,
  medical_history JSON DEFAULT NULL,
  blood_type VARCHAR(8) DEFAULT NULL,
  chronic_conditions JSON DEFAULT NULL,
  consent_data JSON DEFAULT NULL,
  created_by BIGINT UNSIGNED DEFAULT NULL,
  PRIMARY KEY (patient_id),
  CONSTRAINT fk_patient_user FOREIGN KEY (patient_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_patient_creator FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE patient_profiles (
  profile_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  patient_id BIGINT UNSIGNED NOT NULL,
  goal_amount DECIMAL(12,2) DEFAULT NULL,
  current_amount DECIMAL(12,2) DEFAULT 0,
  story TEXT DEFAULT NULL,
  status ENUM('active','completed','paused') DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (profile_id),
  CONSTRAINT fk_profile_patient FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ================================
-- DOCTORS
-- ================================
CREATE TABLE doctors (
  doctor_id BIGINT UNSIGNED NOT NULL,
  specialization VARCHAR(255) NOT NULL,
  license_number VARCHAR(128) DEFAULT NULL,
  experience_years TINYINT UNSIGNED DEFAULT 0,
  profile_bio TEXT DEFAULT NULL,
  availability_schedule JSON DEFAULT NULL,
  created_by BIGINT UNSIGNED DEFAULT NULL,
  PRIMARY KEY (doctor_id),
  CONSTRAINT fk_doctor_user FOREIGN KEY (doctor_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_doctor_creator FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE doctor_certifications (
  cert_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  doctor_id BIGINT UNSIGNED NOT NULL,
  cert_name VARCHAR(255) NOT NULL,
  cert_type VARCHAR(100) DEFAULT NULL,
  issued_by VARCHAR(255) DEFAULT NULL,
  issue_date DATE DEFAULT NULL,
  expiry_date DATE DEFAULT NULL,
  file_path VARCHAR(512) DEFAULT NULL,
  PRIMARY KEY (cert_id),
  INDEX (doctor_id),
  CONSTRAINT fk_cert_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ================================
-- NGOS & STAFF
-- ================================
CREATE TABLE ngos (
  ngo_id BIGINT UNSIGNED NOT NULL,
  organization_name VARCHAR(255) NOT NULL,
  license_number VARCHAR(128) DEFAULT NULL,
  contact_person VARCHAR(255) DEFAULT NULL,
  verified BOOLEAN DEFAULT FALSE,
  meta JSON DEFAULT NULL,
  created_by BIGINT UNSIGNED DEFAULT NULL,
  PRIMARY KEY (ngo_id),
  CONSTRAINT fk_ngo_user FOREIGN KEY (ngo_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_ngo_creator FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE ngo_staff (
  staff_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  ngo_id BIGINT UNSIGNED NOT NULL,
  role VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (staff_id),
  CONSTRAINT fk_staff_user FOREIGN KEY (user_id) REFERENCES users(user_id),
  CONSTRAINT fk_staff_ngo FOREIGN KEY (ngo_id) REFERENCES ngos(ngo_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ================================
-- CONSULTATIONS
-- ================================
CREATE TABLE consultations (
  consultation_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  patient_id BIGINT UNSIGNED NOT NULL,
  doctor_id BIGINT UNSIGNED DEFAULT NULL,
  consultation_type ENUM('video','audio','message','in_person') NOT NULL DEFAULT 'video',
  status ENUM('pending','confirmed','in_progress','completed','cancelled','no_show') NOT NULL DEFAULT 'pending',
  scheduled_at DATETIME DEFAULT NULL,
  duration_minutes SMALLINT UNSIGNED DEFAULT NULL,
  notes TEXT DEFAULT NULL,
  low_bandwidth BOOLEAN DEFAULT FALSE,
  created_by BIGINT UNSIGNED DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (consultation_id),
  INDEX (patient_id),
  INDEX (doctor_id),
  CONSTRAINT fk_consult_patient FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_consult_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_consult_creator FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE consultation_messages (
  message_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  consultation_id BIGINT UNSIGNED NOT NULL,
  sender_id BIGINT UNSIGNED NOT NULL,
  message_text TEXT NOT NULL,
  sent_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (message_id),
  INDEX (consultation_id),
  INDEX (sender_id),
  CONSTRAINT fk_message_consult FOREIGN KEY (consultation_id) REFERENCES consultations(consultation_id) ON DELETE CASCADE,
  CONSTRAINT fk_message_sender FOREIGN KEY (sender_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ================================
-- DONATIONS & MEDICAL CASES
-- ================================
CREATE TABLE medical_cases (
  case_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  patient_id BIGINT UNSIGNED NOT NULL,
  case_title VARCHAR(200) NOT NULL,
  case_description TEXT NOT NULL,
  medical_condition VARCHAR(100),
  treatment_type ENUM('surgery','cancer_treatment','dialysis','rehabilitation','medication','other'),
  urgency_level ENUM('low','medium','high','critical') DEFAULT 'medium',
  target_amount DECIMAL(12,2) NOT NULL,
  raised_amount DECIMAL(12,2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'USD',
  case_status ENUM('active','funded','in_treatment','completed','cancelled') DEFAULT 'active',
  verification_status ENUM('pending','verified','rejected') DEFAULT 'pending',
  verified_by BIGINT UNSIGNED,
  medical_documents JSON,
  case_images JSON,
  hospital_name VARCHAR(200),
  doctor_name VARCHAR(100),
  estimated_treatment_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (case_id),
  CONSTRAINT fk_case_patient FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
  CONSTRAINT fk_case_verified_by FOREIGN KEY (verified_by) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE donations (
  donation_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  donor_id BIGINT UNSIGNED NOT NULL,
  medical_case_id BIGINT UNSIGNED NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  donation_type ENUM('one_time','recurring') DEFAULT 'one_time',
  payment_method VARCHAR(50),
  transaction_id VARCHAR(100),
  payment_status ENUM('pending','completed','failed','refunded') DEFAULT 'pending',
  is_anonymous BOOLEAN DEFAULT FALSE,
  donor_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (donation_id),
  CONSTRAINT fk_donation_donor FOREIGN KEY (donor_id) REFERENCES users(user_id),
  CONSTRAINT fk_donation_case FOREIGN KEY (medical_case_id) REFERENCES medical_cases(case_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE case_updates (
  update_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  medical_case_id BIGINT UNSIGNED NOT NULL,
  update_title VARCHAR(200),
  update_content TEXT NOT NULL,
  update_images JSON,
  receipts JSON,
  created_by BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (update_id),
  CONSTRAINT fk_update_case FOREIGN KEY (medical_case_id) REFERENCES medical_cases(case_id),
  CONSTRAINT fk_update_user FOREIGN KEY (created_by) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ================================
-- MEDICATION & EQUIPMENT
-- ================================
CREATE TABLE medical_inventory (
  inventory_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  provider_id BIGINT UNSIGNED NOT NULL,
  item_type ENUM('medication','equipment','supplies') NOT NULL,
  item_name VARCHAR(200) NOT NULL,
  description TEXT,
  quantity_available INT NOT NULL,
  expiry_date DATE,
  condition_status ENUM('new','good','fair','poor') DEFAULT 'good',
  location VARCHAR(200),
  availability_status ENUM('available','reserved','distributed') DEFAULT 'available',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (inventory_id),
  CONSTRAINT fk_inventory_provider FOREIGN KEY (provider_id) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE medication_requests (
  request_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  patient_id BIGINT UNSIGNED NOT NULL,
  medication_name VARCHAR(200) NOT NULL,
  dosage VARCHAR(100),
  quantity_needed INT,
  urgency_level ENUM('low','medium','high','critical') DEFAULT 'medium',
  prescription_image_url VARCHAR(500),
  medical_condition VARCHAR(100),
  request_status ENUM('open','matched','fulfilled','cancelled') DEFAULT 'open',
  delivery_address TEXT,
  special_instructions TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (request_id),
  CONSTRAINT fk_med_request_patient FOREIGN KEY (patient_id) REFERENCES patients(patient_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE delivery_matches (
  match_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  request_id BIGINT UNSIGNED NOT NULL,
  inventory_id BIGINT UNSIGNED NOT NULL,
  volunteer_id BIGINT UNSIGNED,
  match_status ENUM('matched','in_transit','delivered','cancelled') DEFAULT 'matched',
  delivery_date DATE,
  delivery_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (match_id),
  CONSTRAINT fk_match_request FOREIGN KEY (request_id) REFERENCES medication_requests(request_id),
  CONSTRAINT fk_match_inventory FOREIGN KEY (inventory_id) REFERENCES medical_inventory(inventory_id),
  CONSTRAINT fk_match_volunteer FOREIGN KEY (volunteer_id) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ================================
-- MENTAL HEALTH & SUPPORT
-- ================================
CREATE TABLE mental_health_sessions (
  session_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  patient_id BIGINT UNSIGNED NOT NULL,
  counselor_id BIGINT UNSIGNED,
  session_type ENUM('individual','group','anonymous_chat','support_group') NOT NULL,
  session_status ENUM('scheduled','in_progress','completed','cancelled') DEFAULT 'scheduled',
  scheduled_datetime DATETIME,
  duration_minutes INT DEFAULT 60,
  session_notes TEXT,
  is_anonymous BOOLEAN DEFAULT FALSE,
  trauma_type ENUM('war','loss','chronic_illness','disability','other'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (session_id),
  CONSTRAINT fk_session_patient FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
  CONSTRAINT fk_session_counselor FOREIGN KEY (counselor_id) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE support_groups (
  group_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  group_name VARCHAR(200) NOT NULL,
  group_type ENUM('ptsd','grief','chronic_illness','disability','general') NOT NULL,
  description TEXT,
  moderator_id BIGINT UNSIGNED NOT NULL,
  max_members INT DEFAULT 20,
  current_members INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  meeting_schedule VARCHAR(200),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (group_id),
  CONSTRAINT fk_group_moderator FOREIGN KEY (moderator_id) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ================================
-- HEALTH CONTENT & ALERTS
-- ================================
CREATE TABLE health_content (
  content_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  title VARCHAR(200) NOT NULL,
  content_type ENUM('article','video','infographic','guide','webinar') NOT NULL,
  category ENUM('first_aid','chronic_illness','nutrition','maternal_care','mental_health','prevention'),
  content_text TEXT,
  content_url VARCHAR(500),
  language ENUM('arabic','english','both') DEFAULT 'arabic',
  target_audience ENUM('general','patients','caregivers','children') DEFAULT 'general',
  is_published BOOLEAN DEFAULT FALSE,
  view_count INT DEFAULT 0,
  created_by BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (content_id),
  CONSTRAINT fk_content_creator FOREIGN KEY (created_by) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE health_alerts (
  alert_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  alert_title VARCHAR(200) NOT NULL,
  alert_content TEXT NOT NULL,
  alert_type ENUM('outbreak','air_quality','emergency','prevention','general') NOT NULL,
  severity_level ENUM('info','warning','urgent','critical') DEFAULT 'info',
  affected_areas JSON,
  is_active BOOLEAN DEFAULT TRUE,
  expires_at DATETIME,
  created_by BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (alert_id),
  CONSTRAINT fk_alert_creator FOREIGN KEY (created_by) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;



CREATE TABLE notifications (
  notification_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  notification_type ENUM('appointment','donation','case_update','mission','alert','system') NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  action_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (notification_id),
  CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE file_uploads (
  file_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_type VARCHAR(100),
  file_size INT,
  upload_purpose ENUM('profile_image','medical_document','case_image','prescription','other'),
  related_entity_type VARCHAR(50),
  related_entity_id BIGINT UNSIGNED,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (file_id),
  CONSTRAINT fk_file_user FOREIGN KEY (user_id) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE api_logs (
  log_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  endpoint VARCHAR(255),
  method ENUM('GET','POST','PUT','PATCH','DELETE'),
  request_payload JSON,
  response_payload JSON,
  response_status INT,
  user_id BIGINT UNSIGNED DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (log_id),
  CONSTRAINT fk_log_user FOREIGN KEY (user_id) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;