const express = require('express');
const router = express.Router();
const HealthContentController = require('../controllers/HealthContentController');
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


router.post('/', authenticateToken, requireAnyRole('admin', 'ngo'), HealthContentController.createContent);


router.get('/', HealthContentController.getAllContent);


router.get('/:content_id', HealthContentController.getContentById);


router.patch('/:content_id', authenticateToken, requireAnyRole('admin', 'ngo'), HealthContentController.updateContent);


router.delete('/:content_id', authenticateToken, requireRole('admin'), HealthContentController.deleteContent);

module.exports = router;

