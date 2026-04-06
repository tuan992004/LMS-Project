const fs = require('fs');
const path = require('path');

const ensureDirs = () => {
    const dirs = [
        path.join(__dirname, '../../uploads'),
        path.join(__dirname, '../../uploads/assignments'),
        path.join(__dirname, '../../uploads/submissions'),
    ];

    dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            console.log(`Creating directory: ${dir}`);
            fs.mkdirSync(dir, { recursive: true });
        }
    });
};

module.exports = { ensureDirs };
