const { addInventory, getInventoryById, updateInventory } = require("../models/medicalInventoryModel");

exports.addInventory = async (req, res) => {
  try {
    const id = await addInventory(req.body);
    res.status(201).json({ message: "Item added", id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getInventoryById = async (req, res) => {
  try {
    const item = await getInventoryById(req.params.inventory_id);
    if (!item) return res.status(404).json({ error: "Not found" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateInventory = async (req, res) => {
  try {
    const result = await updateInventory(req.params.inventory_id, req.body);
    res.json({ message: "Updated", result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
