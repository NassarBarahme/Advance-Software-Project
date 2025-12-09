const pool = require("../config/database");


async function createSupportGroup(group) {
  const {
    group_name,
    group_type,
    description,
    moderator_id,
    max_members,
    current_members,
    is_active,
    meeting_schedule,
  } = group;

  const [result] = await pool.query(
    `INSERT INTO support_groups
     (group_name, group_type, description, moderator_id, max_members, current_members, is_active, meeting_schedule)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      group_name,
      group_type,
      description || null,
      moderator_id,
      max_members || 20,
      current_members || 0,
      is_active ?? 1,
      meeting_schedule || null,
    ]
  );

  return result.insertId;
}

async function getSupportGroupById(group_id) {
  const [rows] = await pool.query(
    `SELECT * FROM support_groups WHERE group_id = ?`,
    [group_id]
  );
  return rows[0] || null;
}

async function updateSupportGroup(group_id, data) {
  const fields = [];
  const values = [];

  for (const key in data) {
    fields.push(`${key} = ?`);
    values.push(data[key]);
  }

  if (fields.length === 0) throw new Error("No data to update");

  values.push(group_id);

  const [result] = await pool.query(
    `UPDATE support_groups 
     SET ${fields.join(", ")}, created_at = created_at 
     WHERE group_id = ?`,
    values
  );

  return result;
}

async function deleteSupportGroup(group_id) {
  const [result] = await pool.query(
    `DELETE FROM support_groups WHERE group_id = ?`,
    [group_id]
  );
  return result;
}

module.exports = {
  createSupportGroup,
  getSupportGroupById,
  updateSupportGroup,
  deleteSupportGroup,
};
