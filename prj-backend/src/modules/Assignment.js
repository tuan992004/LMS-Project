const db = require("../libs/db");

const Assignment = {
    // 1. Instructor creates an assignment for their course
    create: async (course_id, title, description, due_date, file_url, type) => {
        const query = `
            INSERT INTO assignments (course_id, title, description, due_date, file_url, type)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const [result] = await db.execute(query, [course_id, title, description, due_date || null, file_url || null, type || 'assignment']);
        return result.insertId;
    },

    // 2. Fetch all assignments for a specific course
    getByCourse: async (course_id) => {
        const query = `
            SELECT * FROM assignments 
            WHERE course_id = ?
            ORDER BY created_at DESC
        `;
        const [rows] = await db.execute(query, [course_id]);
        return rows;
    },

    // 2.0 Fetch a specific assignment by ID
    findById: async (id) => {
        const query = `
            SELECT a.*, c.title as course_title, c.instructor_id 
            FROM assignments a
            LEFT JOIN courses c ON a.course_id = c.courseid
            WHERE a.id = ?
        `;
        const [rows] = await db.execute(query, [id]);
        return rows[0];
    },

    // 2.1 Fetch all assignments for courses taught by an instructor
    getByInstructor: async (instructor_id) => {
        const query = `
            SELECT a.*, c.title as course_title 
            FROM assignments a
            JOIN courses c ON a.course_id = c.courseid
            WHERE c.instructor_id = ?
            ORDER BY a.created_at DESC
        `;
        const [rows] = await db.execute(query, [instructor_id]);
        return rows;
    },

    // 2.2 Fetch all assignments for courses a student is enrolled in
    getByStudent: async (student_id) => {
        const query = `
            SELECT a.*, c.title as course_title, sub.status as status, sub.grade
            FROM assignments a
            JOIN enrollments e ON a.course_id = e.course_id
            JOIN courses c ON a.course_id = c.courseid
            LEFT JOIN assignment_submissions sub ON a.id = sub.assignment_id AND sub.student_id = ?
            WHERE e.student_id = ? AND e.status = 'enrolled'
            ORDER BY a.due_date ASC
        `;
        const [rows] = await db.execute(query, [student_id, student_id]);
        return rows;
    },

    // 3. Delete an assignment
    delete: async (id) => {
        const query = `DELETE FROM assignments WHERE id = ?`;
        const [result] = await db.execute(query, [id]);
        return result.affectedRows;
    },

    // 4. Student submits an assignment
    submit: async (assignment_id, student_id, content, file_url) => {
        // check if sub exists
        const [existing] = await db.execute(`SELECT id FROM assignment_submissions WHERE assignment_id = ? AND student_id = ?`, [assignment_id, student_id]);

        if (existing.length > 0) {
            const updateQuery = `
                UPDATE assignment_submissions
                SET content = ?, file_url = ?, status = 'submitted', submitted_at = CURRENT_TIMESTAMP
                WHERE id = ?
             `;
            await db.execute(updateQuery, [content, file_url, existing[0].id]);
            return existing[0].id;
        }

        const query = `
            INSERT INTO assignment_submissions (assignment_id, student_id, content, file_url)
            VALUES (?, ?, ?, ?)
        `;
        const [result] = await db.execute(query, [assignment_id, student_id, content, file_url]);
        return result.insertId;
    },

    // 5. Fetch a specific student's submission for an assignment
    getSubmissionByStudent: async (assignment_id, student_id) => {
        const query = `
            SELECT * FROM assignment_submissions
            WHERE assignment_id = ? AND student_id = ?
        `;
        const [rows] = await db.execute(query, [assignment_id, student_id]);
        return rows[0];
    },

    // 6. Instructor fetches all submissions for an assignment
    getSubmissionsForAssignment: async (assignment_id) => {
        const query = `
            SELECT sub.*, u.fullname, u.email 
            FROM assignment_submissions sub
            JOIN users u ON sub.student_id = u.userid
            WHERE sub.assignment_id = ?
            ORDER BY sub.submitted_at DESC
        `;
        const [rows] = await db.execute(query, [assignment_id]);
        return rows;
    },

    // 7. Instructor grades a submission
    gradeSubmission: async (submission_id, grade, feedback) => {
        const query = `
            UPDATE assignment_submissions
            SET grade = ?, feedback = ?, status = 'graded', graded_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;
        const [result] = await db.execute(query, [grade, feedback, submission_id]);
        return result.affectedRows;
    },

    // 8. Helpers for Notifications
    getInstructorForAssignment: async (assignment_id) => {
        const query = `
            SELECT c.instructor_id, c.title as course_title, a.title as assignment_title, c.courseid, a.id as assignment_id
            FROM assignments a
            LEFT JOIN courses c ON a.course_id = c.courseid
            WHERE a.id = ?
        `;
        const [rows] = await db.execute(query, [assignment_id]);
        return rows[0];
    },

    getSubmissionDetails: async (submission_id) => {
        const query = `
            SELECT sub.student_id, a.title as assignment_title, c.courseid, c.title as course_title, a.id as assignment_id
            FROM assignment_submissions sub
            LEFT JOIN assignments a ON sub.assignment_id = a.id
            LEFT JOIN courses c ON a.course_id = c.courseid
            WHERE sub.id = ?
        `;
        const [rows] = await db.execute(query, [submission_id]);
        return rows[0];
    },

    // 9. Fetch assignments due within the next X hours with students who haven't submitted
    getUpcomingDeadlinesWithPendingStudents: async (hours = 24) => {
        const query = `
            SELECT e.student_id, a.id as assignment_id, a.title as assignment_title, c.title as course_title, a.due_date
            FROM assignments a
            JOIN enrollments e ON a.course_id = e.course_id
            JOIN courses c ON a.course_id = c.courseid
            LEFT JOIN assignment_submissions sub ON a.id = sub.assignment_id AND e.student_id = sub.student_id
            WHERE a.due_date BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL ? HOUR)
              AND e.status = 'enrolled'
              AND sub.id IS NULL
        `;
        const [rows] = await db.execute(query, [hours]);
        return rows;
    },
    
    // 10. Fetch ALL assignments across the platform (Admin only)
    getGlobalAssignments: async () => {
        const query = `
            SELECT a.*, c.title as course_title 
            FROM assignments a
            JOIN courses c ON a.course_id = c.courseid
            ORDER BY a.due_date ASC
        `;
        const [rows] = await db.execute(query);
        return rows;
    }
};

module.exports = Assignment;
