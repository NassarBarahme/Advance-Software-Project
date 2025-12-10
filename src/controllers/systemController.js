const { pool } = require('../config/database');
const ResponseHelper = require('../utils/responseHelper');



// GET /notifications/user_id 
async function getNotificationsController(req, res) {
  try {
    const { user_id } = req.params;
    if (!user_id) return ResponseHelper.validationError(res, [{ field: 'user_id', message: 'User ID is required' }]);

    
    const [rows] = await pool.promise().query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
      [user_id]
    );

    return ResponseHelper.success(res, rows, 'Notifications retrieved successfully');
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return ResponseHelper.error(res, 'Failed to fetch notifications', 500, error.message);
  }
}

// GET /notifications/single/notification_id 
async function getSingleNotificationController(req, res) {
  try {
    const { notification_id } = req.params;
    if (!notification_id) {
      return ResponseHelper.validationError(res, [
        { field: 'notification_id', message: 'Notification ID is required' }
      ]);
    }

    const [rows] = await pool.promise().query(
      'SELECT * FROM notifications WHERE notification_id = ?',
      [notification_id]
    );

    if (rows.length === 0) {
      return ResponseHelper.notFound(res, 'Notification not found');
    }

    return ResponseHelper.success(res, rows[0], 'Notification retrieved successfully');
  } catch (error) {
    console.error('Error fetching single notification:', error);
    return ResponseHelper.error(res, 'Failed to fetch notification', 500, error.message);
  }
}

// PATCH /notifications/notification_id/read (mark notification as read)
async function markNotificationReadController(req, res) {
  try {
    const { notification_id } = req.params;
    if (!notification_id) return ResponseHelper.validationError(res, [{ field: 'notification_id', message: 'Notification ID is required' }]);

    const [result] = await pool.promise().query(
      'UPDATE notifications SET is_read = 1 WHERE notification_id = ?',
      [notification_id]
    );

    if (result.affectedRows === 0) return ResponseHelper.notFound(res, 'Notification not found');

    return ResponseHelper.success(res, { notification_id }, 'Notification marked as read');
  } catch (error) {
    console.error('Error marking notification read:', error);
    return ResponseHelper.error(res, 'Failed to mark notification as read', 500, error.message);
  }
}



// GET /file_uploads/file_id 
async function getFileInfoController(req, res) {
  try {
    const { file_id } = req.params;
    if (!file_id) return ResponseHelper.validationError(res, [{ field: 'file_id', message: 'File ID is required' }]);

    const [rows] = await pool.promise().query('SELECT * FROM file_uploads WHERE file_id = ?', [file_id]);
    if (rows.length === 0) return ResponseHelper.notFound(res, 'File not found');

    return ResponseHelper.success(res, rows[0], 'File info retrieved successfully');
  } catch (error) {
    console.error('Error fetching file info:', error);
    return ResponseHelper.error(res, 'Failed to fetch file info', 500, error.message);
  }
}

// POST /file_uploads
async function uploadFileController(req, res) {
  try {
    const { user_id, file_name, file_path, file_type, file_size, upload_purpose, related_entity_type, related_entity_id } = req.body;

    const errors = [];
    if (!user_id) errors.push({ field: 'user_id', message: 'User ID is required' });
    if (!file_name) errors.push({ field: 'file_name', message: 'File name is required' });
    if (!file_path) errors.push({ field: 'file_path', message: 'File path is required' });
    if (errors.length > 0) return ResponseHelper.validationError(res, errors);

    const [result] = await pool.promise().query(
      `INSERT INTO file_uploads 
      (user_id, file_name, file_path, file_type, file_size, upload_purpose, related_entity_type, related_entity_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [user_id, file_name, file_path, file_type || null, file_size || null, upload_purpose || null, related_entity_type || null, related_entity_id || null]
    );

    return ResponseHelper.success(res, { file_id: result.insertId }, 'File uploaded successfully', 201);
  } catch (error) {
    console.error('Error uploading file:', error);
    return ResponseHelper.error(res, 'Failed to upload file', 500, error.message);
  }
}



// GET /api_logs  (admin only)
async function getApiLogsController(req, res) {
  try {
    const [rows] = await pool.promise().query('SELECT * FROM api_logs ORDER BY created_at DESC');
    return ResponseHelper.success(res, rows, 'API logs retrieved successfully');
  } catch (error) {
    console.error('Error fetching API logs:', error);
    return ResponseHelper.error(res, 'Failed to fetch API logs', 500, error.message);
  }
}

module.exports = {
  getNotificationsController,
  getSingleNotificationController,
  markNotificationReadController,
  getFileInfoController,
  uploadFileController,
  getApiLogsController
};
