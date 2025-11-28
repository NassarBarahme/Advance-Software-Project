const pool = require("../config/database");


async function createRequest(request) {
  const { patient_id, medication_name, dosage, quantity_needed, urgency_level, medical_condition } = request;

  const [result] = await pool.query(
    `INSERT INTO medication_requests
     (patient_id, medication_name, dosage, quantity_needed, urgency_level, medical_condition)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [patient_id, medication_name, dosage, quantity_needed, urgency_level, medical_condition]
  );

  return result.insertId;
}



async function getRequestById(request_id) {
  const [rows] = await pool.query(
    `SELECT * FROM medication_requests WHERE request_id = ?`,
    [request_id]
  );
  return rows[0] || null;
}


async function updateRequest(request_id, data) {
  const fields = [];
  const values = [];

  for (const key in data) {
    fields.push(`${key} = ?`);
    values.push(data[key]);
  }

  if (fields.length === 0) throw new Error("No data to update");

  values.push(request_id);

  const [result] = await pool.query(
    `UPDATE medication_requests SET ${fields.join(", ")} WHERE request_id = ?`,
    values
  );
  return result;
}

module.exports = { createRequest, getRequestById, updateRequest };
