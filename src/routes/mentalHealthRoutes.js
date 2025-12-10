const express = require("express");
const router = express.Router();
const mentalHealthController = require("../controllers/mentalHealthController");

router.post("/", mentalHealthController.createSession);
router.get("/:session_id", mentalHealthController.getSession);
router.patch("/:session_id", mentalHealthController.updateSession);

module.exports = router;
