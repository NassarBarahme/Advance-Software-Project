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


router.get("/me", authenticateToken, getMyProfile);// Users can view their own profile information

router.get("/", authenticateToken, requireRole('admin'), getUsers);// Only admins can view all users


router.get("/:id", authenticateToken, getUserByIdController);// Users can view their own details; admins can view any user


router.get("/:id/profile", authenticateToken, getUserProfileController);// Users can view their own profile; admins can view any profile


router.put("/:id", authenticateToken, updateUserController);// Users can update their own profile; admins can update any profile


router.patch("/:id/status", authenticateToken, requireRole('admin'), toggleUserStatus);// Only admins can toggle user status


router.patch("/:id/verify", authenticateToken, requireRole('admin'), verifyUserController);// Only admins can verify users


router.delete("/:id", authenticateToken, requireRole('admin'), deleteUserController);// Only admins can delete users

module.exports = router;