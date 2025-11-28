// routes/systemRoutes.js
const express = require("express");
const router = express.Router();
const multer = require("multer");


const {
  getNotificationsController,
  markNotificationReadController,
  getFileInfoController,
  uploadFileController,
  getApiLogsController
} = require("../controllers/systemController");

// Middleware
const { authenticateToken, requireRole } = require("../middleware/authenticateToken");

// Multer setup for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB
  }
});


router.get(
  "/notifications/:user_id",
  authenticateToken,
  getNotificationsController
);

router.patch(
  "/notifications/:notification_id/read",
  authenticateToken,
  markNotificationReadController
);

// File uploads / retrieval
 
router.get(
  "/file_uploads/:file_id",
  authenticateToken,
  getFileInfoController
);

router.post(
  "/file_uploads",
  authenticateToken,
  upload.single("file"),
  uploadFileController
);


 // Admin - API logs
 
router.get(
  "/api_logs",
  authenticateToken,
  requireRole("admin"),
  getApiLogsController
);

module.exports = router;
