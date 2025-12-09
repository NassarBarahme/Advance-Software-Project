const express = require('express');
const router = express.Router();
const DoctorController = require('../controllers/DoctorController');
const { authenticateToken, requireRole } = require('../middleware/authenticateToken');

const requireAnyRole = (...roles) => {
  return (req, res, next) => {
    if (req.user && roles.includes(req.user.role)) {
      next();
    } else {
      res.status(403).json({ message: "Access denied: insufficient permissions" });
    }
  };
};


router.post('/', authenticateToken, requireRole('admin'), DoctorController.createDoctor);


router.get('/', DoctorController.getAllDoctors);


router.get('/:doctor_id', DoctorController.getDoctorById);


router.patch('/:doctor_id', authenticateToken, requireAnyRole('admin', 'doctor'), DoctorController.updateDoctor);


router.delete('/:doctor_id', authenticateToken, requireRole('admin'), DoctorController.deleteDoctor);


router.get('/:doctor_id/certifications', DoctorController.getCertifications);


router.post('/:doctor_id/certifications', authenticateToken, requireAnyRole('admin', 'doctor'), DoctorController.addCertification);


router.delete('/:doctor_id/certifications/:cert_id', authenticateToken, requireAnyRole('admin', 'doctor'), DoctorController.removeCertification);

module.exports = router;

