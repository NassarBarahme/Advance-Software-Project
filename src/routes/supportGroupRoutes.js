const express = require("express");
const router = express.Router();
const supportGroupController = require("../controllers/supportGroupController");

router.post("/", supportGroupController.createGroup);

router.get("/:group_id", supportGroupController.getGroup);

router.patch("/:group_id", supportGroupController.updateGroup);

router.delete("/:group_id", supportGroupController.deleteGroup);

module.exports = router;
