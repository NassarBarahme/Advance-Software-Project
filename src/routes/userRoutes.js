const express = require("express");
const router = express.Router();
const {
  getUsers,
  getUserByIdController,
  getUserProfileController,
  updateUserController,
  deleteUserController,
  toggleUserStatus,
  verifyUserController,
  getMyProfile
} = require("../controllers/userController");

const { authenticateToken, requireRole } = require("../middleware/authenticateToken");


router.get("/me", authenticateToken, getMyProfile);


router.get("/", authenticateToken, requireRole('admin'), getUsers);

router.get("/:id", authenticateToken, getUserByIdController);


router.get("/:id/profile", authenticateToken, getUserProfileController);


router.put("/:id", authenticateToken, updateUserController);


router.patch("/:id/status", authenticateToken, requireRole('admin'), toggleUserStatus);


router.patch("/:id/verify", authenticateToken, requireRole('admin'), verifyUserController);


router.delete("/:id", authenticateToken, requireRole('admin'), deleteUserController);

module.exports = router;
