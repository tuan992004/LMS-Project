const Course = require('../modules/Course');
const db = require('../libs/db.js');

const createCourse = async (req, res) => {
    try {
        const { title, description } = req.body;
        const courseid = 'CRS-' + Date.now(); 
        const status = req.user.role === 'admin' ? 'approved' : 'pending';

        const instructor_id = req.user.role === 'admin' && req.body.instructor_id 
            ? req.body.instructor_id 
            : req.user.userid;

        await Course.create({
            courseid,
            title,
            description,
            instructor_id,
            status
        });

        if (status === 'pending') {
            const User = require('../modules/User');
            const Notification = require('../modules/Notification');
            const users = await User.findAll();
            const admins = users.filter(u => u.role === 'admin');
            for (const admin of admins) {
                await Notification.insert(
                    admin.userid, 
                    'COURSE_APPROVAL', 
                    `Giảng viên ${req.user.fullname || req.user.username} vừa đề xuất khóa học mới: "${title}".`
                );
            }
        }

        const msg = status === 'approved' ? "Tạo khóa học thành công" : "Đã gửi đề xuất khóa học tới Admin";
        res.status(201).json({ message: msg, courseid });
    } catch (error) {
        res.status(500).json({ message: "Lỗi tạo khóa học", error: error.message });
    }
};

const approveCourse = async (req, res) => {
    try {
        const { courseid } = req.params;
        const { status } = req.body; // 'approved' hoặc 'pending'
        await Course.updateStatus(courseid, status);

        const Notification = require('../modules/Notification');
        const course = await Course.findById(courseid);
        if (course && course.instructor_id) {
            const statusMsg = status === 'approved' ? 'đã được duyệt' : 'bị từ chối hoặc chuyển về Pending';
            await Notification.insert(
                course.instructor_id,
                'COURSE_APPROVAL',
                `Khóa học "${course.title}" của bạn ${statusMsg}.`
            );
        }

        res.json({ message: `Trạng thái khóa học đã chuyển thành: ${status}` });
    } catch (error) {
        res.status(500).json({ message: "Lỗi phê duyệt" });
    }
};

const upsertLesson = async (req, res) => {
    try {
        const { course_id, lesson_id, title, content, scheduled_at } = req.body;
        
        // Kiểm tra an toàn cho content
        let contentArray = [];
        try {
            contentArray = typeof content === 'string' ? JSON.parse(content) : content;
        } catch (e) {
            return res.status(400).json({ message: "Định dạng nội dung không hợp lệ" });
        }

        const processedContent = contentArray.map(block => {
            if (block.fileKey && req.files) {
                const uploadedFile = req.files.find(f => f.fieldname === block.fileKey);
                if (uploadedFile) {
                    return {
                        type: block.type,
                        value: `/uploads/${uploadedFile.filename}` 
                    };
                }
            }
            return block;
        });

        const data = {
            course_id,
            title,
            content: JSON.stringify(processedContent),
            video_url: null,
            attachments: null,
            scheduled_at: scheduled_at || null
        };

        // --- LOGIC UPSERT ---
        if (lesson_id && lesson_id !== 'new') {
            const existing = await Course.getLessonByLessonId(lesson_id);
            if (existing) {
                // Verify ownership for instructors
                if (req.user.role === 'instructor') {
                    const course = await Course.findById(existing.course_id);
                    if (course.instructor_id !== req.user.userid) {
                        return res.status(403).json({ message: "Bạn không có quyền chỉnh sửa bài giảng này" });
                    }
                }
                
                await Course.updateLesson(lesson_id, data);
                return res.status(200).json({ 
                    message: "Cập nhật bài giảng thành công", 
                    new_lesson_id: lesson_id 
                });
            }
        }

        // Verify ownership for instructors when adding new lesson
        const parentCourse = await Course.findById(course_id);
        if (req.user.role === 'instructor' && parentCourse.instructor_id !== req.user.userid) {
            return res.status(403).json({ message: "Bạn không có quyền thêm bài giảng cho khóa học này" });
        }

        // Tạo mới bài giảng
        await Course.addLesson(data);
        
        // Lấy lesson_id vừa được tạo
        const [rows] = await db.execute(
            "SELECT lesson_id FROM lessons WHERE course_id = ? ORDER BY id DESC LIMIT 1",
            [course_id]
        );
        
        const new_id = rows[0]?.lesson_id;

        return res.status(201).json({ 
            message: "Tạo bài giảng mới thành công", 
            new_lesson_id: new_id 
        });

    } catch (error) {
        console.error("Controller Error:", error);
        res.status(500).json({ message: "Lỗi hệ thống khi xử lý bài giảng", error: error.message });
    }
};

