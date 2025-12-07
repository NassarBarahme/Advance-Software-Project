const DoctorModel = require('../models/DoctorModel');
const ResponseHelper = require('../utils/responseHelper');
const pool = require('../config/database');

class DoctorController {
  /**
   * POST /doctors - Add doctor
   */
  static async createDoctor(req, res) {
    try {
      const {
        doctor_id,
        specialization,
        license_number,
        experience_years,
        profile_bio,
        availability_schedule
      } = req.body;

      // Validation
      if (!doctor_id || !specialization) {
        return ResponseHelper.error(res, 'Doctor ID and specialization are required', 400);
      }

      // Verify that user exists and has doctor role
      const [users] = await pool.query(
        `SELECT u.*, r.name as role_name 
         FROM users u 
         JOIN roles r ON u.role_id = r.role_id 
         WHERE u.user_id = ?`,
        [doctor_id]
      );

      if (users.length === 0) {
        return ResponseHelper.error(res, 'User not found', 404);
      }

      const user = users[0];
      if (user.role_name !== 'doctor') {
        return ResponseHelper.error(res, `User with ID ${doctor_id} is not a doctor. User role: ${user.role_name}`, 400);
      }

      // Check if doctor already exists
      const existingDoctor = await DoctorModel.getById(doctor_id);
      if (existingDoctor) {
        return ResponseHelper.error(res, 'Doctor already exists', 409);
      }

      const doctorData = {
        doctor_id,
        specialization,
        license_number,
        experience_years: experience_years || 0,
        profile_bio,
        availability_schedule: availability_schedule || null,
        created_by: req.user?.user_id || 1
      };

      await DoctorModel.create(doctorData);
      const doctor = await DoctorModel.getById(doctor_id);

      return ResponseHelper.success(res, doctor, 'Doctor created successfully', 201);
    } catch (error) {
      return ResponseHelper.error(res, error.message, 500);
    }
  }

  /**
   * GET /doctors/:doctor_id - Get doctor profile
   */
  static async getDoctorById(req, res) {
    try {
      const { doctor_id } = req.params;

      const doctor = await DoctorModel.getById(doctor_id);
      if (!doctor) {
        return ResponseHelper.notFound(res, 'Doctor not found');
      }

      return ResponseHelper.success(res, doctor, 'Doctor retrieved successfully');
    } catch (error) {
      return ResponseHelper.error(res, error.message, 500);
    }
  }

  /**
   * GET /doctors - Get all doctors with filters
   */
  static async getAllDoctors(req, res) {
    try {
      const filters = {
        specialization: req.query.specialization,
        is_verified: req.query.is_verified !== undefined ? req.query.is_verified === 'true' : undefined,
        limit: req.query.limit || 20,
        offset: req.query.offset || 0
      };

      const doctors = await DoctorModel.getAll(filters);
      return ResponseHelper.success(res, doctors, 'Doctors retrieved successfully');
    } catch (error) {
      return ResponseHelper.error(res, error.message, 500);
    }
  }

  /**
   * PATCH /doctors/:doctor_id - Update doctor info
   */
  static async updateDoctor(req, res) {
    try {
      const { doctor_id } = req.params;

      const doctor = await DoctorModel.getById(doctor_id);
      if (!doctor) {
        return ResponseHelper.notFound(res, 'Doctor not found');
      }

      const updated = await DoctorModel.update(doctor_id, req.body);
      if (!updated) {
        return ResponseHelper.error(res, 'No valid fields to update', 400);
      }

      const updatedDoctor = await DoctorModel.getById(doctor_id);
      return ResponseHelper.success(res, updatedDoctor, 'Doctor updated successfully');
    } catch (error) {
      return ResponseHelper.error(res, error.message, 500);
    }
  }

  /**
   * DELETE /doctors/:doctor_id - Delete doctor
   */
  static async deleteDoctor(req, res) {
    try {
      const { doctor_id } = req.params;

      const doctor = await DoctorModel.getById(doctor_id);
      if (!doctor) {
        return ResponseHelper.notFound(res, 'Doctor not found');
      }

      const deleted = await DoctorModel.delete(doctor_id);
      if (!deleted) {
        return ResponseHelper.error(res, 'Failed to delete doctor', 500);
      }

      return ResponseHelper.success(res, null, 'Doctor deleted successfully');
    } catch (error) {
      return ResponseHelper.error(res, error.message, 500);
    }
  }

  /**
   * GET /doctors/:doctor_id/certifications - List certifications
   */
  static async getCertifications(req, res) {
    try {
      const { doctor_id } = req.params;

      const doctor = await DoctorModel.getById(doctor_id);
      if (!doctor) {
        return ResponseHelper.notFound(res, 'Doctor not found');
      }

      const certifications = await DoctorModel.getCertifications(doctor_id);
      return ResponseHelper.success(res, certifications, 'Certifications retrieved successfully');
    } catch (error) {
      return ResponseHelper.error(res, error.message, 500);
    }
  }

  /**
   * POST /doctors/:doctor_id/certifications - Add certification
   */
  static async addCertification(req, res) {
    try {
      const { doctor_id } = req.params;
      const {
        cert_name,
        cert_type,
        issued_by,
        issue_date,
        expiry_date,
        file_path
      } = req.body;

      if (!cert_name) {
        return ResponseHelper.error(res, 'Certification name is required', 400);
      }

      const doctor = await DoctorModel.getById(doctor_id);
      if (!doctor) {
        return ResponseHelper.notFound(res, 'Doctor not found');
      }

      const certData = {
        cert_name,
        cert_type,
        issued_by,
        issue_date,
        expiry_date,
        file_path
      };

      const certId = await DoctorModel.addCertification(doctor_id, certData);
      const certifications = await DoctorModel.getCertifications(doctor_id);

      return ResponseHelper.success(res, certifications, 'Certification added successfully', 201);
    } catch (error) {
      return ResponseHelper.error(res, error.message, 500);
    }
  }

  /**
   * DELETE /doctors/:doctor_id/certifications/:cert_id - Remove certification
   */
  static async removeCertification(req, res) {
    try {
      const { doctor_id, cert_id } = req.params;

      const doctor = await DoctorModel.getById(doctor_id);
      if (!doctor) {
        return ResponseHelper.notFound(res, 'Doctor not found');
      }

      const removed = await DoctorModel.removeCertification(doctor_id, cert_id);
      if (!removed) {
        return ResponseHelper.notFound(res, 'Certification not found');
      }

      return ResponseHelper.success(res, null, 'Certification removed successfully');
    } catch (error) {
      return ResponseHelper.error(res, error.message, 500);
    }
  }
}

module.exports = DoctorController;

