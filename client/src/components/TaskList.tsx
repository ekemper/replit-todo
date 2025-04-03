import React from "react";
import { TaskType } from "@shared/schema";
import TaskItem from "./TaskItem";

interface TaskListProps {
  tasks: TaskType[];
  onToggleComplete: (id: number) => void;
  onEdit: (task: TaskType) => void;
  onDelete: (id: number) => void;
}

export default function TaskList({
  tasks,
  onToggleComplete,
  onEdit,
  onDelete
}: TaskListProps) {
  return (
    <div className="divide-y divide-gray-100">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggleComplete={onToggleComplete}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
