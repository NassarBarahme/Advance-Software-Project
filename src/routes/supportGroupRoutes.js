const express = require("express");
const router = express.Router();
const supportGroupController = require("../controllers/supportGroupController");
const { authenticateToken } = require("../middleware/authenticateToken");

// Get all support groups
router.get("/", authenticateToken, supportGroupController.getAllGroups);

router.post("/", authenticateToken, supportGroupController.createGroup);

router.get("/:group_id", authenticateToken, supportGroupController.getGroup);

router.patch("/:group_id", authenticateToken, supportGroupController.updateGroup);

router.delete("/:group_id", authenticateToken, supportGroupController.deleteGroup);

module.exports = router;
