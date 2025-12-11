const nodemailer = require("nodemailer");
const pool = require("../config/database");
require("dotenv").config();

/**
 * Send OTP to user's email
 */
async function sendOTP(email) {
  try {
    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log("Generated OTP:", otp);

    // Save to DB
    await pool.query(
      `INSERT INTO password_resets (email, otp_code, expires_at)
       VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE))`,
      [email, otp]
    );

    // Create transporter INSIDE function
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP code is: ${otp}`,
    });

    return otp;

  } catch (error) {
    console.error(" ERROR sending OTP:", error);
    throw error;
  }
}

module.exports = { sendOTP };
