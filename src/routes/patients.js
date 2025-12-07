const express = require('express');
const router = express.Router();
const PatientController = require('../controllers/PatientController');
const { authenticateToken, requireRole } = require('../middleware/authenticateToken');

// Helper middleware for multiple roles
const requireAnyRole = (...roles) => {
  return (req, res, next) => {
    if (req.user && roles.includes(req.user.role)) {
      next();
    } else {
      res.status(403).json({ message: "Access denied: insufficient permissions" });
    }
  };
};


router.post('/', authenticateToken, requireAnyRole('admin', 'patient'), PatientController.createPatient);


router.get('/:patient_id/profiles', PatientController.getPatientProfiles);


router.get('/:patient_id', PatientController.getPatientById);


router.patch('/:patient_id', authenticateToken, requireAnyRole('admin', 'patient'), PatientController.updatePatient);


router.delete('/:patient_id', authenticateToken, requireRole('admin'), PatientController.deletePatient);

module.exports = router;

