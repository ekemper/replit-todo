import { pgTable, text, serial, integer, boolean, varchar, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Tasks table for storing todo items
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  completed: boolean("completed").notNull().default(false)
});

export const insertTaskSchema = createInsertSchema(tasks).pick({
  text: true,
  completed: true,
});

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

// For frontend use only - not used in database
export const taskSchema = z.object({
  id: z.number(),
  text: z.string().min(1, "Task text cannot be empty"),
  completed: z.boolean().default(false)
});

export type TaskType = z.infer<typeof taskSchema>;

// Users table for future authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 255 }).notNull(),
  password: varchar("password", { length: 255 }).notNull(),
}, (table) => {
  return {
    usernameIdx: unique().on(table.username),
  };
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Filter types for task display
export const filterTypes = ["all", "active", "completed"] as const;
export type FilterType = typeof filterTypes[number];
