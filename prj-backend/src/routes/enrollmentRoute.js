const express = require('express');
const router = express.Router();
const enrollmentCtrl = require('../controllers/enrollmentController');
const authorize = require('../middlewares/authorization');

// --- QUẢN LÝ GHI DANH KHÓA HỌC (ENROLLMENTS) ---

// Xem danh sách khóa học đã Enroll của học sinh (Admin hoặc chính học sinh đó có thể xem)
router.get('/student/:studentId', authorize(['admin', 'instructor', 'student']), enrollmentCtrl.getStudentEnrollments);

// Admin gán danh sách khóa học cho học sinh
router.post('/assign', authorize(['admin']), enrollmentCtrl.assignCourses);

module.exports = router;
