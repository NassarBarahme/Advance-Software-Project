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


<<<<<<< HEAD
router.get("/", authenticateToken, requireRole('admin'), getUsers);


=======
router.get("/:id", authenticateToken, getUserByIdController);// Users can view their own details; admins can view any user
>>>>>>> 59cf15acfd2d628283c8e0abc558bd3c1c2b3eea


router.get("/:id/profile", authenticateToken, getUserProfileController);// Users can view their own profile; admins can view any profile

<<<<<<< HEAD
router.get("/:id", authenticateToken, getUserByIdController);
router.put("/:id", authenticateToken, updateUserController);
=======

router.put("/:id", authenticateToken, updateUserController);// Users can update their own profile; admins can update any profile
>>>>>>> 59cf15acfd2d628283c8e0abc558bd3c1c2b3eea


router.patch("/:id/status", authenticateToken, requireRole('admin'), toggleUserStatus);// Only admins can toggle user status


router.patch("/:id/verify", authenticateToken, requireRole('admin'), verifyUserController);// Only admins can verify users


router.delete("/:id", authenticateToken, requireRole('admin'), deleteUserController);// Only admins can delete users

module.exports = router;