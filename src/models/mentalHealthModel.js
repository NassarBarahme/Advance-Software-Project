const pool = require("../config/database");

async function createMentalSession(session) {
  const {
    patient_id,
    counselor_id,
    session_type,
    scheduled_datetime,
    duration_minutes,
    trauma_type,
    is_anonymous,
  } = session;

  const [result] = await pool.query(
    `INSERT INTO mental_health_sessions
     (patient_id, counselor_id, session_type, scheduled_datetime, duration_minutes, trauma_type, is_anonymous)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [patient_id, counselor_id, session_type, scheduled_datetime, duration_minutes || 60, trauma_type, is_anonymous || 0]
  );

  return result.insertId;
}

async function getSessionById(session_id) {
  const [rows] = await pool.query(
    `SELECT * FROM mental_health_sessions WHERE session_id = ?`,
    [session_id]
  );
  return rows[0] || null;
}

async function updateMentalSession(session_id, data) {
  const fields = [];
  const values = [];

  for (const key in data) {
    fields.push(`${key} = ?`);
    values.push(data[key]);
  }

  if (fields.length === 0) throw new Error("No data to update");

  values.push(session_id);

  const [result] = await pool.query(
    `UPDATE mental_health_sessions SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE session_id = ?`,
    values
  );
  return result;
}

module.exports = {
  createMentalSession,
  getSessionById,
  updateMentalSession,
};