const getLessonDetail = async (req, res) => {
    try {
        const { lesson_id } = req.params;
        // Gọi thông qua Model thay vì gọi db trực tiếp ở đây
        const lesson = await Course.getLessonByLessonId(lesson_id);
        
        if (!lesson) return res.status(404).json({ message: "Không tìm thấy bài học" });
        
        // Verify ownership for instructors
        if (req.user.role === 'instructor') {
            const course = await Course.findById(lesson.course_id);
            if (course.instructor_id !== req.user.userid) {
                return res.status(403).json({ message: "Bạn không có quyền truy cập bài giảng này" });
            }
        }

        // Parse content từ String thành JSON trước khi gửi về Client
        if (typeof lesson.content === 'string') {
            lesson.content = JSON.parse(lesson.content);
        }

        // --- ACTIVITY LOG: Log lesson visit ---
        if (req.user && req.user.role === 'student') {
            const ActivityLog = require('../modules/ActivityLog');
            await ActivityLog.create({
                userId: req.user.userid,
                action: 'visit_lesson',
                ip: req.ip || '127.0.0.1',
                details: {
                    lessonId: lesson.lesson_id,
                    lessonTitle: lesson.title,
                    courseId: lesson.course_id
                }
            });
        }
        
        res.json(lesson);
    } catch (error) {
        console.error("Get Lesson Detail Error:", error);
        res.status(500).json({ message: "Lỗi lấy chi tiết bài học" });
    }
};

const getAllCourses = async (req, res) => {
    try {
        let courses;
        if (req.user.role === 'admin') {
            courses = await Course.getAllForAdmin();
        } else {
            courses = await Course.getByInstructorId(req.user.userid);
        }
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: "Lỗi lấy danh sách khóa học" });
    }
};

const getCourseContent = async (req, res) => {
    try {
        const { courseid } = req.params;
        
        // Verify ownership for instructors
        if (req.user.role === 'instructor') {
            const course = await Course.findById(courseid);
            if (!course || course.instructor_id !== req.user.userid) {
                return res.status(403).json({ message: "Bạn không có quyền truy cập khóa học này" });
            }
        }

        const lessons = await Course.getLessonsByCourse(courseid);
        res.json(lessons);
    } catch (error) {
        res.status(500).json({ message: "Lỗi lấy nội dung bài học" });
    }
};

const getCourseDetail = async (req, res) => {
    try {
        const { courseid } = req.params;
        const course = await Course.findById(courseid);
        if (!course) {
            return res.status(404).json({ message: "Không tìm thấy khóa học" });
        }
        res.json(course);
    } catch (error) {
        res.status(500).json({ message: "Lỗi lấy chi tiết khóa học" });
    }
};

const getMyEnrolledCourses = async (req, res) => {
    try {
        const Enrollment = require('../modules/Enrollment');
        const studentId = req.user.userid;
        const enrollments = await Enrollment.getByStudentId(studentId);
        
        // Extract course info from enrollments
        const courses = enrollments.map(e => ({
            courseid: e.course_id,
            title: e.title,
            description: e.description,
            instructor_id: e.instructor_id,
            status: e.course_status,
            enrollment_status: e.status
        }));
        
        res.json(courses);
    } catch (error) {
        console.error("Error fetching my enrolled courses:", error);
        res.status(500).json({ message: "Lỗi lấy danh sách khóa học của bạn" });
    }
};

const deleteLesson = async (req, res) => {
    try {
        const { lesson_id } = req.params;
        
        // Verify ownership for instructors
        if (req.user.role === 'instructor') {
            const lesson = await Course.getLessonByLessonId(lesson_id);
            if (lesson) {
                const course = await Course.findById(lesson.course_id);
                if (course.instructor_id !== req.user.userid) {
                    return res.status(403).json({ message: "Bạn không có quyền xóa bài giảng này" });
                }
            }
        }

        await Course.deleteLesson(lesson_id);
        res.json({ message: "Xóa bài giảng thành công" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi xóa bài giảng", error: error.message });
    }
};

const deleteCourse = async (req, res) => {
    try {
        const { courseid } = req.params;
        
        // Verify ownership for instructors
        if (req.user.role === 'instructor') {
            const course = await Course.findById(courseid);
            if (!course || course.instructor_id !== req.user.userid) {
                return res.status(403).json({ message: "Bạn không có quyền xóa khóa học này" });
            }
        }

        await Course.delete(courseid); 
        res.json({ message: "Xóa khóa học thành công" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi xóa khóa học", error: error.message });
    }
};

const assignInstructor = async (req, res) => {
    try {
        const { courseid } = req.params;
        const { instructor_id } = req.body;

        if (!instructor_id) {
            return res.status(400).json({ message: "Thiếu ID giảng viên" });
        }

        // Update course
        await Course.updateInstructor(courseid, instructor_id);

        // Fetch course and instructor details for notification
        const course = await Course.findById(courseid);
        const User = require('../modules/User');
        const Notification = require('../modules/Notification');
        const instructor = await User.findById(instructor_id);

        if (instructor) {
            await Notification.insert(
                instructor_id,
                'COURSE_ASSIGNED',
                `Bạn đã được chỉ định là giảng viên cho khóa học: "${course.title}".`
            );
        }

        res.json({ message: "Chỉ định giảng viên thành công" });
    } catch (error) {
        console.error("Assign Instructor Error:", error);
        res.status(500).json({ message: "Lỗi khi chỉ định giảng viên" });
    }
};

module.exports = { 
    createCourse, 
    approveCourse, 
    upsertLesson, 
    getAllCourses, 
    getCourseContent,
    deleteCourse,
    getLessonDetail,
    getMyEnrolledCourses,
    deleteLesson,
    assignInstructor,
    getCourseDetail
};