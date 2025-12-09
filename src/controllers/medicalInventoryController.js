const { addInventory, getInventoryById, updateInventory, deleteInventory } = require("../models/medicalInventoryModel");
const pool = require("../config/database");

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

// Get all inventory items
exports.getAllInventory = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const role = req.user.role;
    
    let query = `SELECT mi.*, u.full_name as provider_name
                 FROM medical_inventory mi
                 LEFT JOIN users u ON mi.provider_id = u.user_id`;
    
    let params = [];
    
    // Filter based on role
    if (role === 'pharmacy') {
      query += ` WHERE mi.provider_id = ?`;
      params.push(userId);
    } else if (role !== 'admin') {
      // Non-admin, non-pharmacy see only their inventory
      query += ` WHERE mi.provider_id = ?`;
      params.push(userId);
    }
    // Admin sees all inventory
    
    query += ` ORDER BY mi.created_at DESC`;
    
    const [inventory] = await pool.query(query, params);
    
    res.json({
      message: "Inventory retrieved successfully",
      inventory
    });
  } catch (err) {
    console.error("Get all inventory error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Delete inventory item
exports.deleteInventory = async (req, res) => {
  try {
    const { inventory_id } = req.params;
    const userId = req.user.user_id;
    const role = req.user.role;

    // Check if item exists and user has permission
    const item = await getInventoryById(inventory_id);
    if (!item) {
      return res.status(404).json({ error: "Inventory item not found" });
    }

    // Only pharmacy owner or admin can delete
    if (role !== 'admin' && item.provider_id !== userId) {
      return res.status(403).json({ error: "You don't have permission to delete this item" });
    }

    const deleted = await deleteInventory(inventory_id);
    if (!deleted) {
      return res.status(404).json({ error: "Failed to delete inventory item" });
    }

    res.json({ message: "Inventory item deleted successfully" });
  } catch (err) {
    console.error("Delete inventory error:", err);
    res.status(500).json({ error: err.message });
  }
};
