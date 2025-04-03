import { useState, useEffect, useCallback } from "react";
import { TaskType, FilterType } from "@shared/schema";
import { getTasks, createTask, updateTask as updateTaskAPI, deleteTask as deleteTaskAPI } from "@/lib/storage";
import Header from "@/components/Header";
import TaskList from "@/components/TaskList";
import TaskForm from "@/components/TaskForm";
import FilterControls from "@/components/FilterControls";
import EditTaskModal from "@/components/EditTaskModal";
import DeleteTaskModal from "@/components/DeleteTaskModal";
import EmptyState from "@/components/EmptyState";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";

// Tasks query key for cache management
const TASKS_QUERY_KEY = "/api/tasks";

export default function Home() {
  // State management
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [editingTask, setEditingTask] = useState<TaskType | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch tasks from API
  const { data: tasks = [], isLoading: isTasksLoading } = useQuery({
    queryKey: [TASKS_QUERY_KEY],
    queryFn: async () => {
      return getTasks();
    }
  });
  
  // Filter tasks based on activeFilter
  const filteredTasks = tasks.filter((task) => {
    if (activeFilter === "active") return !task.completed;
    if (activeFilter === "completed") return task.completed;
    return true; // "all" filter
  });

  // Task management functions with API calls
  const addTask = async (text: string) => {
    setIsLoading(true);
    try {
      const result = await createTask(text);
      if (result) {
        // Invalidate and refetch tasks
        queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY] });
        toast({
          title: "Task added",
          description: "Your new task has been added successfully.",
        });
      }
    } catch (error) {
      console.error("Error adding task:", error);
      toast({
        title: "Error",
        description: "Failed to add task. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTask = async (id: number) => {
    // Find the task to toggle
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    
    setIsLoading(true);
    try {
      const updatedTask: TaskType = { 
        ...task, 
        completed: !task.completed 
      };
      
      const result = await updateTaskAPI(updatedTask);
      if (result) {
        // Invalidate and refetch tasks
        queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY] });
      }
    } catch (error) {
      console.error("Error toggling task:", error);
      toast({
        title: "Error",
        description: "Failed to update task status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateTask = async (id: number, text: string) => {
    // Find the task to update
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    
    setIsLoading(true);
    try {
      const updatedTask: TaskType = { ...task, text };
      const result = await updateTaskAPI(updatedTask);
      
      if (result) {
        // Invalidate and refetch tasks
        queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY] });
        setEditingTask(null);
        toast({
          title: "Task updated",
          description: "Your task has been updated successfully.",
        });
      }
    } catch (error) {
      console.error("Error updating task:", error);
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTask = async (id: number) => {
    setIsLoading(true);
    try {
      const success = await deleteTaskAPI(id);
      
      if (success) {
        // Invalidate and refetch tasks
        queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY] });
        setTaskToDelete(null);
        toast({
          title: "Task deleted",
          description: "Your task has been deleted successfully.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      toast({
        title: "Error",
        description: "Failed to delete task. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearCompleted = async () => {
    setIsLoading(true);
    
    try {
      // Get all completed tasks
      const completedTasks = tasks.filter(task => task.completed);
      
      // Delete each completed task
      for (const task of completedTasks) {
        await deleteTaskAPI(task.id);
      }
      
      // Invalidate and refetch tasks
      queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY] });
      
      toast({
        title: "Completed tasks cleared",
        description: "All completed tasks have been removed.",
      });
    } catch (error) {
      console.error("Error clearing completed tasks:", error);
      toast({
        title: "Error",
        description: "Failed to clear completed tasks. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Task count statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.completed).length;
  const remainingTasks = totalTasks - completedTasks;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Header />
      
      <main className="bg-white rounded-xl shadow-md overflow-hidden">
        <FilterControls
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />
        
        {filteredTasks.length > 0 ? (
          <TaskList
            tasks={filteredTasks}
            onToggleComplete={toggleTask}
            onEdit={setEditingTask}
            onDelete={setTaskToDelete}
          />
        ) : (
          <EmptyState activeFilter={activeFilter} />
        )}
        
        <TaskForm onAddTask={addTask} />
        
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
          <span className="text-sm text-gray-500">
            {totalTasks} {totalTasks === 1 ? "task" : "tasks"} ({remainingTasks} remaining)
          </span>
          <button
            className="text-sm text-red-500 hover:text-red-700 font-medium focus:outline-none"
            onClick={clearCompleted}
            disabled={completedTasks === 0}
          >
            Clear completed
          </button>
        </div>
      </main>
      
      {/* Modals */}
      {editingTask && (
        <EditTaskModal
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onUpdateTask={updateTask}
        />
      )}
      
      {taskToDelete !== null && (
        <DeleteTaskModal
          taskId={taskToDelete}
          onClose={() => setTaskToDelete(null)}
          onConfirmDelete={deleteTask}
        />
      )}
    </div>
  );
}
