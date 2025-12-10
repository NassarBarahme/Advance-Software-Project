const pool = require("../config/database");

async function getDonationsByCaseId(medical_case_id) {
  const [rows] = await pool.query(
    `SELECT donation_id, donor_id, amount, currency, donation_type, payment_method, payment_status, is_anonymous, donor_message, created_at
     FROM donations
     WHERE medical_case_id = ?
     ORDER BY created_at DESC`,
    [medical_case_id]
  );
  return rows;
}

async function createDonation(data) {
  const {
    donor_id, medical_case_id, amount, currency, donation_type,
    payment_method, transaction_id, is_anonymous, donor_message
  } = data;

  const [result] = await pool.query(
    `INSERT INTO donations
     (donor_id, medical_case_id, amount, currency, donation_type, payment_method, transaction_id, payment_status, is_anonymous, donor_message)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)`,
    [donor_id, medical_case_id, amount, currency, donation_type, payment_method, transaction_id, is_anonymous ? 1 : 0, donor_message]
  );

  return result.insertId;
}

async function getDonationById(donation_id) {
  const [rows] = await pool.query(
    `SELECT * FROM donations WHERE donation_id = ?`,
    [donation_id]
  );
  return rows[0] || null;
}

async function updateDonation(donation_id, data) {
  const allowed = ["amount", "status", "payment_status", "payment_method"];
  const fields = [];
  const values = [];

  for (const key of allowed) {
    if (data[key] !== undefined) {
      fields.push(`${key} = ?`);
      values.push(data[key]);
    }
  }

  if (fields.length === 0) {
    throw new Error("No valid fields provided for update");
  }

  values.push(donation_id);

  const [result] = await pool.query(`UPDATE donations SET ${fields.join(", ")} WHERE donation_id = ?`, values);

  if (result.affectedRows === 0) {
    throw new Error("Donation not found");
  }

  return result;
}


async function deleteDonation(donation_id) {
  const [result] = await pool.query(
    `DELETE FROM donations WHERE donation_id = ?`,
    [donation_id]
  );
  return result.affectedRows > 0;
}

module.exports = {
  getDonationsByCaseId,
  createDonation,
  getDonationById,
  updateDonation,
  deleteDonation
};