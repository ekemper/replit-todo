import { TaskType, InsertTask } from "@shared/schema";
import { apiRequest } from "./queryClient";

// API endpoints
const API_TASKS = "/api/tasks";

// Get all tasks from the API
export const getTasks = async (): Promise<TaskType[]> => {
  try {
    return await apiRequest<TaskType[]>({
      method: "GET",
      url: API_TASKS
    });
  } catch (error) {
    console.error("Error fetching tasks from API:", error);
    // Return empty array on error
    return [];
  }
};

// Create a new task
export const createTask = async (text: string): Promise<TaskType | null> => {
  try {
    const newTask: InsertTask = {
      text,
      completed: false
    };
    
    return await apiRequest<TaskType>({
      method: "POST",
      url: API_TASKS,
      data: newTask
    });
  } catch (error) {
    console.error("Error creating task:", error);
    return null;
  }
};

// Update an existing task
export const updateTask = async (task: TaskType): Promise<TaskType | null> => {
  try {
    return await apiRequest<TaskType>({
      method: "PUT",
      url: `${API_TASKS}/${task.id}`,
      data: task
    });
  } catch (error) {
    console.error("Error updating task:", error);
    return null;
  }
};

// Delete a task
export const deleteTask = async (id: number): Promise<boolean> => {
  try {
    await apiRequest({
      method: "DELETE",
      url: `${API_TASKS}/${id}`
    });
    return true;
  } catch (error) {
    console.error("Error deleting task:", error);
    return false;
  }
};
