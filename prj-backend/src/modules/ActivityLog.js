const db = require('../libs/db.js');

const ActivityLog = {
    create: async ({ userId, action, ip, details }) => {
        try {
            await db.execute(
                "INSERT INTO activity_logs (user_id, action, ip_address, details) VALUES (?, ?, ?, ?)",
                [userId, action, ip, JSON.stringify(details)]
            );
        } catch (error) {
            console.error("Error creating activity log:", error);
        }
    },



    getByUserId: async (userId, limit = 5) => {
        const [rows] = await db.query(
            "SELECT * FROM activity_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT ?",
            [userId, limit]
        );
        return rows;
    },

    getLogs: async (limit = 50) => {
        const [rows] = await db.query(`
            SELECT al.*, u.fullname, u.role
            FROM activity_logs al
            JOIN users u ON al.user_id = u.userid
            ORDER BY al.created_at DESC
            LIMIT ?
        `, [limit]);
        return rows;
    }
};

module.exports = ActivityLog;
