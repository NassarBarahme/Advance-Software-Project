const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/database");
const usersDB = require("../models/users_DB");
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
      return res.status(400).json({
        error: "full_name, email, password, and role are required"
      });
    }


    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: "Invalid email format"
      });
    }

  
    if (password.length < 6) {
      return res.status(400).json({
        error: "Password must be at least 6 characters"
      });
    }

  
    const roleMapping = {
      'patient': 1,
      'doctor': 2,
      'donor': 3,
      'ngo': 4,
      'pharmacy': 5,
      'admin': 6
    };

    if (!roleMapping[role]) {
      return res.status(400).json({
        error: "role must be one of: patient, doctor, donor, ngo, pharmacy, admin"
      });
    }
    const role_id = roleMapping[role];


    if (role === 'doctor' && !specialization) {
      return res.status(400).json({
        error: "specialization is required for doctors"
      });
    }

    if (role === 'ngo' && !organization_name) {
      return res.status(400).json({
        error: "organization_name is required for NGOs"
      });
    }


    const emailExists = await usersDB.emailCheck(email);
    if (emailExists) {
      return res.status(400).json({
        error: "Email already exists"
      });
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
        preferred_language || 'arabic'
      ]
    );

    const user_id = result.insertId;

    
    if (role === 'patient') {

      await connection.query(
        "INSERT INTO patients (patient_id) VALUES (?)",
        [user_id]
      );
    } else if (role === 'doctor') {
  
      await connection.query(
        "INSERT INTO doctors (doctor_id, specialization, license_number, experience_years) VALUES (?, ?, ?, ?)",
        [user_id, specialization, license_number || null, 0]
      );
    } else if (role === 'ngo') {
  
      await connection.query(
        "INSERT INTO ngos (ngo_id, organization_name, license_number, verified) VALUES (?, ?, ?, ?)",
        [user_id, organization_name, license_number || null, false]
      );
    }

  
    await connection.commit();


    const accessToken = jwt.sign(
      {
        user_id: user_id,
        email: email,
        role: role
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    const refreshToken = jwt.sign(
      {
        user_id: user_id,
        email: email,
        role: role
      },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      accessToken,
      refreshToken,
      user: {
        user_id: user_id,
        full_name: full_name,
        email: email,
        role: role,
        phone_number: phone_number || null,
        is_verified: false,
        is_active: true,
        preferred_language: preferred_language || 'arabic'
      }
    });

  } catch (error) {

    await connection.rollback();
    console.error("Registration error:", error);
    res.status(500).json({
      error: "Registration failed",
      details: error.message
    });
  } finally {
    connection.release();
  }
}


async function loginUser(req, res) {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required"
      });
    }

    const [users] = await pool.query(
      `SELECT u.*, r.name AS role_name
    FROM users u
      JOIN roles r ON u.role_id = r.role_id
      WHERE u.email = ?`,
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        error: "Invalid email or password"
      });
    }

    const user = users[0];

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        error: "Invalid email or password"
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        error: "Account is inactive. Please contact support."
      });
    }

  
    const accessToken = jwt.sign(
      { user_id: user.user_id, email: user.email, role: user.role_name },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    const refreshToken = jwt.sign(
      { user_id: user.user_id, email: user.email, role: user.role_name },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );


    res.json({
      success: true,
      message: "Login successful",
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
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      error: "Login failed. Please try again."
    });
  }
}



async function refreshToken(req, res) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        error: "Refresh token is required"
      });
    }


    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET
    );

  
    const [users] = await pool.query(
      `SELECT u.*, r.name as role_name
      FROM users u
      JOIN roles r ON u.role_id = r.role_id
      WHERE u.user_id = ?`,
      [decoded.user_id]
    );

    if (users.length === 0) {
      return res.status(401).json({
        error: "User not found"
      });
    }

    const user = users[0];


    if (!user.is_active) {
      return res.status(403).json({
        error: "Account is inactive"
      });
    }

  
    const accessToken = jwt.sign(
      {
        user_id: user.user_id,
        email: user.email,
        role: user.role_name
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: "Token refreshed successfully",
      accessToken,
      user: {
        user_id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        role: user.role_name
      }
    });

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: "Refresh token expired. Please login again."
      });
    }
    
    console.error("Refresh token error:", error);
    res.status(401).json({
      error: "Invalid refresh token"
    });
  }
}


async function logoutUser(req, res) {

  res.json({
    success: true,
    message: "Logged out successfully. Please remove tokens from client."
  });
}


module.exports = {
  registerUser,
  loginUser,
  refreshToken,
  logoutUser
};