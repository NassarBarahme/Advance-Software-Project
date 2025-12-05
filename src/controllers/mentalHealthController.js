const {
  createMentalSession,
  getSessionById,
  updateMentalSession,
} = require("../models/mentalHealthModel");

exports.createSession = async (req, res) => {
  try {
    const sessionId = await createMentalSession(req.body);
    res.status(201).json({ message: "Mental health session created", id: sessionId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSession = async (req, res) => {
  try {
    const session = await getSessionById(req.params.session_id);
    if (!session) return res.status(404).json({ error: "Session not found" });
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateSession = async (req, res) => {
  try {
    await updateMentalSession(req.params.session_id, req.body);
    res.json({ message: "Mental health session updated" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
