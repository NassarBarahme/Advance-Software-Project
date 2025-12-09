const {
  createMentalSession,
  getSessionById,
  updateMentalSession,
  getAllSessions,
} = require("../models/mentalHealthModel");
const ResponseHelper = require("../utils/responseHelper");

exports.getAllSessions = async (req, res) => {
  try {
    const userId = req.user?.user_id;
    const role = req.user?.role;
    
    // Patients see their own sessions, admins see all
    const sessions = await getAllSessions(userId, role);
    return ResponseHelper.success(res, sessions, 'Mental health sessions retrieved successfully');
  } catch (error) {
    console.error('Error in getAllSessions:', error);
    return ResponseHelper.error(res, error.message, 500);
  }
};

exports.createSession = async (req, res) => {
  try {
    const sessionId = await createMentalSession(req.body);
    const session = await getSessionById(sessionId);
    return ResponseHelper.success(res, session, 'Mental health session created successfully', 201);
  } catch (error) {
    console.error('Error in createSession:', error);
    return ResponseHelper.error(res, error.message, 500);
  }
};

exports.getSession = async (req, res) => {
  try {
    const session = await getSessionById(req.params.session_id);
    if (!session) return ResponseHelper.notFound(res, 'Session not found');
    return ResponseHelper.success(res, session, 'Session retrieved successfully');
  } catch (error) {
    console.error('Error in getSession:', error);
    return ResponseHelper.error(res, error.message, 500);
  }
};

exports.updateSession = async (req, res) => {
  try {
    await updateMentalSession(req.params.session_id, req.body);
    const updatedSession = await getSessionById(req.params.session_id);
    return ResponseHelper.success(res, updatedSession, 'Mental health session updated successfully');
  } catch (error) {
    console.error('Error in updateSession:', error);
    return ResponseHelper.error(res, error.message, 500);
  }
};
