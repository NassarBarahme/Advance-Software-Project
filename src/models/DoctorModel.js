const pool = require('../config/database');

class DoctorModel {

  static async create(data) {
    const {
      doctor_id,
      specialization,
      license_number,
      experience_years,
      profile_bio,
      availability_schedule,
      created_by
    } = data;

    const [result] = await pool.query(
      `INSERT INTO doctors 
       (doctor_id, specialization, license_number, experience_years, profile_bio, availability_schedule, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        doctor_id,
        specialization,
        license_number,
        experience_years || 0,
        profile_bio,
        availability_schedule ? JSON.stringify(availability_schedule) : null,
        created_by
      ]
    );
    return doctor_id;
  }


  static async getById(doctorId) {
    const [rows] = await pool.query(
      `SELECT d.*, 
              u.full_name, 
              u.email, 
              u.phone_number, 
              u.date_of_birth, 
              u.gender, 
              u.is_verified, 
              u.created_at
       FROM doctors d
       INNER JOIN users u ON d.doctor_id = u.user_id
       WHERE d.doctor_id = ?`,
      [doctorId]
    );

    const doctor = rows[0];

    if (
      doctor &&
      doctor.availability_schedule &&
      typeof doctor.availability_schedule === 'string'
    ) {
      try {
        doctor.availability_schedule = JSON.parse(doctor.availability_schedule);
      } catch (e) {
        console.error('Error parsing availability_schedule for doctor:', doctorId, e);
      }
    }

    return doctor;
  }


  static async getAll(filters = {}) {
    let query = `SELECT d.*, 
                        u.full_name, 
                        u.email, 
                        u.phone_number, 
                        u.is_verified
                 FROM doctors d
                 INNER JOIN users u ON d.doctor_id = u.user_id
                 WHERE 1=1`;
    const params = [];

    if (filters.specialization) {
      query += ' AND d.specialization LIKE ?';
      params.push(`%${filters.specialization}%`);
    }

    if (filters.is_verified !== undefined) {
      query += ' AND u.is_verified = ?';
      params.push(filters.is_verified);
    }

    query += ' ORDER BY d.experience_years DESC, u.created_at DESC';

    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(parseInt(filters.limit, 10));
    }

    if (filters.offset) {
      query += ' OFFSET ?';
      params.push(parseInt(filters.offset, 10));
    }

    const [rows] = await pool.query(query, params);

    
    rows.forEach(row => {
      if (row.availability_schedule && typeof row.availability_schedule === 'string') {
        try {
          row.availability_schedule = JSON.parse(row.availability_schedule);
        } catch (e) {
          console.error(
            'Error parsing availability_schedule for doctor:',
            row.doctor_id,
            e
          );
        }
      }
    });

    return rows;
  }


  static async update(doctorId, data) {
    const allowedFields = [
      'specialization',
      'license_number',
      'experience_years',
      'profile_bio',
      'availability_schedule'
    ];

    const updates = [];
    const values = [];

    Object.keys(data).forEach(key => {
      if (allowedFields.includes(key) && data[key] !== undefined) {
        if (key === 'availability_schedule') {
          updates.push(`${key} = ?`);
          if (typeof data[key] === 'string') {
            values.push(data[key]);
          } else {
            values.push(JSON.stringify(data[key]));
          }
        } else {
          updates.push(`${key} = ?`);
          values.push(data[key]);
        }
      }
    });

    if (updates.length === 0) {
      return false;
    }

    values.push(doctorId);
    const [result] = await pool.query(
      `UPDATE doctors SET ${updates.join(', ')} WHERE doctor_id = ?`,
      values
    );
    return result.affectedRows > 0;
  }

  static async delete(doctorId) {
    const [result] = await pool.query(
      'DELETE FROM doctors WHERE doctor_id = ?',
      [doctorId]
    );
    return result.affectedRows > 0;
  }


  static async getCertifications(doctorId) {
    const [rows] = await pool.query(
      'SELECT * FROM doctor_certifications WHERE doctor_id = ? ORDER BY issue_date DESC',
      [doctorId]
    );
    return rows;
  }


  static async addCertification(doctorId, certData) {
    const {
      cert_name,
      cert_type,
      issued_by,
      issue_date,
      expiry_date,
      file_path
    } = certData;

    const [result] = await pool.query(
      `INSERT INTO doctor_certifications 
       (doctor_id, cert_name, cert_type, issued_by, issue_date, expiry_date, file_path)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [doctorId, cert_name, cert_type, issued_by, issue_date, expiry_date, file_path]
    );
    return result.insertId;
  }


  static async removeCertification(doctorId, certId) {
    const [result] = await pool.query(
      'DELETE FROM doctor_certifications WHERE doctor_id = ? AND cert_id = ?',
      [doctorId, certId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = DoctorModel;
