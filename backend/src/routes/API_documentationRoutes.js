const express = require("express");
const { getAPIDocumentation } = require("../controllers/optionalController");
const router = express.Router();

// Health check endpoint
router.get("/", getAPIDocumentation);

module.exports = router;
