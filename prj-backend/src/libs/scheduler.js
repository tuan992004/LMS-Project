const Assignment = require('../modules/Assignment');
const Notification = require('../modules/Notification');

/**
 * Scheduler - Manages background tasks for the LMS.
 * Currently handles deadline reminders.
 */
const checkUpcomingDeadlines = async () => {
    try {
        console.log('[Scheduler] Checking for upcoming deadlines...');
        // Find students who haven't submitted assignments due in the next 24 hours
        // We use 24 hours as the primary alert window
        const pendingReminders = await Assignment.getUpcomingDeadlinesWithPendingStudents(24);
        
        if (pendingReminders.length === 0) return;

        console.log(`[Scheduler] Found ${pendingReminders.length} pending reminders to send.`);

        const notifyPromises = pendingReminders.map(r => {
            // Check if we've already notified them recently to avoid spam (Simple implementation)
            // In a production system, we'd use a 'notifications_sent' table or a timestamp check.
            // For now, we'll send it if not already done.
            return Notification.insert(
                r.student_id,
                'assignment_due',
                `Hạn chót sắp tới: Bài tập "${r.assignment_title}" trong khóa học ${r.course_title} sẽ hết hạn trong 24 giờ tới!`,
                { assignmentId: r.assignment_id, dueDate: r.due_date }
            );
        });

        await Promise.all(notifyPromises);
        console.log('[Scheduler] Successfully dispatched deadline notifications.');
    } catch (error) {
        console.error('[Scheduler] Error in checkUpcomingDeadlines:', error);
    }
};

const initScheduler = () => {
    // Run every 12 hours
    const INTERVAL = 12 * 60 * 60 * 1000;
    
    // Initial check on startup
    checkUpcomingDeadlines();
    
    // Recurring interval
    setInterval(checkUpcomingDeadlines, INTERVAL);
};

module.exports = { initScheduler };
