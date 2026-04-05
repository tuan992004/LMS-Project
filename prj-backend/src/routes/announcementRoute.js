const express = require("express");
const router = express.Router();
const { 
  createAnnouncement, 
  getAnnouncements, 
  getPendingAnnouncements, 
  approveAnnouncement, 
  deleteAnnouncement,
  getAnnouncementById 
} = require("../controllers/announcementController");
// All routes require auth (applied in server.js)


// Public announcements for everyone
router.get("/", getAnnouncements);
router.post("/", createAnnouncement);

// Get pending (Admin only)
router.get("/pending", getPendingAnnouncements);

router.get("/:id", getAnnouncementById);

// Approve (Admin only)
router.patch("/:id/approve", approveAnnouncement);

// Delete (Admin or Owner)
router.delete("/:id", deleteAnnouncement);

module.exports = router;
