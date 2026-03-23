const db = require('../libs/db.js');

const Notification = {
    insert: async (user_id, type, message) => {
        return await db.execute(
            "INSERT INTO notifications (user_id, type, message) VALUES (?, ?, ?)",
            [user_id, type, message]
        );
    },
    getUserNotifications: async (user_id) => {
        const [rows] = await db.execute(
            "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC",
            [user_id]
        );
        return rows;
    },
    markAsRead: async (id, user_id) => {
        return await db.execute(
            "UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?",
            [id, user_id]
        );
    },
    markAllAsRead: async (user_id) => {
        return await db.execute(
            "UPDATE notifications SET is_read = TRUE WHERE user_id = ?",
            [user_id]
        );
    },
    delete: async (id, user_id) => {
        return await db.execute(
            "DELETE FROM notifications WHERE id = ? AND user_id = ?",
            [id, user_id]
        );
    }
};

module.exports = Notification;
