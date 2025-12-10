const { createRequest, getRequestById, updateRequest } = require("../models/medicationRequestModel");
const pool = require("../config/database");

exports.createRequest = async (req, res) => {
  try {
    const id = await createRequest(req.body);
    res.status(201).json({ message: "Request created", id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getRequestById = async (req, res) => {
  try {
    const request = await getRequestById(req.params.request_id);
    if (!request) return res.status(404).json({ error: "Not found" });
    res.json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateRequest = async (req, res) => {
  try {
    const result = await updateRequest(req.params.request_id, req.body);
    res.json({ message: "Updated", result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all medication requests
exports.getAllRequests = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const role = req.user.role;
    
    let query = `SELECT mr.*, u.full_name as patient_name
                 FROM medication_requests mr
                 LEFT JOIN users u ON mr.patient_id = u.user_id`;
    
    let params = [];
    
    // Filter based on role
    if (role === 'patient') {
      query += ` WHERE mr.patient_id = ?`;
      params.push(userId);
    } else if (role === 'pharmacy' || role === 'admin') {
      // Pharmacy and admin see all requests
      // No WHERE clause needed
    } else {
      // Other roles see only their requests
      query += ` WHERE mr.patient_id = ?`;
      params.push(userId);
    }
    
    query += ` ORDER BY mr.created_at DESC`;
    
    const [requests] = await pool.query(query, params);
    
    res.json({
      message: "Medication requests retrieved successfully",
      requests
    });
  } catch (err) {
    console.error("Get all requests error:", err);
    res.status(500).json({ error: err.message });
  }
};
