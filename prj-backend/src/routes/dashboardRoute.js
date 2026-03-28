const express = require("express");
const router = express.Router();
const { getDashboardSummary } = require("../controllers/dashboardController");
const authMiddleware = require("../middlewares/authMiddleware");

// Universal Summary Route (Role-Aware via JWT)
router.get("/summary", authMiddleware, getDashboardSummary);

module.exports = router;
