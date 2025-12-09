const express = require("express");
const router = express.Router();
const mentalHealthController = require("../controllers/mentalHealthController");
const { authenticateToken } = require("../middleware/authenticateToken");

// Get all sessions (for patients to see their own sessions)
router.get("/", authenticateToken, mentalHealthController.getAllSessions);
router.post("/", authenticateToken, mentalHealthController.createSession);
router.get("/:session_id", authenticateToken, mentalHealthController.getSession);
router.patch("/:session_id", authenticateToken, mentalHealthController.updateSession);

module.exports = router;
