const pool = require("../config/database");


async function addInventory(item) {
  const {
    provider_id,
    item_type,
    item_name,
    description,
    quantity_available,
    expiry_date,
    condition_status,
    location,
    availability_status
  } = item;

  const [result] = await pool.query(
    `INSERT INTO medical_inventory
     (provider_id, item_type, item_name, description, quantity_available, expiry_date, condition_status, location, availability_status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [provider_id, item_type, item_name, description, quantity_available, expiry_date, condition_status, location, availability_status]
  );

  return result.insertId;
}



async function getInventoryById(inventory_id) {
  const [rows] = await pool.query(
    `SELECT * FROM medical_inventory WHERE inventory_id = ?`,
    [inventory_id]
  );
  return rows[0] || null;
}

async function updateInventory(inventory_id, data) {
  const fields = [];
  const values = [];

  for (const key in data) {
    fields.push(`${key} = ?`);
    values.push(data[key]);
  }

  if (fields.length === 0) throw new Error("No data to update");

  values.push(inventory_id);

  const [result] = await pool.query(
    `UPDATE medical_inventory SET ${fields.join(", ")} WHERE inventory_id = ?`,
    values
  );
  return result;
}

module.exports = { addInventory, getInventoryById, updateInventory };
