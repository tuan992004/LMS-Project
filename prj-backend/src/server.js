
const express = require('express')
const db = require('./libs/db.js')
const authRoute = require('./routes/authRoute.js')
const userRoute = require('./routes/userRoute.js')
const courseRoute = require('./routes/courseRoute.js');
const notificationRoute = require('./routes/notificationRoute.js');
const assignmentRoute = require('./routes/assignmentRoute.js');
const enrollmentRoute = require('./routes/enrollmentRoute.js');
const instructorRoute = require('./routes/instructorRoute.js');
const announcementRoute = require('./routes/announcementRoute.js');
const dashboardRoute = require('./routes/dashboardRoute.js');
const protectedRoute = require('./middlewares/authMiddleware.js')
const bcrypt = require('bcrypt')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const { ensureDirs } = require('./libs/ensureDirs');
require("dotenv").config()
const path = require('path');

ensureDirs();

const app = express()
const PORT = 5001

app.use((req, res, next) => {
    console.log(`[${req.method}] ${req.originalUrl}`);
    next();
});

app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
}))

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

//public routes
app.use('/api/auth', authRoute)


//private routes (Bỏ protectedRoute khi chưa setup database)
app.use('/api/users', protectedRoute, userRoute);
app.use('/api/courses', protectedRoute, courseRoute);
app.use('/api/notifications', protectedRoute, notificationRoute);
app.use('/api/assignments', protectedRoute, assignmentRoute);
app.use('/api/enrollments', protectedRoute, enrollmentRoute);
app.use('/api/instructor', protectedRoute, instructorRoute);
app.use('/api/dashboard', protectedRoute, dashboardRoute);
app.use('/api/announcements', protectedRoute, announcementRoute);

//test api
app.get('/user', async (req, res) => {
    try {
        const [users] = await db.query("SELECT * FROM users");
        res.json(users);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

app.get('/hashPassword', async (req, res) => {
    try {
        bcrypt.hash("123456", 10).then(console.log)
    } catch (err) {
        res.status(500).send()
    }
})

const { initScheduler } = require('./libs/scheduler');

app.listen(PORT, () => {
    console.log(`Server bắt đầu trên cổng ${PORT}`)
    initScheduler();
});

// Error handling middleware
const multer = require('multer');
app.use((err, req, res, next) => {
    console.error("Global Error Handler:", err);
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: "File too large. Maximum size is 500MB." });
        }
        return res.status(400).json({ message: "File upload error", error: err.message });
    }
    res.status(500).json({ 
        message: "Internal Server Error", 
        error: process.env.NODE_ENV === 'production' ? "Lỗi hệ thống" : err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
});
