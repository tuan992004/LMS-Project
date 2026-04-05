const User = require('../modules/User')
const ActivityLog = require('../modules/ActivityLog')

const authMe = async (req, res) => {
  try {
    const user = req.user;

    return res.status(200).json({ user })

  } catch (error) {
    console.error('Lỗi khi gọi AuthMe', error)
    return res.status(500).json({ message: 'Lỗi hệ thống' })
  }
};

// POST /api/users
const addUser = async (req, res) => {
  try {
    const { fullname, username, email, password, role } = req.body

    // validate
    if (!fullname || !username || !email || !password || !role) {
      return res.status(400).json({ message: 'Thiếu dữ liệu' })
    }

    // chỉ admin mới được thêm user


    const existingUser = await User.findByUsername(username)
    if (existingUser) {
      return res.status(409).json({ message: 'Username đã tồn tại' })
    }

    const existingEmail = await User.findByEmail(email)
    if (existingEmail) {
      return res.status(409).json({ message: 'Email already exists' })
    }

    const result = await User.addUser({
      fullname,
      username,
      email,
      password,
      role
    })

    await ActivityLog.create({
      userId: req.user.userid,
      action: 'CREATE_USER',
      ip: req.ip,
      details: { newUser: username, role }
    });

    return res.status(201).json({
      message: 'Tạo user thành công',
      data: result
    })
  } catch (error) {
    console.error('Lỗi khi addUser', error)
    return res.status(500).json({ message: 'Lỗi hệ thống' })
  }
}

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullname, username, email, password, role } = req.body;

    if (!fullname || !username || !email || !role) {
      return res.status(400).json({ message: 'Thiếu dữ liệu' })
    }

    const existingUser = await User.findById(id);
    if (!existingUser) {
      return res.status(404).json({ message: 'Không tìm thấy user' });
    }

    await User.updateUser(id, { fullname, username, email, password, role });

    await ActivityLog.create({
      userId: req.user.userid,
      action: 'UPDATE_USER',
      ip: req.ip,
      details: { updatedUserId: id, changes: { fullname, username, email, role } }
    });

    return res.status(200).json({ message: 'Cập nhật thành công' });
  } catch (error) {
    console.error('Lỗi khi updateUser', error);
    return res.status(500).json({ message: 'Lỗi hệ thống' });
  }
}

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const existingUser = await User.findById(id);
    if (!existingUser) {
      return res.status(404).json({ message: 'Không tìm thấy user' });
    }

    await User.deleteUser(id);

    await ActivityLog.create({
      userId: req.user.userid,
      action: 'DELETE_USER',
      ip: req.ip,
      details: { deletedUserId: id }
    });

    return res.status(200).json({ message: 'Xóa user thành công' });

  } catch (error) {
    console.error('Lỗi khi deleteUser', error);
    return res.status(500).json({ message: 'Lỗi hệ thống' });
  }
}

const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    return res.status(200).json(users);
  } catch (error) {
    console.error('Lỗi khi getAllUsers', error);
    return res.status(500).json({ message: 'Lỗi hệ thống' });
  }
}

const getLogs = async (req, res) => {
  try {
    const logs = await ActivityLog.getLogs();
    return res.status(200).json(logs);
  } catch (error) {
    console.error('Lỗi khi getLogs', error);
    return res.status(500).json({ message: 'Lỗi hệ thống' });
  }
}

const test = async (req, res) => {
  return res.sendStatus(204)
}

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userid; // Get from JWT token
    const { fullname, email, password } = req.body;

    if (!fullname || !email) {
      return res.status(400).json({ message: 'Thiếu dữ liệu: fullname hoặc email' });
    }

    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ message: 'Không tìm thấy user' });
    }

    // Pass the user's existing username and role to the update function to preserve them
    await User.updateUser(userId, {
      fullname,
      username: existingUser.username,
      email,
      password: password || null,
      role: existingUser.role
    });

    await ActivityLog.create({
      userId: userId,
      action: 'UPDATE_PROFILE',
      ip: req.ip,
      details: { changes: { fullname, email, passwordUpdated: !!password } }
    });

    return res.status(200).json({ message: 'Cập nhật hồ sơ thành công' });
  } catch (error) {
    console.error('Lỗi khi updateProfile', error);
    return res.status(500).json({ message: 'Lỗi hệ thống' });
  }
}

module.exports = {
  authMe,
  addUser,
  updateUser,
  deleteUser,
  getAllUsers,
  getLogs,
  test,
  updateProfile
}