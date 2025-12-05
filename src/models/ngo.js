const pool = require('../config/database');

// CREATE NGO
async function createNGO({ ngo_id, organization_name, license_number, contact_person, verified, meta, created_by }) {
  const [result] = await pool.query(
    `INSERT INTO ngos (ngo_id, organization_name, license_number, contact_person, verified, meta, created_by) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [ngo_id, organization_name, license_number, contact_person, verified, meta ? JSON.stringify(meta) : null, created_by]
  );
  return result; 
}


// READ ALL NGOs
async function getAllNGOs() {
const [rows] = await pool.query('SELECT * FROM ngos ORDER BY ngo_id DESC');

  return rows;
}

// READ NGO BY ID
async function getNGOById(ngo_id) {
  const [rows] = await pool.query('SELECT * FROM ngos WHERE ngo_id = ?', [ngo_id]);
  return rows[0] || null;
}

// UPDATE NGO
async function updateNGO(ngo_id, { organization_name, license_number, contact_person, verified, meta }) {
  const [result] = await pool.query(
    `UPDATE ngos 
      SET organization_name = ?, license_number = ?, contact_person = ?, verified = ?, meta = ? 
      WHERE ngo_id = ?`,
    [
      organization_name, 
      license_number, 
      contact_person, 
      verified !== undefined ? verified : null, 
      meta ? JSON.stringify(meta) : null, 
      ngo_id
    ]
  );
  return result;
}


// DELETE NGO
async function deleteNGO(ngo_id) {
  const [result] = await pool.query('DELETE FROM ngos WHERE ngo_id = ?', [ngo_id]);
  return result.affectedRows > 0;
}

// SEARCH NGOs
async function searchNGOs({ query, verified, limit = 10, offset = 0 }) {
  let sql = 'SELECT * FROM ngos WHERE 1=1';
  const params = [];

  if (query) {
    sql += ' AND (organization_name LIKE ? OR contact_person LIKE ?)';
    params.push(`%${query}%`, `%${query}%`);
  }

  if (verified !== undefined) {
    sql += ' AND verified = ?';
    params.push(verified ? 1 : 0);
  }

  sql += ' LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const [rows] = await pool.query(sql, params);
  return rows;
}

module.exports = {
  createNGO,
  getAllNGOs,
  getNGOById,
  updateNGO,
  deleteNGO,
  searchNGOs
};
