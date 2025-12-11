const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/database");
const usersDB = require("../models/users_DB");
const { sendOTP, validateEmail } = require("../utils/externalApi");
require("dotenv").config();

/* ============================
   REGISTER USER
============================ */
async function registerUser(req, res) {
  const connection = await pool.getConnection();
  try {
    const {
      full_name,
      email,
      password,
      role,
      phone_number,
      date_of_birth,
      gender,
      preferred_language,
      specialization,
      license_number,
      organization_name
    } = req.body;

    if (!full_name || !email || !password || !role) {
      return res.status(400).json({ error: "full_name, email, password, and role are required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const roleMapping = {
      patient: 1,
      doctor: 2,
      donor: 3,
      ngo: 4,
      pharmacy: 5,
      admin: 6
    };

    if (!roleMapping[role]) {
      return res.status(400).json({ error: "Invalid role" });
    }

    const role_id = roleMapping[role];

    if (role === "doctor" && !specialization) {
      return res.status(400).json({ error: "specialization is required for doctors" });
    }

    if (role === "ngo" && !organization_name) {
      return res.status(400).json({ error: "organization_name is required for NGOs" });
    }

    const emailExists = await usersDB.emailCheck(email);
    if (emailExists) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await connection.beginTransaction();

    const [result] = await connection.query(
      `INSERT INTO users
      (full_name, email, password_hash, role_id, phone_number, date_of_birth, gender, preferred_language, is_verified, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, FALSE, TRUE)`,
      [
        full_name,
        email,
        hashedPassword,
        role_id,
        phone_number || null,
        date_of_birth || null,
        gender || null,
        preferred_language || "arabic"
      ]
    );

    const user_id = result.insertId;

    if (role === "patient") {
      await connection.query("INSERT INTO patients (patient_id) VALUES (?)", [user_id]);
    } else if (role === "doctor") {
      await connection.query(
        "INSERT INTO doctors (doctor_id, specialization, license_number, experience_years) VALUES (?, ?, ?, ?)",
        [user_id, specialization, license_number || null, 0]
      );
    } else if (role === "ngo") {
      await connection.query(
        "INSERT INTO ngos (ngo_id, organization_name, license_number, verified) VALUES (?, ?, ?, ?)",
        [user_id, organization_name, license_number || null, false]
      );
    }

    await connection.commit();

    const accessToken = jwt.sign(
      { user_id, email, role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    const refreshToken = jwt.sign(
      { user_id, email, role },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      accessToken,
      refreshToken,
      user: { user_id, full_name, email, role }
    });

  } catch (error) {
    await connection.rollback();
    console.error("Registration error:", error);
    res.status(500).json({ error: "Registration failed" });
  } finally {
    connection.release();
  }
}

/* ============================
   LOGIN USER
============================ */
async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: "Email and password are required" });

    const [users] = await pool.query(
      `SELECT u.*, r.name AS role_name
       FROM users u
       JOIN roles r ON u.role_id = r.role_id
       WHERE u.email = ?`,
      [email]
    );

    if (users.length === 0)
      return res.status(401).json({ error: "Invalid email or password" });

    const user = users[0];
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword)
      return res.status(401).json({ error: "Invalid email or password" });

    const accessToken = jwt.sign(
      { user_id: user.user_id, email: user.email, role: user.role_name },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    const refreshToken = jwt.sign(
      { user_id: user.user_id, email: user.email, role: user.role_name },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "Login successful",
      accessToken,
      refreshToken,
      user
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
}

/* ============================
   LOGOUT USER
============================ */
async function logoutUser(req, res) {
  try {
    return res.json({
      success: true,
      message: "Logged out successfully"
    });
  } catch (err) {
    res.status(500).json({ error: "Logout failed" });
  }
}

/* ============================
   REFRESH TOKEN
============================ */
async function refreshTokenHandler(req, res) {
  try {
    const { refreshToken: clientToken } = req.body;

    if (!clientToken)
      return res.status(400).json({ error: "Refresh token required" });

    const decoded = jwt.verify(clientToken, process.env.JWT_REFRESH_SECRET);

    const accessToken = jwt.sign(
      {
        user_id: decoded.user_id,
        email: decoded.email,
        role: decoded.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      success: true,
      accessToken
    });

  } catch (err) {
    console.error("Refresh token error:", err);
    res.status(401).json({ error: "Invalid refresh token" });
  }
}

/* ============================
   FORGOT PASSWORD → SEND OTP
============================ */
async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    if (!email)
      return res.status(400).json({ error: "Email is required" });

    await sendOTP(email);

    return res.status(200).json({
      success: true,
      message: "If this email exists, an OTP has been sent."
    });

  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ error: "Failed to process request" });
  }
}

/* ============================
   VERIFY OTP
============================ */
async function verifyOtp(req, res) {
  try {
    const { email, otp } = req.body;

    if (!email || !otp)
      return res.status(400).json({ error: "Email and OTP are required" });

    const [rows] = await pool.query(
      "SELECT * FROM password_resets WHERE email = ? ORDER BY id DESC LIMIT 1",
      [email]
    );

    if (rows.length === 0)
      return res.status(400).json({ error: "OTP not found" });

    const record = rows[0];

    if (record.otp_code !== otp)
      return res.status(400).json({ error: "Invalid OTP" });

    if (new Date(record.expires_at) < new Date())
      return res.status(400).json({ error: "OTP expired" });

    res.json({ success: true, message: "OTP verified successfully" });

  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ error: "Failed to verify OTP" });
  }
}

/* ============================
   RESET PASSWORD
============================ */
async function resetPassword(req, res) {
  try {
    const { email, new_password } = req.body;

    if (!email || !new_password)
      return res.status(400).json({ error: "Email and new password are required" });

    const hashed = await bcrypt.hash(new_password, 10);

    await pool.query(
      "UPDATE users SET password_hash = ? WHERE email = ?",
      [hashed, email]
    );

    res.json({ success: true, message: "Password reset successfully" });

  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ error: "Failed to reset password" });
  }
}

/* ============================
   VALIDATE EMAIL WITH API
============================ */
async function validateEmailEndpoint(req, res) {
  try {
    const { email } = req.body;

    if (!email)
      return res.status(400).json({ error: "Email is required" });

    const result = await validateEmail(email);

    res.json({
      success: true,
      message: "Email validation result",
      result
    });

  } catch (error) {
    console.error("Email validation error:", error);
    res.status(500).json({ error: "Failed to validate email" });
  }
}

/* ============================
   EXPORT MODULES
============================ */
module.exports = {
  registerUser,
  loginUser,
  refreshToken: refreshTokenHandler,
  logoutUser,
  forgotPassword,
  validateEmailEndpoint,
  verifyOtp,
  resetPassword
};
