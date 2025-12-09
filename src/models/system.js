const pool = require('../config/database');


// CREATE System
async function createSystem({ system_id, system_name, description, status, created_by, meta }) {
  const [result] = await pool.query(
    `INSERT INTO systems (system_id, system_name, description, status, created_by, meta)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      system_id,
      system_name,
      description || null,
      status || 'inactive',
      created_by || null,
      meta ? JSON.stringify(meta) : null
    ]
  );
  return result;
}

// READ ALL Systems
async function getAllSystems() {
  const [rows] = await pool.query('SELECT * FROM systems ORDER BY system_id DESC');
  return rows;
}

// READ System BY ID
async function getSystemById(system_id) {
  const [rows] = await pool.query('SELECT * FROM systems WHERE system_id = ?', [system_id]);
  return rows[0] || null;
}

// UPDATE System
async function updateSystem(system_id, { system_name, description, status, meta }) {
  const [result] = await pool.query(
    `UPDATE systems 
     SET system_name = ?, description = ?, status = ?, meta = ?
     WHERE system_id = ?`,
    [
      system_name,
      description,
      status,
      meta ? JSON.stringify(meta) : null,
      system_id
    ]
  );
  return result;
}

// DELETE System
async function deleteSystem(system_id) {
  const [result] = await pool.query('DELETE FROM systems WHERE system_id = ?', [system_id]);
  return result.affectedRows > 0;
}

// SEARCH Systems
async function searchSystems({ query, status, limit = 10, offset = 0 }) {
  let sql = 'SELECT * FROM systems WHERE 1=1';
  const params = [];

  if (query) {
    sql += ' AND (system_name LIKE ? OR description LIKE ?)';
    params.push(`%${query}%`, `%${query}%`);
  }

if (status !== undefined) {
  sql += ' AND status = ?';
  params.push(status);
}


  sql += ' LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const [rows] = await pool.query(sql, params);
  return rows;
}

module.exports = {
  createSystem,
  getAllSystems,
  getSystemById,
  updateSystem,
  deleteSystem,
  searchSystems
};