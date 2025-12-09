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
        affected_areas ? (typeof affected_areas === 'string' ? affected_areas : JSON.stringify(affected_areas)) : null,
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
    
    if (rows[0] && rows[0].affected_areas !== null && rows[0].affected_areas !== undefined) {
      try {
        // MySQL JSON column may return as object/array directly, or as string
        if (typeof rows[0].affected_areas === 'string') {
          // Only parse if it's a valid JSON string
          const trimmed = rows[0].affected_areas.trim();
          if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
            rows[0].affected_areas = JSON.parse(rows[0].affected_areas);
          }
        }
        // If it's already an object/array, leave it as is
      } catch (error) {
        // If parsing fails, set to null
        console.error('Error parsing affected_areas:', error);
        rows[0].affected_areas = null;
      }
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
      if (row.affected_areas !== null && row.affected_areas !== undefined) {
        try {
          // MySQL JSON column may return as object/array directly, or as string
          if (typeof row.affected_areas === 'string') {
            // Only parse if it's a valid JSON string
            const trimmed = row.affected_areas.trim();
            if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
              row.affected_areas = JSON.parse(row.affected_areas);
            }
          }
          // If it's already an object/array, leave it as is
        } catch (error) {
          // If parsing fails, set to null
          console.error('Error parsing affected_areas:', error);
          row.affected_areas = null;
        }
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

