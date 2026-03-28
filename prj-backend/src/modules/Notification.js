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
            "SELECT * FROM notifications WHERE user_id = ? AND deleted_at IS NULL ORDER BY created_at DESC",
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
            "UPDATE notifications SET is_read = TRUE WHERE user_id = ? AND deleted_at IS NULL",
            [user_id]
        );
    },
    delete: async (id, user_id) => {
        return await db.execute(
            "UPDATE notifications SET deleted_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?",
            [id, user_id]
        );
    },
    restore: async (id, user_id) => {
        return await db.execute(
            "UPDATE notifications SET deleted_at = NULL WHERE id = ? AND user_id = ?",
            [id, user_id]
        );
    },
    deleteAll: async (user_id) => {
        return await db.execute(
            "UPDATE notifications SET deleted_at = CURRENT_TIMESTAMP WHERE user_id = ? AND deleted_at IS NULL",
            [user_id]
        );
    }
};

module.exports = Notification;
