const pool = require('../config/database');

// CREATE Staff
async function createStaff({ user_id, ngo_id, role, is_active = true }) {
  try {
    const [result] = await pool.query(
      'INSERT INTO ngo_staff (user_id, ngo_id, role, is_active) VALUES (?, ?, ?, ?)',
      [user_id, ngo_id, role, is_active]
    );
    return result.insertId;
  } catch (error) {
    console.error("Error creating staff:", error);
    throw error;
  }
}

// GET Staff by NGO
async function getStaffByNGO(ngo_id) {
  try {
    const [rows] = await pool.query('SELECT * FROM ngo_staff WHERE ngo_id = ?', [ngo_id]);
    return rows;
  } catch (error) {
    console.error("Error fetching staff by NGO:", error);
    throw error;
  }
}

// GET Staff by ID
async function getStaffById(staff_id) {
  try {
    const [rows] = await pool.query('SELECT * FROM ngo_staff WHERE staff_id = ?', [staff_id]);
    return rows[0] || null;
  } catch (error) {
    console.error("Error fetching staff by ID:", error);
    throw error;
  }
}

// UPDATE Staff
async function updateStaff(staff_id, { role, is_active }) {
  try {
    const [result] = await pool.query(
      'UPDATE ngo_staff SET role = ?, is_active = ? WHERE staff_id = ?',
      [role, is_active, staff_id]
    );
    return result;
  } catch (error) {
    console.error("Error updating staff:", error);
    throw error;
  }
}

// DELETE Staff
async function deleteStaff(staff_id) {
  try {
    const [result] = await pool.query('DELETE FROM ngo_staff WHERE staff_id = ?', [staff_id]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error("Error deleting staff:", error);
    throw error;
  }
}

module.exports = {
  createStaff,
  getStaffByNGO,
  getStaffById,
  updateStaff,
  deleteStaff
};
