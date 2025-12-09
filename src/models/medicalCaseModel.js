const pool = require("../config/database");


async function createCase(data) {
  const { patient_id, case_title, case_description, target_amount, medical_condition } = data;

  const [result] = await pool.query(
    `INSERT INTO medical_cases
      (patient_id, case_title, case_description, target_amount, medical_condition, case_status, treatment_type, urgency_level)
     VALUES (?, ?, ?, ?, ?, 'active', 'other', 'medium')`,
    [patient_id, case_title, case_description, target_amount, medical_condition || null]
  );

  return result.insertId;
}



async function getAllCases() {
  const [rows] = await pool.query(`SELECT * FROM medical_cases ORDER BY created_at DESC`);
  return rows;
}

async function getCaseById(case_id) {
  const [rows] = await pool.query(`SELECT * FROM medical_cases WHERE case_id = ?`, [case_id]);
  return rows[0] || null;
}


async function updateCase(case_id, data) {
  const allowed = ["case_title", "case_description", "case_status", "target_amount", "medical_condition"];
  const fields = [];
  const values = [];

  for (const key of allowed) {
    if (data[key] !== undefined) {
      fields.push(`${key} = ?`);
      values.push(data[key]);
    }
  }

  if (fields.length === 0) return false;

  fields.push("updated_at = NOW()");
  values.push(case_id);

  await pool.query(`UPDATE medical_cases SET ${fields.join(", ")} WHERE case_id = ?`, values);
  return true;
}


async function deleteCase(case_id) {
  const [result] = await pool.query(`DELETE FROM medical_cases WHERE case_id = ?`, [case_id]);
  return result.affectedRows > 0;
}

async function getUpdatesByCase(case_id) {
  const [rows] = await pool.query(
    `SELECT update_id, update_content AS update_text, created_by, created_at
     FROM case_updates
     WHERE medical_case_id = ?
     ORDER BY created_at DESC`,
    [case_id]
  );
  return rows;
}


async function createUpdate(case_id, data) {
  const { update_text, updated_by } = data;

  const [result] = await pool.query(
    `INSERT INTO case_updates (medical_case_id, update_content, created_by, created_at)
     VALUES (?, ?, ?, NOW())`,
    [case_id, update_text, updated_by]
  );

  return result.insertId;
}



module.exports = {
  createCase,
  getAllCases,
  getCaseById,
  updateCase,
  deleteCase,
  getUpdatesByCase,
  createUpdate,
};
