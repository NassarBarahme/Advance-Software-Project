const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/authenticateToken");
const { createRequest, getRequestById, updateRequest, getAllRequests } = require("../controllers/medicationRequestController");

// Get all medication requests
router.get("/", authenticateToken, getAllRequests);

router.post("/", authenticateToken, createRequest);

router.get("/:request_id", authenticateToken, getRequestById);

router.patch("/:request_id", authenticateToken, updateRequest);

module.exports = router;
