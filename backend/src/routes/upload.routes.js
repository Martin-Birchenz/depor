const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload.middleware.js");
const { uploadPhoto } = require("../controllers/upload.controller.js");

router.post("/photo", upload.single("photo"), uploadPhoto);

module.exports = router;
