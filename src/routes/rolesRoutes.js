const express = require("express");
const router = express.Router();

const {
  getAllRoles,
  getRolePermissions,
  addPermissionToRole,
  removePermissionFromRole,
  getAllPermissionsController,
  getMyPermissionsController
} = require("../controllers/rolesController");

const { authenticateToken, requireRole } = require("../middleware/authenticateToken");


router.get("/test", (req, res) => {
  res.json({ ok: true, route: "roles ok" });
});


router.get("/", authenticateToken, requireRole("admin"), getAllRoles);

// Get all available permissions (admin only)
router.get("/permissions/all", authenticateToken, requireRole("admin"), getAllPermissionsController);

// Get current user's permissions
router.get("/permissions/me", authenticateToken, getMyPermissionsController);

router.get("/:role_id/permissions", authenticateToken, requireRole("admin"), getRolePermissions);

router.put("/:role_id/permissions", authenticateToken, requireRole("admin"), addPermissionToRole);




router.delete("/:role_id/permissions/:permission_id", authenticateToken, requireRole("admin"), removePermissionFromRole);

module.exports = router;