const pool = require('../config/database');

class HealthAlertModel {
  /**
   * Create new health alert
   */
  static async create(data) {
    const {
      alert_title,
      alert_content,
      alert_type,
      severity_level,
      affected_areas,
      is_active,
      expires_at,
      created_by
    } = data;

    const [result] = await pool.query(
      `INSERT INTO health_alerts 
       (alert_title, alert_content, alert_type, severity_level, affected_areas, is_active, expires_at, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        alert_title,
        alert_content,
        alert_type,
        severity_level || 'info',
        affected_areas ? JSON.stringify(affected_areas) : null,
        is_active !== undefined ? is_active : true,
        expires_at,
        created_by
      ]
    );
    return result.insertId;
  }

  /**
   * Get health alert by ID
   */
  static async getById(alertId) {
    const [rows] = await pool.query(
      `SELECT ha.*, u.full_name as creator_name 
       FROM health_alerts ha
       LEFT JOIN users u ON ha.created_by = u.user_id
       WHERE ha.alert_id = ?`,
      [alertId]
    );
    
    if (rows[0] && rows[0].affected_areas) {
      rows[0].affected_areas = JSON.parse(rows[0].affected_areas);
    }
    
    return rows[0];
  }

  /**
   * Get all health alerts with filters
   */
  static async getAll(filters = {}) {
    let query = `SELECT ha.*, u.full_name as creator_name 
                 FROM health_alerts ha
                 LEFT JOIN users u ON ha.created_by = u.user_id
                 WHERE 1=1`;
    const params = [];

    if (filters.alert_type) {
      query += ' AND ha.alert_type = ?';
      params.push(filters.alert_type);
    }

    if (filters.severity_level) {
      query += ' AND ha.severity_level = ?';
      params.push(filters.severity_level);
    }

    if (filters.is_active !== undefined) {
      query += ' AND ha.is_active = ?';
      params.push(filters.is_active);
    }

    // Only show non-expired alerts by default
    if (filters.include_expired !== true) {
      query += ' AND (ha.expires_at IS NULL OR ha.expires_at > NOW())';
    }

    query += ' ORDER BY ha.severity_level DESC, ha.created_at DESC';

    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(parseInt(filters.limit));
    }

    if (filters.offset) {
      query += ' OFFSET ?';
      params.push(parseInt(filters.offset));
    }

    const [rows] = await pool.query(query, params);
    
    // Parse JSON fields
    rows.forEach(row => {
      if (row.affected_areas) {
        row.affected_areas = JSON.parse(row.affected_areas);
      }
    });
    
    return rows;
  }

  /**
   * Update health alert
   */
  static async update(alertId, data) {
    const allowedFields = [
      'alert_title', 'alert_content', 'alert_type', 
      'severity_level', 'affected_areas', 'is_active', 'expires_at'
    ];
    
    const updates = [];
    const values = [];

    Object.keys(data).forEach(key => {
      if (allowedFields.includes(key) && data[key] !== undefined) {
        if (key === 'affected_areas' && typeof data[key] === 'object') {
          updates.push(`${key} = ?`);
          values.push(JSON.stringify(data[key]));
        } else {
          updates.push(`${key} = ?`);
          values.push(data[key]);
        }
      }
    });

    if (updates.length === 0) {
      return false;
    }

    values.push(alertId);
    const [result] = await pool.query(
      `UPDATE health_alerts SET ${updates.join(', ')} WHERE alert_id = ?`,
      values
    );
    return result.affectedRows > 0;
  }

  /**
   * Delete health alert
   */
  static async delete(alertId) {
    const [result] = await pool.query('DELETE FROM health_alerts WHERE alert_id = ?', [alertId]);
    return result.affectedRows > 0;
  }
}

module.exports = HealthAlertModel;

