const {
  createStaff,
  getStaffByNGO,
  getStaffByUser,
  getStaffById,
  updateStaff,
  deleteStaff
} = require('../models/staff');
const ResponseHelper = require('../utils/responseHelper');
const pool = require('../config/database');

// Create new staff
async function createStaffController(req, res) {
  try {
    const { user_id, ngo_id, role, is_active } = req.body;

    if (!user_id || !ngo_id || !role) {
      return ResponseHelper.validationError(res, [
        { field: 'user_id', message: 'User ID is required' },
        { field: 'ngo_id', message: 'NGO ID is required' },
        { field: 'role', message: 'Role is required' }
      ]);
    }

    const staffId = await createStaff({ user_id, ngo_id, role, is_active: is_active !== undefined ? is_active : true });
    return ResponseHelper.success(res, { staff_id: staffId }, 'Staff created successfully', 201);
  } catch (error) {
    console.error('Error creating Staff:', error);
    return ResponseHelper.error(res, 'Failed to create Staff', 500, error.message);
  }
}

// Get staff by ID
async function getStaffByIdController(req, res) {
  try {
    const { id } = req.params;
    if (!id) return ResponseHelper.validationError(res, [{ field: 'id', message: 'Staff ID is required' }]);

    const staff = await getStaffById(id);
    if (!staff) return ResponseHelper.notFound(res, 'Staff not found');

    return ResponseHelper.success(res, staff, 'Staff retrieved successfully');
  } catch (error) {
    console.error('Error fetching Staff:', error);
    return ResponseHelper.error(res, 'Failed to fetch Staff', 500, error.message);
  }
}

// Update staff
async function updateStaffController(req, res) {
  try {
    const { id } = req.params;
    const { role, is_active } = req.body;

    if (!id) return ResponseHelper.validationError(res, [{ field: 'id', message: 'Staff ID is required' }]);

    const existingStaff = await getStaffById(id);
    if (!existingStaff) return ResponseHelper.notFound(res, 'Staff not found');

    const result = await updateStaff(id, { role, is_active });
    return ResponseHelper.success(res, result, 'Staff updated successfully');
  } catch (error) {
    console.error('Error updating Staff:', error);
    return ResponseHelper.error(res, 'Failed to update Staff', 500, error.message);
  }
}

// Delete staff
async function deleteStaffController(req, res) {
  try {
    const { id } = req.params;
    if (!id) return ResponseHelper.validationError(res, [{ field: 'id', message: 'Staff ID is required' }]);

    const existingStaff = await getStaffById(id);
    if (!existingStaff) return ResponseHelper.notFound(res, 'Staff not found');

    const result = await deleteStaff(id);
    return ResponseHelper.success(res, result, 'Staff deleted successfully');
  } catch (error) {
    console.error('Error deleting Staff:', error);
    return ResponseHelper.error(res, 'Failed to delete Staff', 500, error.message);
  }
}

// Get staff by NGO
async function getStaffByNGOController(req, res) {
  try {
    const { ngoId } = req.params;
    const staff = await getStaffByNGO(ngoId);
    return ResponseHelper.success(res, staff, 'Staff retrieved successfully');
  } catch (error) {
    console.error('Error fetching Staff by NGO:', error);
    return ResponseHelper.error(res, 'Failed to fetch Staff by NGO', 500, error.message);
  }
}

// Get staff by User
async function getStaffByUserController(req, res) {
  try {
    const { userId } = req.params;
    const { is_active, limit = 10, offset = 0 } = req.query;

    if (!userId) return ResponseHelper.validationError(res, [{ field: 'userId', message: 'User ID is required' }]);

    let query = 'SELECT * FROM ngo_staff WHERE user_id = ?';
    const params = [userId];

    if (is_active !== undefined) {
      query += ' AND is_active = ?';
      params.push(is_active === 'true');
    }

    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [rows] = await pool.query(query, params);

    return ResponseHelper.success(res, rows, 'Staff retrieved successfully');
  } catch (error) {
    console.error('Error fetching Staff by User:', error);
    return ResponseHelper.error(res, 'Failed to fetch Staff by User', 500, error.message);
  }
}

// Toggle staff status
async function toggleStaffStatusController(req, res) {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    if (!id) return ResponseHelper.validationError(res, [{ field: 'id', message: 'Staff ID is required' }]);
    if (is_active === undefined) return ResponseHelper.validationError(res, [{ field: 'is_active', message: 'Status is required' }]);

    const existingStaff = await getStaffById(id);
    if (!existingStaff) return ResponseHelper.notFound(res, 'Staff not found');

    const result = await updateStaff(id, { role: existingStaff.role, is_active });
    return ResponseHelper.success(res, result, `Staff ${is_active ? 'activated' : 'deactivated'} successfully`);
  } catch (error) {
    console.error('Error toggling Staff status:', error);
    return ResponseHelper.error(res, 'Failed to toggle Staff status', 500, error.message);
  }
}

module.exports = {
  createStaffController,
  getStaffByIdController,
  updateStaffController,
  deleteStaffController,
  getStaffByNGOController,
  getStaffByUserController,
  toggleStaffStatusController
};
