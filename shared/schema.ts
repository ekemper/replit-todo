import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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

export const filterTypes = ["all", "active", "completed"] as const;
export type FilterType = typeof filterTypes[number];
