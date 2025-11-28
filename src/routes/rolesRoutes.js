const express = require("express");
const router = express.Router();

const {
  getAllRoles,
  getRolePermissions,
  addPermissionToRole,
 
  removePermissionFromRole
} = require("../controllers/rolesController");

const { authenticateToken, requireRole } = require("../middleware/authenticateToken");


router.get("/test", (req, res) => {
  res.json({ ok: true, route: "roles ok" });
});


router.get("/", authenticateToken, requireRole("admin"), getAllRoles);

router.get("/:role_id/permissions", authenticateToken, requireRole("admin"), getRolePermissions);

router.put("/:role_id/permissions", authenticateToken, requireRole("admin"), addPermissionToRole);




router.delete("/:role_id/permissions/:permission_id", authenticateToken, requireRole("admin"), removePermissionFromRole);

module.exports = router;
