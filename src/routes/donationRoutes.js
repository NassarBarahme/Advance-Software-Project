const express = require("express");
const router = express.Router();

const donationController = require("../controllers/donationController"); 
const { authenticateToken, requireRole } = require("../middleware/authenticateToken");


router.post("/", authenticateToken, donationController.createDonation); 

router.get("/:donation_id", authenticateToken, donationController.getDonationById);

router.put("/:donation_id", authenticateToken, requireRole("admin"), donationController.updateDonation);

router.delete("/:donation_id", authenticateToken, requireRole("admin"), donationController.deleteDonation);

module.exports = router;
