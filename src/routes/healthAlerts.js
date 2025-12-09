const express = require('express');
const router = express.Router();
const HealthAlertController = require('../controllers/HealthAlertController');
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


router.post('/', authenticateToken, requireAnyRole('admin', 'ngo'), HealthAlertController.createAlert);


router.get('/', HealthAlertController.getAllAlerts);


router.get('/:alert_id', HealthAlertController.getAlertById);


router.patch('/:alert_id', authenticateToken, requireAnyRole('admin', 'ngo'), HealthAlertController.updateAlert);


router.delete('/:alert_id', authenticateToken, requireRole('admin'), HealthAlertController.deleteAlert);

module.exports = router;

