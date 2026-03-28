const db = require("../libs/db");

/**
 * Universal Dashboard Summary Controller
 * Detects user role from JWT and returns role-specific minimal data.
 */
const getDashboardSummary = async (req, res) => {
  const { userid, role } = req.user;

  try {
    let summary = {
      role,
      activity: [] // Universal activity feed (max 3 items)
    };

    if (role === 'student') {
      // 1. Academic Progress (Course Count)
      const [coursesCount] = await db.execute(
        "SELECT COUNT(*) as count FROM enrollments WHERE student_id = ? AND status = 'enrolled'",
        [userid]
      );
      
      // 2. Imminent Deadline (Using assignments table defined in db.js)
      const [deadlines] = await db.execute(
        `SELECT a.title, a.due_date, c.title as course_title 
         FROM assignments a 
         JOIN enrollments e ON a.course_id = e.course_id 
         JOIN courses c ON a.course_id = c.courseid
         WHERE e.student_id = ? AND a.due_date > NOW() 
         ORDER BY a.due_date ASC LIMIT 1`,
        [userid]
      );

      summary.data = {
        progress: 65, // Mocked percentage
        courseCount: coursesCount[0].count,
        nextDeadline: deadlines[0] || null
      };

      summary.activity = [
        { id: 1, type: 'announcement', message: 'New curriculum update available.' },
        { id: 2, type: 'grade', message: 'Final grade published for Economics 101.' }
      ];

    } else if (role === 'instructor') {
      // 1. Pending Evaluations (Using assignment_submissions table defined in db.js)
      const [pending] = await db.execute(
        `SELECT COUNT(*) as count 
         FROM assignment_submissions s 
         JOIN assignments a ON s.assignment_id = a.id 
         JOIN courses c ON a.course_id = c.courseid 
         WHERE c.instructor_id = ? AND s.status = 'submitted'`,
        [userid]
      );

      // 2. Active Scholars
      const [scholars] = await db.execute(
        `SELECT COUNT(DISTINCT e.student_id) as count 
         FROM enrollments e 
         JOIN courses c ON e.course_id = c.courseid 
         WHERE c.instructor_id = ?`,
        [userid]
      );

      summary.data = {
        pendingCount: pending[0].count,
        scholarCount: scholars[0].count,
        todaySchedule: '14:00 - Advanced Research Lab'
      };

      summary.activity = [
        { id: 1, type: 'submission', message: 'New submissions awaiting review.' },
        { id: 2, type: 'system', message: 'Infrastructure integrity verified.' }
      ];

    } else if (role === 'admin') {
      // 1. System Stats
      const [usersCount] = await db.execute("SELECT COUNT(*) as count FROM users");
      const [pendingCourses] = await db.execute("SELECT COUNT(*) as count FROM courses WHERE status = 'pending'");

      summary.data = {
        activeUsers: usersCount[0].count,
        pendingApprovals: pendingCourses[0].count,
        systemStatus: 'NOMINAL'
      };

      summary.activity = [
        { id: 1, type: 'security', message: 'System-wide firewall update complete.' },
        { id: 2, type: 'audit', message: 'Automated database prune successful.' }
      ];
    }

    return res.status(200).json(summary);

  } catch (error) {
    console.error("Dashboard Summary Error:", error);
    // Include more error info in dev if needed, but for now just log it
    return res.status(500).json({ 
      message: "Internal synchronization error",
      error: error.message // Sending message back to help debug frontend
    });
  }
};

module.exports = {
  getDashboardSummary
};
