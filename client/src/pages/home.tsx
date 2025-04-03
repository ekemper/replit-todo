import { useState, useEffect } from "react";
import { TaskType, FilterType } from "@shared/schema";
import { getTasks, saveTasks, getNextId } from "@/lib/storage";
import Header from "@/components/Header";
import TaskList from "@/components/TaskList";
import TaskForm from "@/components/TaskForm";
import FilterControls from "@/components/FilterControls";
import EditTaskModal from "@/components/EditTaskModal";
import DeleteTaskModal from "@/components/DeleteTaskModal";
import EmptyState from "@/components/EmptyState";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  // State management
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [editingTask, setEditingTask] = useState<TaskType | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null);
  const { toast } = useToast();

  // Load tasks from localStorage on initial render
  useEffect(() => {
    setTasks(getTasks());
  }, []);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  // Filter tasks based on activeFilter
  const filteredTasks = tasks.filter((task) => {
    if (activeFilter === "active") return !task.completed;
    if (activeFilter === "completed") return task.completed;
    return true; // "all" filter
  });

  // Task management functions
  const addTask = (text: string) => {
    const newTask: TaskType = {
      id: getNextId(tasks),
      text: text.trim(),
      completed: false,
    };
    setTasks([...tasks, newTask]);
    toast({
      title: "Task added",
      description: "Your new task has been added successfully.",
    });
  };

  const toggleTask = (id: number) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const updateTask = (id: number, text: string) => {
    setTasks(
      tasks.map((task) => (task.id === id ? { ...task, text } : task))
    );
    setEditingTask(null);
    toast({
      title: "Task updated",
      description: "Your task has been updated successfully.",
    });
  };

  const deleteTask = (id: number) => {
    setTasks(tasks.filter((task) => task.id !== id));
    setTaskToDelete(null);
    toast({
      title: "Task deleted",
      description: "Your task has been deleted successfully.",
      variant: "destructive",
    });
  };

  const clearCompleted = () => {
    setTasks(tasks.filter((task) => !task.completed));
    toast({
      title: "Completed tasks cleared",
      description: "All completed tasks have been removed.",
    });
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
