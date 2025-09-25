const express = require("express");
const { getHealthStatus } = require("../controllers/optionalController");
const router = express.Router();

// Health check endpoint
router.get("/", getHealthStatus);

module.exports = router;
