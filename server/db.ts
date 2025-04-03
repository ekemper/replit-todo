import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@shared/schema";

// Create PostgreSQL connection with some connection retry logic for Docker
const connectDB = () => {
  const connectionString = process.env.DATABASE_URL!;
  console.log(`Connecting to database: ${connectionString.replace(/:[^:]*@/, ':****@')}`);
  
  return postgres(connectionString, {
    onnotice: () => {}, // Suppress notice messages
    max: 10, // Maximum number of connections
    idle_timeout: 20, // Idle connection timeout in seconds
    connect_timeout: 10, // Connection timeout in seconds
  });
};

const client = connectDB();

// Create Drizzle instance with our schema
export const db = drizzle(client, { schema });