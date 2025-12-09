const pool = require('../config/database');

class PatientModel {
  /**
   * Create new patient
   */
  static async create(data) {
    const {
      patient_id,
      medical_history,
      blood_type,
      chronic_conditions,
      consent_data,
      created_by
    } = data;

    const [result] = await pool.query(
      `INSERT INTO patients 
       (patient_id, medical_history, blood_type, chronic_conditions, consent_data, created_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        patient_id,
        medical_history ? JSON.stringify(medical_history) : null,
        blood_type || null,
        chronic_conditions ? JSON.stringify(chronic_conditions) : null,
        consent_data ? JSON.stringify(consent_data) : null,
        created_by || null
      ]
    );

    return patient_id;
  }

  /**
   * Get patient by ID
   */
  static async getById(patientId) {
    try {
      const [rows] = await pool.query(
        `SELECT p.*, u.full_name, u.email, u.phone_number, u.date_of_birth, u.gender,
                u.is_verified, u.is_active, u.preferred_language, u.created_at
         FROM patients p
         INNER JOIN users u ON p.patient_id = u.user_id
         WHERE p.patient_id = ?`,
        [patientId]
      );

      if (!rows[0]) return null;

      // Helper function to safely parse JSON
      const safeParseJSON = (value) => {
        try {
          if (!value || value === null || value === '') return null;
          if (typeof value === 'object' && !Array.isArray(value) && value.constructor === Object) {
            return value; // Already an object
          }
          if (typeof value === 'string') {
            return JSON.parse(value);
          }
          return null;
        } catch (error) {
          return null;
        }
      };

      // Parse JSON fields
      rows[0].medical_history = safeParseJSON(rows[0].medical_history);
      rows[0].chronic_conditions = safeParseJSON(rows[0].chronic_conditions);
      rows[0].consent_data = safeParseJSON(rows[0].consent_data);

      return rows[0];

    } catch (error) {
      console.error('❌ Error in getById:', error);
      throw error;
    }
  }

  /**
   * Update patient info
   */
  static async update(patientId, data) {
    const allowedFields = [
      'medical_history', 'blood_type', 'chronic_conditions', 'consent_data'
    ];
    
    const updates = [];
    const values = [];

    Object.keys(data).forEach(key => {
      if (allowedFields.includes(key) && data[key] !== undefined) {
        if (['medical_history', 'chronic_conditions', 'consent_data'].includes(key)) {
          updates.push(`${key} = ?`);
          if (data[key] === null || data[key] === '') {
            values.push(null);
          } else if (typeof data[key] === 'object') {
            values.push(JSON.stringify(data[key]));
          } else {
            values.push(data[key]);
          }
        } else {
          // blood_type
          updates.push(`${key} = ?`);
          values.push(data[key] === '' ? null : data[key]);
        }
      }
    });

    if (updates.length === 0) {
      return false;
    }

    values.push(patientId);

    const [result] = await pool.query(
      `UPDATE patients SET ${updates.join(', ')} WHERE patient_id = ?`,
      values
    );

    return result.affectedRows > 0;
  }

  /**
   * Delete patient
   */
  static async delete(patientId) {
    const [result] = await pool.query(
      'DELETE FROM patients WHERE patient_id = ?',
      [patientId]
    );

    return result.affectedRows > 0;
  }

  /**
   * Get patient fundraising profiles
   */
  static async getProfiles(patientId) {
    const [rows] = await pool.query(
      `SELECT pp.*, p.patient_id, u.full_name as patient_name
       FROM patient_profiles pp
       INNER JOIN patients p ON pp.patient_id = p.patient_id
       INNER JOIN users u ON p.patient_id = u.user_id
       WHERE pp.patient_id = ?
       ORDER BY pp.created_at DESC`,
      [patientId]
    );

    return rows;
  }

  /**
   * Create patient fundraising profile
   */
  static async createProfile(patientId, data) {
    const {
      goal_amount,
      story,
      status
    } = data;

    const [result] = await pool.query(
      `INSERT INTO patient_profiles
       (patient_id, goal_amount, current_amount, story, status)
       VALUES (?, ?, ?, ?, ?)`,
      [
        patientId,
        goal_amount || null,
        0,
        story || null,
        status || 'active'
      ]
    );

    const [rows] = await pool.query(
      `SELECT pp.*, u.full_name as patient_name
       FROM patient_profiles pp
       INNER JOIN patients p ON pp.patient_id = p.patient_id
       INNER JOIN users u ON p.patient_id = u.user_id
       WHERE pp.profile_id = ?`,
      [result.insertId]
    );

    return rows[0];
  }
}

module.exports = PatientModel;
