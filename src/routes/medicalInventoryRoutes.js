const express = require("express");
const router = express.Router();
const { addInventory, getInventoryById, updateInventory } = require("../controllers/medicalInventoryController");

router.post("/", addInventory);
router.get("/:inventory_id", getInventoryById);
router.patch("/:inventory_id", updateInventory);

module.exports = router;
