const db = require("../libs/db");
const Assignment = require("../modules/Assignment");
const Course = require("../modules/Course");
const ActivityLog = require('../modules/ActivityLog');

/**
 * Universal Dashboard Summary Controller
 * Detects user role from JWT and returns role-specific minimal data.
 */
const getDashboardSummary = async (req, res) => {
  const { userid, role } = req.user;

  try {
    // Universal activity feed (max 5 items)
    const [latestAnnouncements] = await db.execute(`
      SELECT a.id, 'announcement' as type, a.title as message, a.created_at, u.fullname as author
      FROM announcements a
      JOIN users u ON a.author_id = u.userid
      WHERE a.status = 'approved'
      ORDER BY a.created_at DESC LIMIT 5
    `);

    let summary = {
      role,
      activity: latestAnnouncements
    };

    if (role === 'student') {
      // 1. Academic Progress (Course Count)
      const [coursesCount] = await db.execute(
        "SELECT COUNT(*) as count FROM enrollments WHERE student_id = ? AND status = 'enrolled'",
        [userid]
      );
      
      // 2. Real Progress Calculation
      const [progressData] = await db.execute(`
        SELECT 
          (SELECT COUNT(*) FROM assignments a JOIN enrollments e ON a.course_id = e.course_id WHERE e.student_id = ?) as total_assignments,
          (SELECT COUNT(DISTINCT s.assignment_id) FROM assignment_submissions s JOIN assignments a ON s.assignment_id = a.id JOIN enrollments e ON a.course_id = e.course_id WHERE s.student_id = ? AND e.student_id = ?) as completed_assignments
      `, [userid, userid, userid]);

      const total = progressData[0].total_assignments || 0;
      const completed = progressData[0].completed_assignments || 0;
      const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

      // 3. Imminent Deadline
      const [deadlines] = await db.execute(
        `SELECT a.title, a.due_date, c.title as course_title 
         FROM assignments a 
         JOIN enrollments e ON a.course_id = e.course_id 
         JOIN courses c ON a.course_id = c.courseid
         WHERE e.student_id = ? AND a.due_date > NOW() 
         ORDER BY a.due_date ASC LIMIT 1`,
        [userid]
      );

      const assignments = await Assignment.getByStudent(userid);
      const lessons = await Course.getScheduledLessonsByStudent(userid);
      
      const calendarEvents = [
        ...assignments.map(a => ({ ...a, type: a.type || 'assignment' })),
        ...lessons.map(l => ({ ...l, due_date: l.scheduled_at, type: 'session' }))
      ];

      const rawActivities = await ActivityLog.getByUserId(userid, 5);
      const recentActivities = rawActivities.map(a => ({
        ...a,
        details: typeof a.details === 'string' ? (() => { try { return JSON.parse(a.details); } catch { return {}; } })() : (a.details || {})
      }));

      summary.data = {
        progress: progressPercent,
        courseCount: coursesCount[0].count,
        nextDeadline: deadlines[0] || null,
        calendarEvents,
        recentActivities
      };

    } else if (role === 'instructor') {
      // 1. Pending Evaluations
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

      // 3. Average Scholar Progress for Teacher's courses
      const [cohortProgress] = await db.execute(`
        SELECT 
            AVG(sub.progress) as avg_progress
        FROM (
            SELECT 
                e.student_id,
                COUNT(DISTINCT s.assignment_id) / NULLIF(COUNT(DISTINCT a.id), 0) * 100 as progress
            FROM enrollments e
            JOIN courses c ON e.course_id = c.courseid
            LEFT JOIN assignments a ON c.courseid = a.course_id
            LEFT JOIN assignment_submissions s ON a.id = s.assignment_id AND e.student_id = s.student_id
            WHERE c.instructor_id = ?
            GROUP BY e.student_id
        ) sub
      `, [userid]);

      const assignments = await Assignment.getByInstructor(userid);
      const lessons = await Course.getScheduledLessonsByInstructor(userid);

      const calendarEvents = [
        ...assignments.map(a => ({ ...a, type: a.type || 'assignment' })),
        ...lessons.map(l => ({ ...l, due_date: l.scheduled_at, type: 'session' }))
      ];

      const rawActivities = await ActivityLog.getByUserId(userid, 5);
      const recentActivities = rawActivities.map(a => ({
        ...a,
        details: typeof a.details === 'string' ? (() => { try { return JSON.parse(a.details); } catch { return {}; } })() : (a.details || {})
      }));

      summary.data = {
        pendingCount: pending[0].count,
        scholarCount: scholars[0].count,
        cohortProgress: Math.round(cohortProgress[0].avg_progress || 0),
        todaySchedule: '14:00 - Advanced Research Lab',
        calendarEvents,
        recentActivities
      };

    } else if (role === 'admin') {
      // 1. System Stats
      const [usersCount] = await db.execute("SELECT COUNT(*) as count FROM users");
      const [pendingCourses] = await db.execute("SELECT COUNT(*) as count FROM courses WHERE status = 'pending'");

      // 2. Global Progress
      const [globalProgress] = await db.execute(`
        SELECT AVG(sub.progress) as avg_progress
        FROM (
            SELECT 
                e.student_id,
                COUNT(DISTINCT s.assignment_id) / NULLIF(COUNT(DISTINCT a.id), 0) * 100 as progress
            FROM enrollments e
            LEFT JOIN courses c ON e.course_id = c.courseid
            LEFT JOIN assignments a ON c.courseid = a.course_id
            LEFT JOIN assignment_submissions s ON a.id = s.assignment_id AND e.student_id = s.student_id
            GROUP BY e.student_id
        ) sub
      `);

      const assignments = await Assignment.getGlobalAssignments();
      const lessons = await Course.getGlobalScheduledLessons();

      const calendarEvents = [
        ...assignments.map(a => ({ ...a, type: a.type || 'assignment' })),
        ...lessons.map(l => ({ ...l, due_date: l.scheduled_at, type: 'session' }))
      ];

      const globalRawActivities = await ActivityLog.getLogs(50);
      const globalActivities = globalRawActivities.map(a => ({
        ...a,
        details: typeof a.details === 'string' ? (() => { try { return JSON.parse(a.details); } catch { return {}; } })() : (a.details || {})
      }));

      summary.data = {
        activeUsers: usersCount[0].count,
        pendingApprovals: pendingCourses[0].count,
        globalProgress: Math.round(globalProgress[0].avg_progress || 0),
        systemEfficiency: Math.min(100, 80 + Math.floor((globalProgress[0].avg_progress || 0) * 0.2)),
        systemStatus: 'NOMINAL',
        calendarEvents,
        globalActivities
      };
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
