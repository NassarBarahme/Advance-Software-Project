const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/authenticateToken");
const { addInventory, getInventoryById, updateInventory, getAllInventory } = require("../controllers/medicalInventoryController");

// Get all inventory items
router.get("/", authenticateToken, getAllInventory);

router.post("/", authenticateToken, addInventory);
router.get("/:inventory_id", authenticateToken, getInventoryById);
router.patch("/:inventory_id", updateInventory);

module.exports = router;
