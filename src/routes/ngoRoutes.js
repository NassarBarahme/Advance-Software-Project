const express = require("express");
const router = express.Router();
const NGOController = require("../controllers/ngoController");


const { authenticateToken, requireRole } = require("../middleware/authenticateToken");



// Create NGO - Admin only
router.post(
  "/",
  authenticateToken,
  requireRole("admin"),
  NGOController.createNGOController
);

// Get all NGOs - Public 
router.get("/", NGOController.getAllNGOsController);

// Search NGOs - Public
router.get("/search", NGOController.searchNGOsController);

// Get NGO by ID - Public 
router.get("/:id", NGOController.getNGOByIdController);

// Update NGO - Admin only
router.put(
  "/:id",
  authenticateToken,
  requireRole("admin"),
  NGOController.updateNGOController
);

// Delete NGO - Admin only
router.delete(
  "/:id",
  authenticateToken,
  requireRole("admin"),
  NGOController.deleteNGOController
);

module.exports = router;
