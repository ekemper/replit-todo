import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@shared/schema";

// Create PostgreSQL connection
const client = postgres(process.env.DATABASE_URL!);

// Create Drizzle instance with our schema
export const db = drizzle(client, { schema });