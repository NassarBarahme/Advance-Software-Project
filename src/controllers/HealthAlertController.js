const HealthAlertModel = require('../models/HealthAlertModel');
const ResponseHelper = require('../utils/responseHelper');

class HealthAlertController {
  /**
   * POST /health_alerts - Create health alert
   */
  static async createAlert(req, res) {
    try {
      const {
        alert_title,
        alert_content,
        alert_type,
        severity_level,
        affected_areas,
        is_active,
        expires_at
      } = req.body;

      // Validation
      if (!alert_title || !alert_content || !alert_type) {
        return ResponseHelper.error(res, 'Alert title, content, and type are required', 400);
      }

      const validAlertTypes = ['outbreak', 'air_quality', 'emergency', 'prevention', 'general'];
      if (!validAlertTypes.includes(alert_type)) {
        return ResponseHelper.error(res, 'Invalid alert_type', 400);
      }

      const validSeverityLevels = ['info', 'warning', 'urgent', 'critical'];
      if (severity_level && !validSeverityLevels.includes(severity_level)) {
        return ResponseHelper.error(res, 'Invalid severity_level', 400);
      }

      const alertData = {
        alert_title,
        alert_content,
        alert_type,
        severity_level: severity_level || 'info',
        affected_areas: affected_areas || null,
        is_active: is_active !== undefined ? is_active : true,
        expires_at: expires_at || null,
        created_by: req.user?.user_id || 1 // Default to admin if no auth
      };

      const alertId = await HealthAlertModel.create(alertData);
      const alert = await HealthAlertModel.getById(alertId);

      return ResponseHelper.success(res, alert, 'Health alert created successfully', 201);
    } catch (error) {
      return ResponseHelper.error(res, error.message, 500);
    }
  }

  /**
   * GET /health_alerts/:alert_id - Get health alert by ID
   */
  static async getAlertById(req, res) {
    try {
      const { alert_id } = req.params;

      const alert = await HealthAlertModel.getById(alert_id);
      if (!alert) {
        return ResponseHelper.notFound(res, 'Health alert not found');
      }

      return ResponseHelper.success(res, alert, 'Health alert retrieved successfully');
    } catch (error) {
      return ResponseHelper.error(res, error.message, 500);
    }
  }

  /**
   * GET /health_alerts - Get all health alerts with filters
   */
  static async getAllAlerts(req, res) {
    try {
      const filters = {
        alert_type: req.query.alert_type,
        severity_level: req.query.severity_level,
        is_active: req.query.is_active !== undefined ? req.query.is_active === 'true' : undefined,
        include_expired: req.query.include_expired === 'true',
        limit: req.query.limit || 20,
        offset: req.query.offset || 0
      };

      const alerts = await HealthAlertModel.getAll(filters);
      return ResponseHelper.success(res, alerts, 'Health alerts retrieved successfully');
    } catch (error) {
      return ResponseHelper.error(res, error.message, 500);
    }
  }

  /**
   * PATCH /health_alerts/:alert_id - Update health alert
   */
  static async updateAlert(req, res) {
    try {
      const { alert_id } = req.params;

      const alert = await HealthAlertModel.getById(alert_id);
      if (!alert) {
        return ResponseHelper.notFound(res, 'Health alert not found');
      }

      const updated = await HealthAlertModel.update(alert_id, req.body);
      if (!updated) {
        return ResponseHelper.error(res, 'No valid fields to update', 400);
      }

      const updatedAlert = await HealthAlertModel.getById(alert_id);
      return ResponseHelper.success(res, updatedAlert, 'Health alert updated successfully');
    } catch (error) {
      return ResponseHelper.error(res, error.message, 500);
    }
  }

  /**
   * DELETE /health_alerts/:alert_id - Delete health alert
   */
  static async deleteAlert(req, res) {
    try {
      const { alert_id } = req.params;

      const alert = await HealthAlertModel.getById(alert_id);
      if (!alert) {
        return ResponseHelper.notFound(res, 'Health alert not found');
      }

      const deleted = await HealthAlertModel.delete(alert_id);
      if (!deleted) {
        return ResponseHelper.error(res, 'Failed to delete health alert', 500);
      }

      return ResponseHelper.success(res, null, 'Health alert deleted successfully');
    } catch (error) {
      return ResponseHelper.error(res, error.message, 500);
    }
  }
}

module.exports = HealthAlertController;

