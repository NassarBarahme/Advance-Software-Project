const express = require("express");
const router = express.Router();
const { createDeliveryMatch, updateDeliveryMatch, deleteDeliveryMatch } = require("../controllers/deliveryMatchController");

router.post("/", createDeliveryMatch);


router.patch("/:match_id", updateDeliveryMatch);


router.delete("/:match_id", deleteDeliveryMatch);

module.exports = router;
