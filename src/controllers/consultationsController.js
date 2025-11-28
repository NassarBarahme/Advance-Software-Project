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

    if (isNaN(consultationId) || consultationId <= 0) {
      return res.status(400).json({ error: "Invalid consultation ID" });
    }

    const consultation = await getConsultationById(consultationId);
    if (!consultation) {
      return res.status(404).json({ error: "Consultation not found" });
    }

    //only Admin
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

module.exports = {
  getConsultationController,
  createConsultationController,
  updateConsultationController,
  listMessagesController,
  sendMessageController
};
