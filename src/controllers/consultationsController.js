// controllers/consultationController.js
const {
  getConsultationById,
  createConsultation,
  updateConsultation,
  listMessages,
  sendMessage
} = require("../models/consultation");


async function getConsultationController(req, res) {
  try {
    const { id } = req.params;
    const consultationId = parseInt(id, 10);
    const pool = require("../config/database");

    if (isNaN(consultationId) || consultationId <= 0) {
      return res.status(400).json({ error: "Invalid consultation ID" });
    }

    // Get consultation with patient and doctor names
    const [rows] = await pool.query(
      `SELECT c.*, 
       p.full_name as patient_name,
       d.full_name as doctor_name
       FROM consultations c
       LEFT JOIN users p ON c.patient_id = p.user_id
       LEFT JOIN users d ON c.doctor_id = d.user_id
       WHERE c.consultation_id = ?`,
      [consultationId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Consultation not found" });
    }

    const consultation = rows[0];

    // Check access permissions
    if (
      req.user.role !== "admin" &&
      req.user.user_id !== consultation.patient_id &&
      req.user.user_id !== consultation.doctor_id
    ) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json({
      message: "Consultation retrieved successfully",
      consultation
    });
  } catch (error) {
    console.error("Get consultation error:", error);
    res.status(500).json({
      error: "Failed to retrieve consultation",
      details: error.message
    });
  }
}


async function createConsultationController(req, res) {
  try {
    const payload = req.body;

    
    if (!payload.patient_id && req.user.role !== "admin") {
      payload.patient_id = req.user.user_id;
    }

    payload.created_by = req.user.user_id;

    const consultation = await createConsultation(payload);

    res.status(201).json({
      message: "Consultation created successfully",
      consultation
    });
  } catch (error) {
    console.error("Create consultation error:", error);
    res.status(500).json({
      error: "Failed to create consultation",
      details: error.message
    });
  }
}


async function updateConsultationController(req, res) {
  try {
    const { id } = req.params;
    const consultationId = parseInt(id, 10);

    if (isNaN(consultationId) || consultationId <= 0) {
      return res.status(400).json({ error: "Invalid consultation ID" });
    }

    const existingConsultation = await getConsultationById(consultationId);
    if (!existingConsultation) {
      return res.status(404).json({ error: "Consultation not found" });
    }

    
    if (
      req.user.role !== "admin" &&
      req.user.user_id !== existingConsultation.doctor_id
    ) {
      return res.status(403).json({ error: "Access denied" });
    }

    const updatedConsultation = await updateConsultation(consultationId, req.body);

    res.json({
      message: "Consultation updated successfully",
      consultation: updatedConsultation
    });
  } catch (error) {
    console.error("Update consultation error:", error);
    res.status(500).json({
      error: "Failed to update consultation",
      details: error.message
    });
  }
}


async function listMessagesController(req, res) {
  try {
    const { id } = req.params;
    const consultationId = parseInt(id, 10);

    if (isNaN(consultationId) || consultationId <= 0) {
      return res.status(400).json({ error: "Invalid consultation ID" });
    }

    const consultation = await getConsultationById(consultationId);
    if (!consultation) {
      return res.status(404).json({ error: "Consultation not found" });
    }

    if (
      req.user.role !== "admin" &&
      req.user.user_id !== consultation.patient_id &&
      req.user.user_id !== consultation.doctor_id
    ) {
      return res.status(403).json({ error: "Access denied" });
    }

    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.min(100, parseInt(req.query.limit || "30", 10));
    const offset = (page - 1) * limit;

    const messages = await listMessages(consultationId, limit, offset);

    res.json({
      message: "Messages retrieved successfully",
      messages,
      meta: { total: messages.length, page, limit }
    });
  } catch (error) {
    console.error("List messages error:", error);
    res.status(500).json({
      error: "Failed to list messages",
      details: error.message
    });
  }
}


async function sendMessageController(req, res) {
  try {
    const { id } = req.params;
    const consultationId = parseInt(id, 10);

    if (isNaN(consultationId) || consultationId <= 0) {
      return res.status(400).json({ error: "Invalid consultation ID" });
    }

    const { content, content_type, metadata } = req.body;
    if (!content) {
      return res.status(400).json({ error: "content is required" });
    }

    const consultation = await getConsultationById(consultationId);
    if (!consultation) {
      return res.status(404).json({ error: "Consultation not found" });
    }

    if (
      req.user.role !== "admin" &&
      req.user.user_id !== consultation.patient_id &&
      req.user.user_id !== consultation.doctor_id
    ) {
      return res.status(403).json({ error: "Access denied" });
    }

    const message = await sendMessage({
      consultation_id: consultationId,
      sender_id: req.user.user_id,
      sender_role: req.user.role,
      content,
      content_type,
      metadata
    });

    res.status(201).json({
      message: "Message sent successfully",
      message_data: message
    });
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({
      error: "Failed to send message",
      details: error.message
    });
  }
}


async function getAllConsultationsController(req, res) {
  try {
    const userId = req.user.user_id;
    const role = req.user.role;
    const pool = require("../config/database");
    
    let query = `SELECT c.*, 
                 p.full_name as patient_name,
                 d.full_name as doctor_name
                 FROM consultations c
                 LEFT JOIN users p ON c.patient_id = p.user_id
                 LEFT JOIN users d ON c.doctor_id = d.user_id`;
    
    let params = [];
    
    if (role === 'patient') {
      query += ` WHERE c.patient_id = ?`;
      params.push(userId);
    } else if (role === 'doctor') {
      query += ` WHERE c.doctor_id = ? OR c.doctor_id IS NULL`;
      params.push(userId);
    } else if (role !== 'admin') {
      
      query += ` WHERE c.patient_id = ? OR c.doctor_id = ?`;
      params.push(userId, userId);
    }
    
    query += ` ORDER BY c.created_at DESC`;
    
    const [consultations] = await pool.query(query, params);
    
    res.json({
      message: "Consultations retrieved successfully",
      consultations
    });
  } catch (error) {
    console.error("Get all consultations error:", error);
    res.status(500).json({
      error: "Failed to retrieve consultations",
      details: error.message
    });
  }
}

module.exports = {
  getAllConsultationsController,
  getConsultationController,
  createConsultationController,
  updateConsultationController,
  listMessagesController,
  sendMessageController
};
