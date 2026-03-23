
const express = require('express')
const db = require('./libs/db.js')
const authRoute = require('./routes/authRoute.js')
const userRoute = require('./routes/userRoute.js')
const courseRoute = require('./routes/courseRoute.js');
const notificationRoute = require('./routes/notificationRoute.js');
const assignmentRoute = require('./routes/assignmentRoute.js');
const protectedRoute = require('./middlewares/authMiddleware.js')
const bcrypt = require('bcrypt')
const cookieParser = require('cookie-parser')
const cors = require('cors')
require("dotenv").config()
const path = require('path');

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
app.use('/api/users', protectedRoute, userRoute)
app.use('/api/users', protectedRoute, userRoute);
app.use('/api/courses', protectedRoute, courseRoute);
app.use('/api/notifications', protectedRoute, notificationRoute);
app.use('/api/assignments', protectedRoute, assignmentRoute);

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

app.listen(PORT, () => {
    console.log(`Server bắt đầu trên cổng ${PORT}`)
});
