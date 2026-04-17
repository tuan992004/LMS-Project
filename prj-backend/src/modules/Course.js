const db = require('../libs/db.js');
const { generateLessonId } = require('../controllers/generateLessonId.js');

const Course = {
    // --- KHÓA HỌC (COURSES) ---
    create: async (data) => {
        const { courseid, title, description, instructor_id, status } = data;
        const initialStatus = status || 'pending';
        return await db.execute(
            "INSERT INTO courses (courseid, title, description, instructor_id, status) VALUES (?, ?, ?, ?, ?)",
            [courseid, title, description, instructor_id, initialStatus]
        );
    },

    findById: async (courseid) => {
        const [rows] = await db.execute("SELECT * FROM courses WHERE courseid = ?", [courseid]);
        return rows[0];
    },

    getAllForAdmin: async () => {
        const [rows] = await db.execute("SELECT * FROM courses ORDER BY created_at DESC");
        return rows;
    },

    getByInstructorId: async (instructorId) => {
        const [rows] = await db.execute(
            "SELECT * FROM courses WHERE instructor_id = ? ORDER BY created_at DESC",
            [instructorId]
        );
        return rows;
    },

    updateStatus: async (courseid, status) => {
        return await db.execute("UPDATE courses SET status = ? WHERE courseid = ?", [status, courseid]);
    },

    updateInstructor: async (courseid, instructor_id) => {
        return await db.execute(
            "UPDATE courses SET instructor_id = ? WHERE courseid = ?",
            [instructor_id, courseid]
        );
    },

    delete: async (courseid) => {
        return await db.execute("DELETE FROM courses WHERE courseid = ?", [courseid]);
    },

    // --- BÀI GIẢNG (LESSONS) ---
    addLesson: async (data) => {
        const { course_id, title, content, video_url, attachments, scheduled_at } = data;
        const lesson_id = await generateLessonId(course_id); 
        
        return await db.execute(
            "INSERT INTO lessons (lesson_id, course_id, title, content, video_url, attachments, scheduled_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [lesson_id, course_id, title, content, video_url, attachments ? JSON.stringify(attachments) : null, scheduled_at || null]
        );
    },

    updateLesson: async (lesson_id, data) => {
        const { title, content, video_url, attachments, scheduled_at } = data;
        // Luôn sử dụng lesson_id (chuỗi) để đồng bộ với Frontend
        return await db.execute(
            "UPDATE lessons SET title=?, content=?, video_url=?, attachments=?, scheduled_at=? WHERE lesson_id=?",
            [title, content, video_url, attachments ? JSON.stringify(attachments) : null, scheduled_at || null, lesson_id]
        );
    },

    getLessonByLessonId: async (lesson_id) => {
        const [rows] = await db.execute("SELECT * FROM lessons WHERE lesson_id = ?", [lesson_id]);
        return rows[0];
    },

    getLessonById: async (lessonId) => {
        // Alias cho getLessonByLessonId để controller không bị lỗi gọi hàm
        const [rows] = await db.execute("SELECT * FROM lessons WHERE lesson_id = ?", [lessonId]);
        return rows[0];
    },

    getLessonsByCourse: async (courseid) => {
        const [rows] = await db.execute("SELECT * FROM lessons WHERE course_id = ?", [courseid]);
        return rows;
    },

    deleteLesson: async (lesson_id) => {
        return await db.execute("DELETE FROM lessons WHERE lesson_id = ?", [lesson_id]);
    },

    getScheduledLessonsByInstructor: async (instructorId) => {
        const query = `
            SELECT l.*, c.title as course_title 
            FROM lessons l
            JOIN courses c ON l.course_id = c.courseid
            WHERE c.instructor_id = ? AND l.scheduled_at IS NOT NULL
            ORDER BY l.scheduled_at ASC
        `;
        const [rows] = await db.execute(query, [instructorId]);
        return rows;
    },

    getScheduledLessonsByStudent: async (studentId) => {
        const query = `
            SELECT l.*, c.title as course_title 
            FROM lessons l
            JOIN enrollments e ON l.course_id = e.course_id
            JOIN courses c ON l.course_id = c.courseid
            WHERE e.student_id = ? AND e.status = 'enrolled' AND l.scheduled_at IS NOT NULL
            ORDER BY l.scheduled_at ASC
        `;
        const [rows] = await db.execute(query, [studentId]);
        return rows;
    },

    getGlobalScheduledLessons: async () => {
        const query = `
            SELECT l.*, c.title as course_title 
            FROM lessons l
            JOIN courses c ON l.course_id = c.courseid
            WHERE l.scheduled_at IS NOT NULL
            ORDER BY l.scheduled_at ASC
        `;
        const [rows] = await db.execute(query);
        return rows;
    }
};

module.exports = Course;