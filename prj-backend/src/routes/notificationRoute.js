const express = require('express');
const router = express.Router();
const authorize = require('../middlewares/authorization');
const notifCtrl = require('../controllers/notificationController');

// All roles can access their own notifications
router.get('/', authorize(['admin', 'instructor', 'student']), notifCtrl.getUserNotifications);
router.patch('/read-all', authorize(['admin', 'instructor', 'student']), notifCtrl.markAllAsRead);
router.patch('/:id/read', authorize(['admin', 'instructor', 'student']), notifCtrl.markAsRead);
router.delete('/:id', authorize(['admin', 'instructor', 'student']), notifCtrl.deleteNotification);

module.exports = router;
