const express = require('express');
const { authMe, addUser, updateUser, deleteUser, getAllUsers, getLogs, test, updateProfile, getStudentDossier } = require('../controllers/userController');
const authorize = require('../middlewares/authorization.js')

const router = express.Router();

router.get('/me', authMe);

// Cập nhật hồ sơ cá nhân (Mọi role đều được)
router.put('/profile/edit', updateProfile);

// Chỉ ADMIN
router.post('/adduser', authorize(['admin']), addUser);
router.put('/:id', authorize(['admin']), updateUser);
router.delete('/:id', authorize(['admin']), deleteUser);
router.get('/dossier/:id', authorize(['admin', 'instructor']), getStudentDossier);
router.get('/', authorize(['admin']), getAllUsers);
router.get('/logs', authorize(['admin']), getLogs);

// ADMIN + INSTRUCTOR: get only students (for enrollment pickers)
router.get('/students', authorize(['admin', 'instructor']), async (req, res) => {
  try {
    const User = require('../modules/User');
    const all = await User.findAll();
    return res.status(200).json(all.filter(u => u.role === 'student'));
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Lỗi hệ thống' });
  }
});

router.get('/instructors', authorize(['admin']), async (req, res) => {
  try {
    const User = require('../modules/User');
    const all = await User.findAll();
    return res.status(200).json(all.filter(u => u.role === 'instructor'));
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Lỗi hệ thống' });
  }
});

// ADMIN + TEACHER
router.get('/test', authorize(['admin', 'instructor']), test);

module.exports = router;