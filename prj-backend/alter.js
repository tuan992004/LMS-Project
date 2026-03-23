const db = require('./src/libs/db');

async function migrate() {
    try {
        console.log("Adding file_url column to assignments...");
        await db.execute("ALTER TABLE assignments ADD COLUMN file_url VARCHAR(255) DEFAULT NULL;");
        console.log("Migration successful!");
    } catch (err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
            console.log("Column file_url already exists, skipping.");
        } else {
            console.error("Migration failed:", err);
        }
    } finally {
        process.exit();
    }
}

migrate();
