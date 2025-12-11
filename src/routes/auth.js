const express = require("express");
const router = express.Router();

const {
  loginUser,
  registerUser,
  refreshToken,
  logoutUser,
  forgotPassword,
  validateEmailEndpoint,
  verifyOtp,
  resetPassword
} = require("../controllers/authController");

router.use(express.json());

router.post("/login", loginUser);
router.post("/register", registerUser);
router.post("/refresh", refreshToken);
router.post("/logout", logoutUser);
router.post("/forgot-password", forgotPassword);
router.post("/validate-email", validateEmailEndpoint);

router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);

module.exports = router;
