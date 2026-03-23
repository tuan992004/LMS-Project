const Notification = require('../modules/Notification');

const getUserNotifications = async (req, res) => {
    try {
        const notifications = await Notification.getUserNotifications(req.user.userid);
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: "Lỗi tải thông báo", error: error.message });
    }
};

const markAsRead = async (req, res) => {
    try {
        const notificationId = req.params.id;
        await Notification.markAsRead(notificationId, req.user.userid);
        res.status(200).json({ message: "Marked as read" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi cập nhật thông báo", error: error.message });
    }
};

const markAllAsRead = async (req, res) => {
    try {
        await Notification.markAllAsRead(req.user.userid);
        res.status(200).json({ message: "All marked as read" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi cập nhật tất cả thông báo", error: error.message });
    }
};

const deleteNotification = async (req, res) => {
    try {
        const notificationId = req.params.id;
        await Notification.delete(notificationId, req.user.userid);
        res.status(200).json({ message: "Deleted notification successfully" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi xóa thông báo", error: error.message });
    }
};

module.exports = {
    getUserNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
};
