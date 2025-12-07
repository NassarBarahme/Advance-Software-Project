const pool = require('../config/database');

class HealthContentModel {
  /**
   * Create new health content
   */
  static async create(data) {
    const {
      title,
      content_type,
      category,
      content_text,
      content_url,
      language,
      target_audience,
      is_published,
      created_by
    } = data;

    const [result] = await pool.query(
      `INSERT INTO health_content 
       (title, content_type, category, content_text, content_url, language, target_audience, is_published, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, content_type, category, content_text, content_url, language, target_audience, is_published || false, created_by]
    );
    return result.insertId;
  }

  /**
   * Get health content by ID
   */
  static async getById(contentId) {
    const [rows] = await pool.query(
      `SELECT hc.*, u.full_name as creator_name 
       FROM health_content hc
       LEFT JOIN users u ON hc.created_by = u.user_id
       WHERE hc.content_id = ?`,
      [contentId]
    );
    return rows[0];
  }

  /**
   * Get all health content with filters
   */
  static async getAll(filters = {}) {
    let query = `SELECT hc.*, u.full_name as creator_name 
                 FROM health_content hc
                 LEFT JOIN users u ON hc.created_by = u.user_id
                 WHERE 1=1`;
    const params = [];

    if (filters.content_type) {
      query += ' AND hc.content_type = ?';
      params.push(filters.content_type);
    }

    if (filters.category) {
      query += ' AND hc.category = ?';
      params.push(filters.category);
    }

    if (filters.language) {
      query += ' AND (hc.language = ? OR hc.language = "both")';
      params.push(filters.language);
    }

    if (filters.is_published !== undefined) {
      query += ' AND hc.is_published = ?';
      params.push(filters.is_published);
    }

    query += ' ORDER BY hc.created_at DESC';

    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(parseInt(filters.limit));
    }

    if (filters.offset) {
      query += ' OFFSET ?';
      params.push(parseInt(filters.offset));
    }

    const [rows] = await pool.query(query, params);
    return rows;
  }

  /**
   * Update health content
   */
  static async update(contentId, data) {
    const allowedFields = [
      'title', 'content_type', 'category', 'content_text', 
      'content_url', 'language', 'target_audience', 'is_published'
    ];
    
    const updates = [];
    const values = [];

    Object.keys(data).forEach(key => {
      if (allowedFields.includes(key) && data[key] !== undefined) {
        updates.push(`${key} = ?`);
        values.push(data[key]);
      }
    });

    if (updates.length === 0) {
      return false;
    }

    values.push(contentId);
    const [result] = await pool.query(
      `UPDATE health_content SET ${updates.join(', ')} WHERE content_id = ?`,
      values
    );
    return result.affectedRows > 0;
  }

  /**
   * Delete health content
   */
  static async delete(contentId) {
    const [result] = await pool.query('DELETE FROM health_content WHERE content_id = ?', [contentId]);
    return result.affectedRows > 0;
  }

  /**
   * Increment view count
   */
  static async incrementViews(contentId) {
    await pool.query('UPDATE health_content SET view_count = view_count + 1 WHERE content_id = ?', [contentId]);
  }
}

module.exports = HealthContentModel;

