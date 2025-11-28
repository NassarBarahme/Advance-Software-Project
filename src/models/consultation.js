// models/consultationModel.js
const pool = require("../config/database");

// Get consultation by ID
async function getConsultationById(consultation_id) {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM consultations WHERE consultation_id = ?`,
      [consultation_id]
    );

    if (rows.length === 0) return null;

    return rows[0];
  } catch (error) {
    console.error("Error getting consultation:", error);
    throw error;
  }
}

// Create new consultation
async function createConsultation(data) {
  try {
    const { patient_id, doctor_id, consultation_type, status, scheduled_at, duration_minutes, notes, low_bandwidth, created_by } = data;

    const [result] = await pool.query(
      `INSERT INTO consultations 
       (patient_id, doctor_id, consultation_type, status, scheduled_at, duration_minutes, notes, low_bandwidth, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [patient_id, doctor_id || null, consultation_type || 'video', status || 'pending', scheduled_at || null, duration_minutes || null, notes || null, !!low_bandwidth, created_by]
    );

    const newConsultation = await getConsultationById(result.insertId);
    return newConsultation;
  } catch (error) {
    console.error("Error creating consultation:", error);
    throw error;
  }
}

// Update consultation
async function updateConsultation(consultation_id, updateData) {
  try {
    const allowedFields = ['doctor_id','status','scheduled_at','duration_minutes','notes','low_bandwidth'];
    const updates = [];
    const values = [];

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(updateData[field]);
      }
    }

    if (updates.length === 0) return await getConsultationById(consultation_id);

    values.push(consultation_id);

    await pool.query(
      `UPDATE consultations SET ${updates.join(', ')} WHERE consultation_id = ?`,
      values
    );

    return await getConsultationById(consultation_id);
  } catch (error) {
    console.error("Error updating consultation:", error);
    throw error;
  }
}

// List messages for a consultation
async function listMessages(consultation_id, limit = 50, offset = 0) {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM consultation_messages 
       WHERE consultation_id = ? 
       ORDER BY sent_at ASC 
       LIMIT ? OFFSET ?`,
      [consultation_id, limit, offset]
    );

    return rows;
  } catch (error) {
    console.error("Error listing messages:", error);
    throw error;
  }
}

// Send a message in a consultation
async function sendMessage(data) {
  try {
    const { consultation_id, sender_id, sender_role, content, content_type, metadata } = data;

   const [result] = await pool.query(
  `INSERT INTO consultation_messages 
   (consultation_id, sender_id, message_text) 
   VALUES (?, ?, ?)`,
  [consultation_id, sender_id, content]
);


    const [rows] = await pool.query(
      `SELECT * FROM consultation_messages WHERE message_id = ?`,
      [result.insertId]
    );

    return rows[0];
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
}

module.exports = {
  getConsultationById,
  createConsultation,
  updateConsultation,
  listMessages,
  sendMessage,
};
