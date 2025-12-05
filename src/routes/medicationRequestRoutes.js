const express = require("express");
const router = express.Router();
const { createRequest, getRequestById, updateRequest } = require("../controllers/medicationRequestController");

router.post("/", createRequest);

router.get("/:request_id", getRequestById);

router.patch("/:request_id", updateRequest);

module.exports = router;
