const medicalCaseModel = require("../models/medicalCaseModel");

exports.createCase = async (req, res) => {
  try {
    const { patient_id, case_title, case_description, target_amount, medical_condition } = req.body;

    if (!patient_id || !case_title || !case_description || !target_amount) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const case_id = await medicalCaseModel.createCase({
      patient_id,
      case_title,
      case_description,
      target_amount,
      medical_condition,
    });

    res.status(201).json({
      message: "Medical case created successfully",
      data: { case_id, patient_id, case_title, target_amount },
    });
  } catch (err) {
    console.error("Error creating case:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getAllCases = async (req, res) => {
  try {
    const cases = await medicalCaseModel.getAllCases();
    res.json(cases);
  } catch (err) {
    console.error("Error fetching cases:", err);
    res.status(500).json({ error: "Failed to get medical cases" });
  }
};

exports.getCaseById = async (req, res) => {
  try {
    const { case_id } = req.params;
    const medicalCase = await medicalCaseModel.getCaseById(case_id);

    if (!medicalCase) {
      return res.status(404).json({ error: "Case not found" });
    }

    res.json(medicalCase);
  } catch (err) {
    console.error("Error fetching case:", err);
    res.status(500).json({ error: "Failed to get medical case" });
  }
};

exports.updateCase = async (req, res) => {
  try {
    const { case_id } = req.params;
    const updated = await medicalCaseModel.updateCase(case_id, req.body);

    if (!updated) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    res.json({ message: "Medical case updated successfully" });
  } catch (err) {
    console.error("Error updating case:", err);
    res.status(500).json({ error: "Failed to update medical case" });
  }
};

exports.deleteCase = async (req, res) => {
  try {
    const { case_id } = req.params;
    const deleted = await medicalCaseModel.deleteCase(case_id);

    if (!deleted) {
      return res.status(404).json({ error: "Case not found" });
    }

    res.json({ message: "Medical case deleted successfully" });
  } catch (err) {
    console.error("Error deleting case:", err);
    res.status(500).json({ error: "Failed to delete medical case" });
  }
};


exports.getUpdatesByCase = async (req, res) => {
  try {
    const { case_id } = req.params;
    const updates = await medicalCaseModel.getUpdatesByCase(case_id);
    res.json(updates);
  } catch (err) {
    console.error("Error fetching updates:", err);
    res.status(500).json({ error: "Failed to get case updates" });
  }
};

exports.createUpdate = async (req, res) => {
  try {
    const { case_id } = req.params;
    const { update_text } = req.body;

    if (!update_text) {
      return res.status(400).json({ error: "Update text is required" });
    }

    const updated_by = req.user?.user_id || null;
    const updateId = await medicalCaseModel.createUpdate(case_id, { update_text, updated_by });

    res.status(201).json({
      message: "Update added successfully",
      data: { updateId },
    });
  } catch (err) {
    console.error("Error creating update:", err);
    res.status(500).json({ error: "Failed to create case update" });
  }
};