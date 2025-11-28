const { createDeliveryMatch, updateDeliveryMatch, deleteDeliveryMatch } = require("../models/deliveryMatchModel");

exports.createDeliveryMatch = async (req, res) => {
  try {
    const id = await createDeliveryMatch(req.body);
    res.status(201).json({ message: "Delivery match created", id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateDeliveryMatch = async (req, res) => {
  try {
    const result = await updateDeliveryMatch(req.params.match_id, req.body);
    res.json({ message: "Updated", result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteDeliveryMatch = async (req, res) => {
  try {
    const deleted = await deleteDeliveryMatch(req.params.match_id);
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
