const {
  createSupportGroup,
  getSupportGroupById,
  updateSupportGroup,
  deleteSupportGroup,
} = require("../models/supportGroupModel");

exports.createGroup = async (req, res) => {
  try {
    const groupId = await createSupportGroup(req.body);
    res.status(201).json({ message: "Support group created", id: groupId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getGroup = async (req, res) => {
  try {
    const group = await getSupportGroupById(req.params.group_id);
    if (!group) return res.status(404).json({ error: "Support group not found" });
    res.json(group);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateGroup = async (req, res) => {
  try {
    await updateSupportGroup(req.params.group_id, req.body);
    res.json({ message: "Support group updated" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteGroup = async (req, res) => {
  try {
    await deleteSupportGroup(req.params.group_id);
    res.json({ message: "Support group deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
