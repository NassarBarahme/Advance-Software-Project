const express = require("express");
const router = express.Router();
const {
  loginUser,
  registerUser,
  refreshToken,
  logoutUser,
} = require("../controllers/authController");

router.use(express.json());

router.post("/login", loginUser);// User login endpoint
router.post("/register", registerUser);// New user registration endpoint
router.post("/refresh", refreshToken);// Issue a new access token using the refresh token
router.post("/logout", logoutUser);// Invalidate the refresh token on logout

module.exports = router;