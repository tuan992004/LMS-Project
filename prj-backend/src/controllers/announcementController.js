const db = require("../libs/db");

// Create an announcement
const createAnnouncement = async (req, res) => {
  const { title, content } = req.body;
  const { userid, role } = req.user;

  if (!title || !content) {
    return res.status(400).json({ message: "Title and content are required" });
  }

  // Admin: 'approved' directly
  // Teacher: 'pending' (wait for Admin approval)
  const status = role === 'admin' ? 'approved' : 'pending';

  try {
    const [result] = await db.execute(
      "INSERT INTO announcements (author_id, title, content, status) VALUES (?, ?, ?, ?)",
      [userid, title, content, status]
    );

    res.status(201).json({
      message: role === 'admin' 
        ? "Announcement published successfully" 
        : "Announcement submitted for admin approval",
      announcementId: result.insertId,
      status
    });
  } catch (error) {
    console.error("Create Announcement Error:", error);
    res.status(500).json({ message: "Failed to create announcement", error: error.message });
  }
};

// Get all approved announcements
const getAnnouncements = async (req, res) => {
  try {
    const [announcements] = await db.execute(`
      SELECT a.*, u.fullname as author_name 
      FROM announcements a 
      JOIN users u ON a.author_id = u.userid 
      WHERE a.status = 'approved' 
      ORDER BY a.created_at DESC
    `);
    res.status(200).json(announcements);
  } catch (error) {
    console.error("Get Announcements Error:", error);
    res.status(500).json({ message: "Failed to fetch announcements" });
  }
};

// Get pending announcements (Admin only)
const getPendingAnnouncements = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "Access denied: Admin only" });
  }

  try {
    const [pending] = await db.execute(`
      SELECT a.*, u.fullname as author_name 
      FROM announcements a 
      JOIN users u ON a.author_id = u.userid 
      WHERE a.status = 'pending' 
      ORDER BY a.created_at DESC
    `);
    res.status(200).json(pending);
  } catch (error) {
    console.error("Get Pending Announcements Error:", error);
    res.status(500).json({ message: "Failed to fetch pending announcements" });
  }
};

// Approve an announcement (Admin only)
const approveAnnouncement = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "Access denied: Admin only" });
  }

  const { id } = req.params;

  try {
    await db.execute("UPDATE announcements SET status = 'approved' WHERE id = ?", [id]);
    res.status(200).json({ message: "Announcement approved successfully" });
  } catch (error) {
    console.error("Approve Announcement Error:", error);
    res.status(500).json({ message: "Failed to approve announcement" });
  }
};

// Delete an announcement
const deleteAnnouncement = async (req, res) => {
  const { id } = req.params;
  const { userid, role } = req.user;

  try {
    // Admins can delete any announcement
    // Teachers/Users might be able to delete their own? Let's stick with Admin only for now, or allow owner too.
    const [announcement] = await db.execute("SELECT * FROM announcements WHERE id = ?", [id]);
    
    if (announcement.length === 0) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    if (role !== 'admin' && announcement[0].author_id !== userid) {
      return res.status(403).json({ message: "Access denied" });
    }

    await db.execute("DELETE FROM announcements WHERE id = ?", [id]);
    res.status(200).json({ message: "Announcement deleted successfully" });
  } catch (error) {
    console.error("Delete Announcement Error:", error);
    res.status(500).json({ message: "Failed to delete announcement" });
  }
};

// Get a single announcement by ID
const getAnnouncementById = async (req, res) => {
  const { id } = req.params;

  try {
    const [announcement] = await db.execute(`
      SELECT a.*, u.fullname as author_name 
      FROM announcements a 
      JOIN users u ON a.author_id = u.userid 
      WHERE a.id = ?
    `, [id]);

    if (announcement.length === 0) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    res.status(200).json(announcement[0]);
  } catch (error) {
    console.error("Get Announcement Detail Error:", error);
    res.status(500).json({ message: "Failed to fetch announcement details" });
  }
};

module.exports = {
  createAnnouncement,
  getAnnouncements,
  getPendingAnnouncements,
  approveAnnouncement,
  deleteAnnouncement,
  getAnnouncementById
};
