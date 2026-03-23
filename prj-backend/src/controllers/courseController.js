const Course = require('../modules/Course');
const db = require('../libs/db.js');

const createCourse = async (req, res) => {
    try {
        const { title, description } = req.body;
        const courseid = 'CRS-' + Date.now(); 
        const status = req.user.role === 'admin' ? 'approved' : 'pending';

        await Course.create({
            courseid,
            title,
            description,
            instructor_id: req.user.userid,
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
        const { course_id, lesson_id, title, content } = req.body;
        
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
            attachments: null
        };

        // --- LOGIC UPSERT ---
        if (lesson_id && lesson_id !== 'new') {
            const existing = await Course.getLessonByLessonId(lesson_id);
            if (existing) {
                await Course.updateLesson(lesson_id, data);
                return res.status(200).json({ 
                    message: "Cập nhật bài giảng thành công", 
                    new_lesson_id: lesson_id 
                });
            }
        }

        // Tạo mới bài giảng
        await Course.addLesson(data);
        
        // Lấy lesson_id vừa được tạo (vì lesson_id sinh ra bằng hàm generateLessonId bên trong Model)
        // Chúng ta lấy bản ghi mới nhất của khóa học này
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
        
        // Parse content từ String thành JSON trước khi gửi về Client
        if (typeof lesson.content === 'string') {
            lesson.content = JSON.parse(lesson.content);
        }
        
        res.json(lesson);
    } catch (error) {
        res.status(500).json({ message: "Lỗi lấy chi tiết bài học" });
    }
};

const getAllCourses = async (req, res) => {
    try {
        const courses = await Course.getAllForAdmin();
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: "Lỗi lấy danh sách khóa học" });
    }
};

const getCourseContent = async (req, res) => {
    try {
        const { courseid } = req.params;
        const lessons = await Course.getLessonsByCourse(courseid);
        res.json(lessons);
    } catch (error) {
        res.status(500).json({ message: "Lỗi lấy nội dung bài học" });
    }
};

const deleteCourse = async (req, res) => {
    try {
        const { courseid } = req.params;
        // Giả sử bạn có method delete trong Model Course
        await Course.delete(courseid); 
        res.json({ message: "Xóa khóa học thành công" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi xóa khóa học", error: error.message });
    }
};

module.exports = { 
    createCourse, 
    approveCourse, 
    upsertLesson, 
    getAllCourses, 
    getCourseContent,
    deleteCourse,
    getLessonDetail
};