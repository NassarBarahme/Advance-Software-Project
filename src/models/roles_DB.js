
const pool = require("../config/database");
async function getRoles() {
  try {
    const [rows] = await pool.query("SELECT * FROM roles ORDER BY role_id ASC");
    return rows;
  } catch (error) {
    throw error;
  }
}


async function getPermissionsByRole(role_id) {
  try {
    const [rows] = await pool.query(
      `SELECT p.permission_id, p.name, p.description
       FROM role_permissions rp
       JOIN permissions p ON rp.permission_id = p.permission_id
       WHERE rp.role_id = ?`,
      [role_id]
    );
    return rows;
  } catch (error) {
    throw error;
  }
}


async function assignPermission(role_id, permission_id) {
  try {
    const [result] = await pool.query(
      `INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)`,
      [role_id, permission_id]
    );
    return result;
  } catch (error) {
    throw error;
  }
}


async function deletePermissionAssignment(role_id, permission_id) {
  try {
    const [result] = await pool.query(
      `DELETE FROM role_permissions WHERE role_id = ? AND permission_id = ?`,
      [role_id, permission_id]
    );

    return result.affectedRows > 0;
  } catch (error) {
    throw error;
  }
}

async function getAllPermissions() {
  try {
    const [rows] = await pool.query("SELECT * FROM permissions ORDER BY permission_id ASC");
    return rows;
  } catch (error) {
    throw error;
  }
}


async function getUserPermissions(user_id) {
  try {
    const [rows] = await pool.query(
      `SELECT p.permission_id, p.name, p.description
       FROM users u
       JOIN role_permissions rp ON u.role_id = rp.role_id
       JOIN permissions p ON rp.permission_id = p.permission_id
       WHERE u.user_id = ?`,
      [user_id]
    );
    return rows;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  getRoles,
  getPermissionsByRole,
  assignPermission,
  deletePermissionAssignment,
  getAllPermissions,
  getUserPermissions
};