const Enrollment = require('../modules/Enrollment');
const User = require('../modules/User');

const enrollmentController = {
    // Xem danh sách khóa học của 1 student
    getStudentEnrollments: async (req, res) => {
        try {
            const { studentId } = req.params;
            
            // Check if user exists & is a student
            const userResult = await User.findById(studentId);
            if (!userResult) {
                return res.status(404).json({ message: "Student not found" });
            }

            const enrollments = await Enrollment.getByStudentId(studentId);
            res.status(200).json(enrollments);
        } catch (error) {
            console.error("Error fetching student enrollments:", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    },

    // Admin chỉ định khóa học cho student
    assignCourses: async (req, res) => {
        try {
            // body request: { studentId: "USER123", courseIds: ["CS101", "CS102"] }
            const { studentId, courseIds } = req.body;

            if (!studentId) {
                return res.status(400).json({ message: "Student ID is required" });
            }

            if (!Array.isArray(courseIds)) {
                return res.status(400).json({ message: "courseIds must be an array" });
            }

            // Check if student exists
            const studentResult = await User.findById(studentId);
            if (!studentResult) {
                return res.status(404).json({ message: "Student not found" });
            }

            await Enrollment.assignCoursesToStudent(studentId, courseIds);

            res.status(200).json({ message: "Courses assigned successfully" });
        } catch (error) {
            console.error("Error assigning courses:", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }
};

module.exports = enrollmentController;
