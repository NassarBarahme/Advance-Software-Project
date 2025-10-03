// Application Constants
module.exports = {
  // User Roles
  ROLES: {
    PATIENT: 'patient',
    DOCTOR: 'doctor',
    DONOR: 'donor',
    NGO: 'ngo',
    ADMIN: 'admin'
  },

  // Consultation Status
  CONSULTATION_STATUS: {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
  },

  // Payment/Donation Status
  PAYMENT_STATUS: {
    PENDING: 'pending',
    COMPLETED: 'completed',
    FAILED: 'failed',
    REFUNDED: 'refunded'
  },

  // Medication Request Status
  MEDICATION_STATUS: {
    REQUESTED: 'requested',
    APPROVED: 'approved',
    IN_DELIVERY: 'in_delivery',
    DELIVERED: 'delivered',
    REJECTED: 'rejected'
  },

  // Mental Health Session Status
  SESSION_STATUS: {
    SCHEDULED: 'scheduled',
    ONGOING: 'ongoing',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
  },

  // NGO Mission Status
  MISSION_STATUS: {
    PLANNED: 'planned',
    ACTIVE: 'active',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
  },

  // Verification Status
  VERIFICATION_STATUS: {
    PENDING: 'pending',
    VERIFIED: 'verified',
    REJECTED: 'rejected'
  },

  // Languages
  LANGUAGES: {
    ARABIC: 'ar',
    ENGLISH: 'en'
  }
};