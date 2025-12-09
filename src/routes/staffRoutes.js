const express = require("express");
const router = express.Router();
const StaffController = require("../controllers/staffController");

const { authenticateToken, requireRole } = require("../middleware/authenticateToken");

// Get staff by NGO - Admin or Public?
router.get("/ngo/:ngoId", authenticateToken, StaffController.getStaffByNGOController);

// Get staff by User - Admin or Public?
router.get("/user/:userId", authenticateToken, StaffController.getStaffByUserController);

// Create staff - Admin only
router.post(
  "/",
  authenticateToken,
  requireRole("admin"),
  StaffController.createStaffController
);

// Get staff by ID - Admin only
router.get(
  "/:id",
  authenticateToken,
  requireRole("admin"),
  StaffController.getStaffByIdController
);

// Update staff - Admin only
router.put(
  "/:id",
  authenticateToken,
  requireRole("admin"),
  StaffController.updateStaffController
);

// Delete staff - Admin only
router.delete(
  "/:id",
  authenticateToken,
  requireRole("admin"),
  StaffController.deleteStaffController
);

// Toggle staff status - Admin only
router.patch(
  "/:id/status",
  authenticateToken,
  requireRole("admin"),
  StaffController.toggleStaffStatusController
);

module.exports = router;
