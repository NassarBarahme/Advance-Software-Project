const express = require("express");
const router = express.Router();
const medicalCaseController = require("../controllers/medicalCaseController");
const donationController = require("../controllers/donationController");
const { authenticateToken, requireRole } = require("../middleware/authenticateToken");

const allowRoles = (...roles) => (req, res, next) => {
  if (req.user && roles.includes(req.user.role)) return next();
  return res.status(403).json({ error: "Access denied: insufficient permissions" });
};

router.post("/", authenticateToken, requireRole("patient"), medicalCaseController.createCase);
router.get("/", authenticateToken, requireRole("admin"), medicalCaseController.getAllCases);
router.get("/:case_id", authenticateToken, medicalCaseController.getCaseById);
router.put("/:case_id", authenticateToken, medicalCaseController.updateCase);
router.delete("/:case_id", authenticateToken, requireRole("admin"), medicalCaseController.deleteCase);

router.get("/:case_id/updates", authenticateToken, medicalCaseController.getUpdatesByCase);
router.post("/:case_id/updates", authenticateToken, allowRoles("doctor", "ngo"), medicalCaseController.createUpdate);


router.get("/:case_id/donations", authenticateToken, donationController.getDonationsByCase);

module.exports = router;
