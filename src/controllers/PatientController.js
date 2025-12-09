const PatientModel = require('../models/PatientModel');
const ResponseHelper = require('../utils/responseHelper');
const pool = require('../config/database');

class PatientController {

  static async createPatient(req, res) {
    try {
      const {
        patient_id,
        medical_history,
        blood_type,
        chronic_conditions,
        consent_data
      } = req.body;

      
      if (!patient_id) {
        return ResponseHelper.error(res, 'Patient ID is required', 400);
      }

    
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
       
        const updated = await PatientModel.update(patient_id, patientData);
        if (!updated) {
          return ResponseHelper.error(res, 'No valid fields to update', 400);
        }

        const updatedPatient = await PatientModel.getById(patient_id);
        return ResponseHelper.success(res, updatedPatient, 'Patient information updated successfully', 200);
      }

     
      const newPatientData = {
        patient_id,
        ...patientData,
        created_by: req.user?.user_id || null
      };

      await PatientModel.create(newPatientData);
      const newPatient = await PatientModel.getById(patient_id);

      return ResponseHelper.success(res, newPatient, 'Patient created successfully', 201);

    } catch (error) {
      console.error(' Error in createPatient:', error);
      return ResponseHelper.error(res, 'Server error: ' + error.message, 500);
    }
  }


  static async getPatientById(req, res) {
    try {
      const { patient_id } = req.params;
      const userId = req.user?.user_id;

      // Check if user is accessing their own data or is admin
      if (req.user?.role !== 'admin' && parseInt(patient_id) !== parseInt(userId)) {
        return ResponseHelper.error(res, 'Access denied: You can only view your own patient data', 403);
      }

      const patient = await PatientModel.getById(patient_id);
      if (!patient) {
        return ResponseHelper.notFound(res, 'Patient not found');
      }

      return ResponseHelper.success(res, patient, 'Patient retrieved successfully');
    } catch (error) {
      console.error(' Error in getPatientById:', error);
      return ResponseHelper.error(res, error.message, 500);
    }
  }

  static async updatePatient(req, res) {
    try {
      const { patient_id } = req.params;

     
      const exists = await PatientModel.getById(patient_id);
      if (!exists) {
        return ResponseHelper.notFound(res, 'Patient not found');
      }

    
      const updated = await PatientModel.update(patient_id, req.body);
      if (!updated) {
        return ResponseHelper.error(res, 'No valid fields to update', 400);
      }

    
      const updatedPatient = await PatientModel.getById(patient_id);
      return ResponseHelper.success(res, updatedPatient, 'Patient updated successfully');

    } catch (error) {
      console.error(' Error in updatePatient:', error);
      return ResponseHelper.error(res, error.message, 500);
    }
  }

  
  static async deletePatient(req, res) {
    try {
      const { patient_id } = req.params;

      
      const exists = await PatientModel.getById(patient_id);
      if (!exists) {
        return ResponseHelper.notFound(res, 'Patient not found');
      }

    
      const deleted = await PatientModel.delete(patient_id);
      if (!deleted) {
        return ResponseHelper.error(res, 'Failed to delete patient', 500);
      }

      return ResponseHelper.success(res, null, 'Patient deleted successfully');

    } catch (error) {
      console.error(' Error in deletePatient:', error);
      return ResponseHelper.error(res, error.message, 500);
    }
  }


  static async getPatientProfiles(req, res) {
    try {
      const { patient_id } = req.params;
      const userId = req.user?.user_id;

      // Check if user is accessing their own data or is admin
      if (req.user?.role !== 'admin' && parseInt(patient_id) !== parseInt(userId)) {
        return ResponseHelper.error(res, 'Access denied: You can only view your own profiles', 403);
      }

      const exists = await PatientModel.getById(patient_id);
      if (!exists) {
        return ResponseHelper.notFound(res, 'Patient not found');
      }

      const profiles = await PatientModel.getProfiles(patient_id);
      return ResponseHelper.success(res, profiles, 'Patient profiles retrieved successfully');

    } catch (error) {
      console.error(' Error in getPatientProfiles:', error);
      return ResponseHelper.error(res, error.message, 500);
    }
  }


  static async createPatientProfile(req, res) {
    try {
      const { patient_id } = req.params;
      const { goal_amount, story, status } = req.body;
      const userId = req.user?.user_id;

      // Check if user is creating profile for themselves or is admin
      if (req.user?.role !== 'admin' && parseInt(patient_id) !== parseInt(userId)) {
        return ResponseHelper.error(res, 'Access denied: You can only create profiles for yourself', 403);
      }

      const exists = await PatientModel.getById(patient_id);
      if (!exists) {
        return ResponseHelper.notFound(res, 'Patient not found');
      }

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
      console.error(' Error in createPatientProfile:', error);
      return ResponseHelper.error(res, error.message, 500);
    }
  }
}

module.exports = PatientController;
