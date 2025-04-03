import { 
  users, type User, type InsertUser, 
  tasks, type Task, type InsertTask, type TaskType 
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

// Storage interface for our application
export interface IStorage {
  // User operations (unchanged from template)
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Task operations
  getAllTasks(): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: TaskType): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
}

// Database implementation of our storage interface
export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Task operations
  async getAllTasks(): Promise<Task[]> {
    return await db.select().from(tasks);
  }

  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task || undefined;
  }

  async createTask(task: InsertTask): Promise<Task> {
    const [newTask] = await db
      .insert(tasks)
      .values(task)
      .returning();
    return newTask;
  }

  async updateTask(id: number, taskData: TaskType): Promise<Task | undefined> {
    // First check if the task exists
    const existingTask = await this.getTask(id);
    if (!existingTask) {
      return undefined;
    }

    // Update the task
    const [updatedTask] = await db
      .update(tasks)
      .set({
        text: taskData.text,
        completed: taskData.completed
      })
      .where(eq(tasks.id, id))
      .returning();
    
    return updatedTask;
  }

  async deleteTask(id: number): Promise<boolean> {
    // First check if the task exists
    const existingTask = await this.getTask(id);
    if (!existingTask) {
      return false;
    }

    // Delete the task
    await db
      .delete(tasks)
      .where(eq(tasks.id, id));
    
    return true;
  }
}

// Export singleton instance of database storage
export const storage = new DatabaseStorage();
