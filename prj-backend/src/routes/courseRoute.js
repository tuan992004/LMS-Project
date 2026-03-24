// src/routes/courseRoute.js
const express = require('express');
const router = express.Router();
const upload = require('../middlewares/uploadMiddleware');
const courseCtrl = require('../controllers/courseController');
const authorize = require('../middlewares/authorization');

// --- QUẢN LÝ BÀI GIẢNG (LESSONS) ---

// Route này dùng để upload file (Video + Docs)
router.post('/lessons', authorize(['admin', 'instructor']), upload.any(), courseCtrl.upsertLesson);
router.put('/lessons', authorize(['admin', 'instructor']), upload.any(), courseCtrl.upsertLesson);


// --- QUẢN LÝ KHÓA HỌC (COURSES) ---

// Lấy tất cả khóa học (Cho trang Dashboard/Management)
router.get('/', authorize(['admin', 'instructor']), courseCtrl.getAllCourses);

// Instructor tạo đề xuất khóa học mới
router.post('/create', authorize(['admin', 'instructor']), courseCtrl.createCourse);
router.delete('/:courseid', authorize(['admin','instructor']), courseCtrl.deleteCourse);

// Admin duyệt/thay đổi trạng thái khóa học
router.patch('/approve/:courseid', authorize(['admin']), courseCtrl.approveCourse);


// --- DÀNH CHO HỌC SINH (STUDENTS) ---

// Xem nội dung bài giảng của một khóa học
router.get('/content/:courseid', authorize(['student', 'instructor', 'admin']), courseCtrl.getCourseContent);

router.get('/my-enrolled', authorize(['student', 'instructor', 'admin']), courseCtrl.getMyEnrolledCourses);

router.get('/lessons/detail/:lesson_id', authorize(['student', 'instructor', 'admin']), courseCtrl.getLessonDetail);

module.exports = router;