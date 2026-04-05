const db = require('../libs/db.js')
const bcrypt = require('bcrypt')
const { generateUserId } = require('../controllers/generateUserId.js')

const User = {
    findByUsername: async (username) => {
        console.log(username)
        const [rows] = await db.execute("SELECT * FROM users WHERE username = ?", [username]);
        console.log(rows)
        return rows[0];
    },
    findByEmail: async (email) => {
        const [rows] = await db.execute("SELECT * FROM users WHERE email = ?", [email]);
        return rows[0];
    },
    findById: async (userid) => {
        console.log(userid)
        const [rows] = await db.execute("SELECT * FROM users WHERE userid = ?", [userid]);
        console.log(rows)
        return rows[0];
    },
    addUser: async ({ fullname, username, email, password, role }) => {
        const hashPassword = await bcrypt.hash(password, 10);
        const userid = await generateUserId(role)
        const [result] = await db.execute(`INSERT INTO users (userid, fullname, username, email, password, role)
       VALUES (?, ?, ?, ?, ?, ?)`, [userid, fullname, username, email, hashPassword, role]);
        return result.insertId
    },
    updateUser: async (userid, { fullname, username, email, password, role }) => {
        let query = "UPDATE users SET fullname = ?, username = ?, email = ?, role = ? WHERE userid = ?";
        let params = [fullname, username, email, role, userid];

        if (password) {
            const hashPassword = await bcrypt.hash(password, 10);
            query = "UPDATE users SET fullname = ?, username = ?, email = ?, role = ?, password = ? WHERE userid = ?";
            params = [fullname, username, email, role, hashPassword, userid];
        }

        await db.execute(query, params);
        return true;
    },
    deleteUser: async (userid) => {
        await db.execute("DELETE FROM users WHERE userid = ?", [userid]);
        return true;
    },
    findAll: async () => {
        const [rows] = await db.query("SELECT userid, fullname, username, email, role FROM users");
        return rows;
    }
};

module.exports = User;