const {
  getRoles,
  getPermissionsByRole,
  assignPermission,
  deletePermissionAssignment
} = require("../models/roles_DB");

async function getAllRoles(req, res) {
  try {
    const roles = await getRoles();
    res.json({
      message: "Roles retrieved successfully",
      count: roles.length,
      roles,
    });
  } catch (error) {
    console.error("Error getting roles:", error);
    res.status(500).json({ error: "Failed to retrieve roles" });
  }
}

async function getRolePermissions(req, res) {
  try {
    const { role_id } = req.params;

    const permissions = await getPermissionsByRole(role_id);

    res.json({
      message: "Permissions retrieved successfully",
      role_id,
      count: permissions.length,
      permissions,
    });
  } catch (error) {
    console.error("Error getting role permissions:", error);
    res.status(500).json({ error: "Failed to retrieve permissions" });
  }
}

async function addPermissionToRole(req, res) {
  try {
    const { role_id } = req.params;
    const { permission_id } = req.body;

    if (!permission_id) {
      return res.status(400).json({ error: "permission_id is required" });
    }

    const added = await assignPermission(role_id, permission_id);

    res.json({
      message: "Permission added successfully",
      role_id,
      permission_id,
    });

  } catch (error) {
    console.error("Error adding permission:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "Permission already assigned to role" });
    }

    res.status(500).json({ error: "Failed to add permission" });
  }
}


async function removePermissionFromRole(req, res) {
  try {
    const { role_id, permission_id } = req.params;

    const removed = await deletePermissionAssignment(role_id, permission_id);

    if (!removed) {
      return res.status(404).json({ error: "Permission not found for this role" });
    }

    res.json({
      message: "Permission removed successfully",
      role_id,
      permission_id,
    });

  } catch (error) {
    console.error("Error removing permission:", error);
    res.status(500).json({ error: "Failed to remove permission" });
  }
}

module.exports = {
  getAllRoles,
  getRolePermissions,
  addPermissionToRole,
  removePermissionFromRole,
};
