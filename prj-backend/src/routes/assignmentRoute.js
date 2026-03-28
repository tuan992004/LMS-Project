const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');

// All routes here should already be authenticated via server.js authMiddleware

// === INSTRUCTOR / ADMIN ===
// Create an assignment
router.post('/course/:course_id', assignmentController.createAssignment);

// Get all assignments for a course (Can be accessed by Students too)
router.get('/course/:course_id', assignmentController.getAssignments);

// Get all assignments for the currently logged-in instructor (across all their courses)
router.get('/instructor/all', assignmentController.getInstructorAssignments);

// Delete an assignment
router.delete('/:id', assignmentController.deleteAssignment);

// Get all submissions for an assignment
router.get('/:assignment_id/submissions', assignmentController.getSubmissions);

// Grade a specific submission
router.patch('/submissions/:submission_id/grade', assignmentController.gradeSubmission);


// === STUDENT ===
// Submit an assignment
router.post('/:assignment_id/submit', assignmentController.submitAssignment);

// Get their own submission for an assignment
router.get('/:assignment_id/my-submission', assignmentController.getMySubmission);

// Get all assignments for the logged-in student (across all their enrolled courses)
router.get('/student/my-all', assignmentController.getStudentAssignments);

module.exports = router;
