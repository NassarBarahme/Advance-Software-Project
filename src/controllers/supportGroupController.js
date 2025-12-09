const {
  createSupportGroup,
  getSupportGroupById,
  updateSupportGroup,
  deleteSupportGroup,
  getAllSupportGroups,
} = require("../models/supportGroupModel");
const ResponseHelper = require("../utils/responseHelper");

exports.getAllGroups = async (req, res) => {
  try {
    const userId = req.user?.user_id || null;
    const role = req.user?.role || null;
    const groups = await getAllSupportGroups(userId, role);
    return ResponseHelper.success(res, groups, 'Support groups retrieved successfully');
  } catch (error) {
    console.error('Error in getAllGroups:', error);
    return ResponseHelper.error(res, error.message, 500);
  }
};

exports.createGroup = async (req, res) => {
  try {
    const groupId = await createSupportGroup(req.body);
    const group = await getSupportGroupById(groupId);
    return ResponseHelper.success(res, group, 'Support group created successfully', 201);
  } catch (error) {
    console.error('Error in createGroup:', error);
    return ResponseHelper.error(res, error.message, 500);
  }
};

exports.getGroup = async (req, res) => {
  try {
    const group = await getSupportGroupById(req.params.group_id);
    if (!group) {
      return ResponseHelper.notFound(res, 'Support group not found');
    }
    return ResponseHelper.success(res, group, 'Support group retrieved successfully');
  } catch (error) {
    console.error('Error in getGroup:', error);
    return ResponseHelper.error(res, error.message, 500);
  }
};

exports.updateGroup = async (req, res) => {
  try {
    await updateSupportGroup(req.params.group_id, req.body);
    const updatedGroup = await getSupportGroupById(req.params.group_id);
    return ResponseHelper.success(res, updatedGroup, 'Support group updated successfully');
  } catch (error) {
    console.error('Error in updateGroup:', error);
    return ResponseHelper.error(res, error.message, 500);
  }
};

exports.deleteGroup = async (req, res) => {
  try {
    await deleteSupportGroup(req.params.group_id);
    return ResponseHelper.success(res, null, 'Support group deleted successfully');
  } catch (error) {
    console.error('Error in deleteGroup:', error);
    return ResponseHelper.error(res, error.message, 500);
  }
};
