const { createRequest, getRequestById, updateRequest } = require("../models/medicationRequestModel");

exports.createRequest = async (req, res) => {
  try {
    const id = await createRequest(req.body);
    res.status(201).json({ message: "Request created", id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getRequestById = async (req, res) => {
  try {
    const request = await getRequestById(req.params.request_id);
    if (!request) return res.status(404).json({ error: "Not found" });
    res.json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateRequest = async (req, res) => {
  try {
    const result = await updateRequest(req.params.request_id, req.body);
    res.json({ message: "Updated", result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
