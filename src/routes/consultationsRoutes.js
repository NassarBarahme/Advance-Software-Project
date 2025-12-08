// routes/consultationsRoutes.js
const express = require('express');
const router = express.Router();
const consultationsController = require('../controllers/consultationsController');
const { authenticateToken } = require("../middleware/authenticateToken");

// Apply authentication to all consultation routes
router.use(authenticateToken);

// Get all consultations (user sees their own consultations)
router.get('/', consultationsController.getAllConsultationsController);

// Get consultation details
router.get('/:id', consultationsController.getConsultationController);

// Schedule new consultation
router.post('/', consultationsController.createConsultationController);

// Update consultation
router.patch('/:id', consultationsController.updateConsultationController);

// List messages for a consultation
router.get('/:id/messages', consultationsController.listMessagesController);

// Send a message in a consultation
router.post('/:id/messages', consultationsController.sendMessageController);

module.exports = router;
