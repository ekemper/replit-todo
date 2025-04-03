import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { tasks } from "@shared/schema";
import { eq } from "drizzle-orm";

// Initialize database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Sample initial data - optional
const sampleTasks = [
  { text: "Learn React", completed: true },
  { text: "Build a todo app", completed: true },
  { text: "Add database support", completed: false },
  { text: "Deploy the application", completed: false },
];

async function main() {
  const db = drizzle(pool);
  
  // Create tables based on schema
  console.log("Creating tables...");
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      text TEXT NOT NULL,
      completed BOOLEAN NOT NULL DEFAULT FALSE
    );
  `);
  
  // Check if we already have data
  const existingTasks = await db.select().from(tasks);
  
  // Insert sample data if the table is empty
  if (existingTasks.length === 0) {
    console.log("Adding sample tasks...");
    for (const task of sampleTasks) {
      await db.insert(tasks).values(task);
    }
    console.log("Sample tasks added successfully");
  } else {
    console.log(`Database already has ${existingTasks.length} tasks`);
  }
  
  console.log("Database setup complete");
  pool.end();
}

main().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});