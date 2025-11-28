const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/database");
const usersDB = require("../models/users_DB");
const Response = require("../utils/responseHelper");
require("dotenv").config();



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
      return Response.error(res, "full_name, email, password, and role are required", 400);
    }

    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Response.error(res, "Invalid email format", 400);
    }

  
    if (password.length < 6) {
      return Response.error(res, "Password must be at least 6 characters", 400);
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
      return Response.error(res, "role must be one of: patient, doctor, donor, ngo, pharmacy, admin", 400);
    }

    const role_id = roleMapping[role];

  
    if (role === "doctor" && !specialization) {
      return Response.error(res, "specialization is required for doctors", 400);
    }

    if (role === "ngo" && !organization_name) {
      return Response.error(res, "organization_name is required for NGOs", 400);
    }

    
    const emailExists = await usersDB.emailCheck(email);
    if (emailExists) {
      return Response.error(res, "Email already exists", 400);
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

    // JWT
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

    return Response.success(
      res,
      {
        accessToken,
        refreshToken,
        user: {
          user_id,
          full_name,
          email,
          role,
          phone_number: phone_number || null,
          is_verified: false,
          is_active: true,
          preferred_language: preferred_language || "arabic"
        }
      },
      "User registered successfully",
      201
    );

  } catch (error) {
    await connection.rollback();
    console.error("Registration error:", error);
    return Response.error(res, "Registration failed", 500, error.message);
  } finally {
    connection.release();
  }
}



async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return Response.error(res, "Email and password are required", 400);
    }

    const [users] = await pool.query(
      `SELECT u.*, r.name AS role_name
       FROM users u
       JOIN roles r ON u.role_id = r.role_id
       WHERE u.email = ?`,
      [email]
    );

    if (users.length === 0) {
      return Response.unauthorized(res, "Invalid email or password");
    }

    const user = users[0];

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return Response.unauthorized(res, "Invalid email or password");
    }

    if (!user.is_active) {
      return Response.forbidden(res, "Account is inactive. Please contact support.");
    }

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

    return Response.success(res, {
      accessToken,
      refreshToken,
      user: {
        user_id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        role: user.role_name,
        phone_number: user.phone_number,
        date_of_birth: user.date_of_birth,
        gender: user.gender,
        profile_data: user.profile_data,
        is_verified: user.is_verified,
        is_active: user.is_active,
        preferred_language: user.preferred_language,
        created_at: user.created_at,
        updated_at: user.updated_at
      }
    }, "Login successful");

  } catch (error) {
    console.error("Login error:", error);
    return Response.error(res, "Login failed. Please try again.", 500);
  }
}



async function refreshToken(req, res) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return Response.error(res, "Refresh token is required", 400);
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const [users] = await pool.query(
      `SELECT u.*, r.name as role_name 
       FROM users u 
       JOIN roles r ON u.role_id = r.role_id 
       WHERE u.user_id = ?`,
      [decoded.user_id]
    );

    if (users.length === 0) {
      return Response.unauthorized(res, "User not found");
    }

    const user = users[0];

    if (!user.is_active) {
      return Response.forbidden(res, "Account is inactive");
    }

    const accessToken = jwt.sign(
      { user_id: user.user_id, email: user.email, role: user.role_name },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    return Response.success(
      res,
      {
        accessToken,
        user: {
          user_id: user.user_id,
          full_name: user.full_name,
          email: user.email,
          role: user.role_name
        }
      },
      "Token refreshed successfully"
    );

  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return Response.unauthorized(res, "Refresh token expired. Please login again.");
    }

    return Response.unauthorized(res, "Invalid refresh token");
  }
}



async function logoutUser(req, res) {
  return Response.success(res, null, "Logged out successfully. Please remove tokens from client.");
}


module.exports = {
  registerUser,
  loginUser,
  refreshToken,
  logoutUser
};
