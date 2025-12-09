const PatientModel = require('../models/PatientModel');
const ResponseHelper = require('../utils/responseHelper');
const pool = require('../config/database');

class PatientController {
  /**
   * POST /patients - Create new patient
   */
  static async createPatient(req, res) {
    try {
      const {
        patient_id,
        medical_history,
        blood_type,
        chronic_conditions,
        consent_data
      } = req.body;

      // Validation
      if (!patient_id) {
        return ResponseHelper.error(res, 'Patient ID is required', 400);
      }

      // Verify that user exists and has patient role
      const [users] = await pool.query(
        `SELECT u.*, r.name AS role_name
         FROM users u
         JOIN roles r ON u.role_id = r.role_id
         WHERE u.user_id = ?`,
        [patient_id]
      );

      if (!users.length) {
        return ResponseHelper.error(res, 'User not found', 404);
      }

      if (users[0].role_name !== 'patient') {
        return ResponseHelper.error(res, 'This user is not a patient', 400);
      }

      // Check if patient already exists in patients table
      const [existing] = await pool.query(
        `SELECT patient_id FROM patients WHERE patient_id = ?`,
        [patient_id]
      );

      const patientData = {
        medical_history,
        blood_type,
        chronic_conditions,
        consent_data
      };

      if (existing.length > 0) {
        // Patient exists (even if empty from register) → UPDATE
        const updated = await PatientModel.update(patient_id, patientData);
        if (!updated) {
          return ResponseHelper.error(res, 'No valid fields to update', 400);
        }

        const updatedPatient = await PatientModel.getById(patient_id);
        return ResponseHelper.success(res, updatedPatient, 'Patient information updated successfully', 200);
      }

      // Patient doesn't exist → CREATE
      const newPatientData = {
        patient_id,
        ...patientData,
        created_by: req.user?.user_id || null
      };

      await PatientModel.create(newPatientData);
      const newPatient = await PatientModel.getById(patient_id);

      return ResponseHelper.success(res, newPatient, 'Patient created successfully', 201);

    } catch (error) {
      console.error('❌ Error in createPatient:', error);
      return ResponseHelper.error(res, 'Server error: ' + error.message, 500);
    }
  }

  /**
   * GET /patients/:patient_id - Get patient details
   */
  static async getPatientById(req, res) {
    try {
      const { patient_id } = req.params;

      const patient = await PatientModel.getById(patient_id);
      if (!patient) {
        return ResponseHelper.notFound(res, 'Patient not found');
      }

      return ResponseHelper.success(res, patient, 'Patient retrieved successfully');
    } catch (error) {
      console.error('❌ Error in getPatientById:', error);
      return ResponseHelper.error(res, error.message, 500);
    }
  }

  /**
   * PATCH /patients/:patient_id - Update patient info
   */
  static async updatePatient(req, res) {
    try {
      const { patient_id } = req.params;

      // Check if patient exists
      const exists = await PatientModel.getById(patient_id);
      if (!exists) {
        return ResponseHelper.notFound(res, 'Patient not found');
      }

      // Update patient
      const updated = await PatientModel.update(patient_id, req.body);
      if (!updated) {
        return ResponseHelper.error(res, 'No valid fields to update', 400);
      }

      // Get updated patient
      const updatedPatient = await PatientModel.getById(patient_id);
      return ResponseHelper.success(res, updatedPatient, 'Patient updated successfully');

    } catch (error) {
      console.error('❌ Error in updatePatient:', error);
      return ResponseHelper.error(res, error.message, 500);
    }
  }

  /**
   * DELETE /patients/:patient_id - Delete patient
   */
  static async deletePatient(req, res) {
    try {
      const { patient_id } = req.params;

      // Check if patient exists
      const exists = await PatientModel.getById(patient_id);
      if (!exists) {
        return ResponseHelper.notFound(res, 'Patient not found');
      }

      // Delete patient
      const deleted = await PatientModel.delete(patient_id);
      if (!deleted) {
        return ResponseHelper.error(res, 'Failed to delete patient', 500);
      }

      return ResponseHelper.success(res, null, 'Patient deleted successfully');

    } catch (error) {
      console.error('❌ Error in deletePatient:', error);
      return ResponseHelper.error(res, error.message, 500);
    }
  }

  /**
   * GET /patients/:patient_id/profiles - List patient fundraising profiles
   */
  static async getPatientProfiles(req, res) {
    try {
      const { patient_id } = req.params;

      // Check if patient exists
      const exists = await PatientModel.getById(patient_id);
      if (!exists) {
        return ResponseHelper.notFound(res, 'Patient not found');
      }

      // Get profiles
      const profiles = await PatientModel.getProfiles(patient_id);
      return ResponseHelper.success(res, profiles, 'Patient profiles retrieved successfully');

    } catch (error) {
      console.error('❌ Error in getPatientProfiles:', error);
      return ResponseHelper.error(res, error.message, 500);
    }
  }

  /**
   * POST /patients/:patient_id/profiles - Create patient fundraising profile
   */
  static async createPatientProfile(req, res) {
    try {
      const { patient_id } = req.params;
      const { goal_amount, story, status } = req.body;

      // Check patient exists
      const exists = await PatientModel.getById(patient_id);
      if (!exists) {
        return ResponseHelper.notFound(res, 'Patient not found');
      }

      // Basic validation
      if (!goal_amount && !story) {
        return ResponseHelper.error(res, 'Goal amount or story is required', 400);
      }

      const validStatus = ['active', 'completed', 'paused'];
      if (status && !validStatus.includes(status)) {
        return ResponseHelper.error(res, 'Invalid status value', 400);
      }

      const profile = await PatientModel.createProfile(patient_id, {
        goal_amount,
        story,
        status
      });

      return ResponseHelper.success(res, profile, 'Patient profile created successfully', 201);
    } catch (error) {
      console.error('❌ Error in createPatientProfile:', error);
      return ResponseHelper.error(res, error.message, 500);
    }
  }
}

module.exports = PatientController;
