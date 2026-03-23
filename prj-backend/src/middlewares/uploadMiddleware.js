const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let uploadPath = path.join(__dirname, '../../uploads');
        
        // Dynamically route file to correct folder based on API endpoint
        if (req.originalUrl.includes('/submit')) {
            uploadPath = path.join(__dirname, '../../uploads/submissions');
        } else if (req.originalUrl.includes('/assignments')) {
            uploadPath = path.join(__dirname, '../../uploads/assignments');
        }
        
        // Ensure directory exists
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Sanitize original filename and append timestamp to prevent collisions
        const cleanName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '');
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + cleanName);
    }
});

const fileFilter = (req, file, cb) => {
    // Optional: Log mimetype for debug
    console.log("Receiving file upload:", file.mimetype, file.originalname);
    cb(null, true); // Accept all files for now
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 25 * 1024 * 1024 } // 25MB limit to support large PPTs / Docs
});

module.exports = upload;