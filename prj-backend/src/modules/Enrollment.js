const db = require('../libs/db.js');

const Enrollment = {
    // Lấy tất cả khóa học của một học viên
    getByStudentId: async (studentId) => {
        const [rows] = await db.execute(
            `SELECT e.*, c.title, c.description, c.instructor_id, c.status as course_status 
             FROM enrollments e 
             JOIN courses c ON e.course_id = c.courseid 
             WHERE e.student_id = ?`,
            [studentId]
        );
        return rows;
    },

    // Gán danh sách khóa học cho học viên
    assignCoursesToStudent: async (studentId, courseIds) => {
        try {
            await db.beginTransaction();

            // 1. Xóa các khóa học cũ
            await db.execute("DELETE FROM enrollments WHERE student_id = ?", [studentId]);

            // 2. Thêm mới danh sách khóa học (nếu có)
            if (courseIds && courseIds.length > 0) {
                // Prepare values for bulk insert
                const placeholders = courseIds.map(() => '(?, ?, ?)').join(', ');
                const values = courseIds.flatMap(courseId => [studentId, courseId, 'enrolled']);

                await db.execute(
                    `INSERT INTO enrollments (student_id, course_id, status) VALUES ${placeholders}`,
                    values
                );
            }

            await db.commit();
            return true;
        } catch (error) {
            await db.rollback();
            console.error("Error in assignCoursesToStudent:", error);
            throw error;
        }
    }
};

module.exports = Enrollment;
