const Assignment = require('../modules/Assignment');
const Course = require('../modules/Course');
const Notification = require('../modules/Notification');
const Enrollment = require('../modules/Enrollment');

const assignmentController = {
    // ---------------- INSTRUCTOR/ADMIN ACTIONS ----------------

    // Create an assignment
    createAssignment: async (req, res) => {
        try {
            const { course_id } = req.params;
            const { title, description, due_date } = req.body;

            // Validate course exists
            const course = await Course.findById(course_id);
            if (!course) return res.status(404).json({ message: "Course not found" });

            // Only Admin or the Instructor of the course can create an assignment
            if (req.user.role !== 'admin' && req.user.userid !== course.instructor_id) {
                return res.status(403).json({ message: "Not authorized to create assignments" });
            }

            // Handle file upload safely
            let finalFileUrl = "";
            if (req.file) {
                // Ensure external access uses the correct static host
                const host = process.env.API_URL || "http://localhost:5001";
                finalFileUrl = `${host}/uploads/assignments/${req.file.filename}`;
            }

            const id = await Assignment.create(course_id, title, description, due_date, finalFileUrl);

            // --- Notify All Enrolled Students ---
            try {
                const students = await Enrollment.getStudentsByCourseId(course_id);
                if (students && students.length > 0) {
                    const notifyPromises = students.map(s => 
                        Notification.insert(
                            s.userid, 
                            'new_assignment', 
                            `Bài tập mới được đăng trong khóa học ${course.title}: ${title}`,
                            { courseId: course_id, assignmentId: id }
                        )
                    );
                    await Promise.all(notifyPromises);
                }
            } catch (notifyError) {
                console.error("New Assignment Notification Error:", notifyError);
                // Don't fail the request if notification fails
            }

            res.status(201).json({ message: "Assignment created successfully", id, file_url: finalFileUrl });
        } catch (error) {
            console.error("Create Assignment Error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    // Get all assignments for a course
    getAssignments: async (req, res) => {
        try {
            const { course_id } = req.params;
            const assignments = await Assignment.getByCourse(course_id);
            res.status(200).json(assignments);
        } catch (error) {
            console.error("Get Assignments Error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    // Get all assignments for the logged-in instructor
    getInstructorAssignments: async (req, res) => {
        try {
            const instructor_id = req.user.userid;
            const assignments = await Assignment.getByInstructor(instructor_id);
            res.status(200).json(assignments);
        } catch (error) {
            console.error("Get Instructor Assignments Error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    // Delete an assignment
    deleteAssignment: async (req, res) => {
        try {
            const { id } = req.params;

            // Should add a check here for role/ownership in a real system
            if (req.user.role === 'student') {
                return res.status(403).json({ message: "Not authorized" });
            }

            await Assignment.delete(id);
            res.status(200).json({ message: "Assignment deleted" });
        } catch (error) {
            console.error("Delete Assignment Error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    // Instructor views all submissions for an assignment
    getSubmissions: async (req, res) => {
        try {
            const { assignment_id } = req.params;

            if (req.user.role === 'student') {
                return res.status(403).json({ message: "Not authorized to view all submissions" });
            }

            const submissions = await Assignment.getSubmissionsForAssignment(assignment_id);
            res.status(200).json(submissions);
        } catch (error) {
            console.error("Get Submissions Error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    // Instructor grades a submission
    gradeSubmission: async (req, res) => {
        try {
            const { submission_id } = req.params;
            const { grade, feedback } = req.body;

            if (req.user.role === 'student') {
                return res.status(403).json({ message: "Only instructors can grade" });
            }

            await Assignment.gradeSubmission(submission_id, grade, feedback);

            // Fetch submission to get the student_id
            const details = await Assignment.getSubmissionDetails(submission_id);
            if (details && details.student_id) {
                await Notification.insert(
                    details.student_id,
                    "assignment_graded",
                    `Giảng viên đã chấm điểm bài tập "${details.assignment_title}" của bạn. Điểm: ${grade}/100.`
                );
            }

            res.status(200).json({ message: "Submission graded successfully" });
        } catch (error) {
            console.error("Grade Submission Error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },


    // ---------------- STUDENT ACTIONS ----------------

    // Student submits their work
    submitAssignment: async (req, res) => {
        try {
            const { assignment_id } = req.params;
            const student_id = req.user.userid;
            const { content, file_url } = req.body;

            if (req.user.role !== 'student') {
                return res.status(403).json({ message: "Only students can submit assignments" });
            }

            // Handle file upload safely
            let finalFileUrl = file_url || "";
            if (req.file) {
                const host = process.env.API_URL || "http://localhost:5001";
                finalFileUrl = `${host}/uploads/submissions/${req.file.filename}`;
            }

            const submissionId = await Assignment.submit(assignment_id, student_id, content || "", finalFileUrl);

            const details = await Assignment.getInstructorForAssignment(assignment_id);
            if (details && details.instructor_id) {
                await Notification.insert(
                    details.instructor_id,
                    "assignment_submitted",
                    `Một học viên đã nộp bài tập "${details.assignment_title}" cho khóa học ${details.course_title}.`
                );
            }

            res.status(200).json({ message: "Assignment submitted successfully", id: submissionId });
        } catch (error) {
            console.error("Submit Assignment Error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    // Student views their own submission
    getMySubmission: async (req, res) => {
        try {
            const { assignment_id } = req.params;
            const student_id = req.user.userid;

            const submission = await Assignment.getSubmissionByStudent(assignment_id, student_id);

            if (!submission) {
                return res.status(200).json(null);
            }
            res.status(200).json(submission);
        } catch (error) {
            console.error("Get My Submission Error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    // Get all assignments for the logged-in student (across all their enrolled courses)
    getStudentAssignments: async (req, res) => {
        try {
            const student_id = req.user.userid;
            const assignments = await Assignment.getByStudent(student_id);
            
            // Map status to 'pending' if null (no submission)
            const formatted = assignments.map(a => ({
                ...a,
                status: a.status || 'pending'
            }));

            res.status(200).json(formatted);
        } catch (error) {
            console.error("Get Student Assignments Error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
};

module.exports = assignmentController;
