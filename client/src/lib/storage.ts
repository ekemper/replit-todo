import { TaskType } from "@shared/schema";

// Local storage key
const STORAGE_KEY = "taskflow-tasks";

// Initialize tasks from localStorage
export const getTasks = (): TaskType[] => {
  try {
    const storedTasks = localStorage.getItem(STORAGE_KEY);
    return storedTasks ? JSON.parse(storedTasks) : [];
  } catch (error) {
    console.error("Error loading tasks from localStorage:", error);
    return [];
  }
};

// Save tasks to localStorage
export const saveTasks = (tasks: TaskType[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error("Error saving tasks to localStorage:", error);
  }
};

// Get next task ID
export const getNextId = (tasks: TaskType[]): number => {
  return tasks.length > 0
    ? Math.max(...tasks.map((task) => task.id)) + 1
    : 1;
};
