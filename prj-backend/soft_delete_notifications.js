const db = require("./src/libs/db");

async function run() {
  try {
    console.log("Checking for deleted_at column in notifications table...");
    const [columns] = await db.execute("SHOW COLUMNS FROM notifications LIKE 'deleted_at'");
    
    if (columns.length === 0) {
      console.log("Adding deleted_at column...");
      await db.execute("ALTER TABLE notifications ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL");
      console.log("Column added successfully.");
    } else {
      console.log("Column deleted_at already exists.");
    }
    
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
}

run();
