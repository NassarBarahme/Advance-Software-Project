const pool = require("../config/database");

async function createDeliveryMatch(match) {
const { request_id, inventory_id, volunteer_id, match_status, delivery_date, delivery_notes } = match;

const [result] = await pool.query(
  `INSERT INTO delivery_matches
   (request_id, inventory_id, volunteer_id, match_status, delivery_date, delivery_notes)
   VALUES (?, ?, ?, ?, ?, ?)`,
  [request_id, inventory_id, volunteer_id, match_status, delivery_date, delivery_notes]
);

  return result.insertId;
}


async function updateDeliveryMatch(match_id, data) {
  const fields = [];
  const values = [];

  for (const key in data) {
    fields.push(`${key} = ?`);
    values.push(data[key]);
  }

  if (fields.length === 0) throw new Error("No data to update");

  values.push(match_id);

  const [result] = await pool.query(
    `UPDATE delivery_matches SET ${fields.join(", ")} WHERE match_id = ?`,
    values
  );
  return result;
}

async function deleteDeliveryMatch(match_id) {
  const [result] = await pool.query(
    `DELETE FROM delivery_matches WHERE match_id = ?`,
    [match_id]
  );
  return result.affectedRows > 0;
}

module.exports = { createDeliveryMatch, updateDeliveryMatch, deleteDeliveryMatch };
