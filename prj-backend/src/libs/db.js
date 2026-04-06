const mysql = require('mysql2');
require("dotenv").config()

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
}).promise();

db.execute(`
  CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(userid) ON DELETE CASCADE
  )
`).catch(err => console.error("Error creating notifications table:", err));

db.execute(`
  CREATE TABLE IF NOT EXISTS assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date DATETIME,
    file_url VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(courseid) ON DELETE CASCADE
  )
`).catch(err => console.error("Error creating assignments table:", err));

db.execute(`
  CREATE TABLE IF NOT EXISTS assignment_submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    assignment_id INT NOT NULL,
    student_id VARCHAR(50) NOT NULL,
    content TEXT,
    file_url VARCHAR(255),
    status ENUM('submitted', 'graded') DEFAULT 'submitted',
    grade INT DEFAULT NULL,
    feedback TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    graded_at TIMESTAMP NULL,
    FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(userid) ON DELETE CASCADE
  )
`).catch(err => console.error("Error creating submissions table:", err));

// --- US-18: Schema Migrations ---

// Add data column to notifications
db.execute(`
  ALTER TABLE notifications 
  ADD COLUMN data TEXT DEFAULT NULL
`).catch(err => {
  if (err.message.includes('Duplicate column name')) {
    // console.log('data column already exists');
  } else {
    console.error("Error updating notifications table:", err.message);
  }
});

// Update enrollments status
db.execute(`
  ALTER TABLE enrollments 
  MODIFY COLUMN status ENUM('pending', 'enrolled') DEFAULT 'enrolled'
`).catch(err => {
  if (err && err.message) {
    console.error("Error updating enrollments status:", err.message);
  }
});

// --- US-19: Announcement System ---
db.execute(`
  CREATE TABLE IF NOT EXISTS announcements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    author_id VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    status ENUM('pending', 'approved') DEFAULT 'approved',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(userid) ON DELETE CASCADE
  )
`).catch(err => console.error("Error creating announcements table:", err));

// --- US-20: Assignment & Notification Synchronize ---
db.execute(`
  ALTER TABLE assignments 
  ADD COLUMN file_url VARCHAR(255) DEFAULT NULL
`).catch(err => {
  if (err && err.message && err.message.includes('Duplicate column name')) {
    // Already exists
  } else if (err) {
    console.error("Error updating assignments table:", err.message);
  }
});

db.execute(`
  ALTER TABLE notifications 
  ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL
`).catch(err => {
  if (err && err.message && err.message.includes('Duplicate column name')) {
    // Already exists
  } else if (err) {
    console.error("Error updating notifications deleted_at:", err.message);
  }
});

module.exports = db;