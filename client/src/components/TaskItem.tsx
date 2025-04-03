import React from "react";
import { TaskType } from "@shared/schema";
import { Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskItemProps {
  task: TaskType;
  onToggleComplete: (id: number) => void;
  onEdit: (task: TaskType) => void;
  onDelete: (id: number) => void;
}

export default function TaskItem({
  task,
  onToggleComplete,
  onEdit,
  onDelete
}: TaskItemProps) {
  return (
    <div className={cn(
      "p-4 flex items-start justify-between group",
      task.completed && "bg-gray-50"
    )}>
      <div className="flex items-start flex-1">
        <label className="relative inline-block h-5 w-5 mr-3 mt-0.5 cursor-pointer flex-shrink-0">
          <input
            type="checkbox"
            className="opacity-0 absolute h-0 w-0"
            checked={task.completed}
            onChange={() => onToggleComplete(task.id)}
          />
          <span 
            className={cn(
              "absolute top-0 left-0 h-5 w-5 border-2 border-gray-300 rounded-sm",
              task.completed && "bg-emerald-500 border-emerald-500"
            )}
          >
            {task.completed && (
              <svg
                className="absolute inset-0 w-full h-full p-[2px] text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </span>
        </label>
        
        <p className={cn(
          "text-gray-700 flex-1",
          task.completed && "text-gray-500 line-through"
        )}>
          {task.text}
        </p>
      </div>
      
      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 sm:opacity-100">
        <button
          className="text-gray-400 hover:text-blue-500 focus:outline-none"
          onClick={() => onEdit(task)}
          aria-label="Edit task"
        >
          <Pencil className="h-5 w-5" />
        </button>
        <button
          className="text-gray-400 hover:text-red-500 focus:outline-none"
          onClick={() => onDelete(task.id)}
          aria-label="Delete task"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
