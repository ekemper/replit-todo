import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TaskFormProps {
  onAddTask: (text: string) => void;
}

export default function TaskForm({ onAddTask }: TaskFormProps) {
  const [newTaskText, setNewTaskText] = useState("");
  const [validationError, setValidationError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate input
    if (!newTaskText.trim()) {
      setValidationError("Task cannot be empty");
      return;
    }
    
    // Add the task and reset form
    onAddTask(newTaskText);
    setNewTaskText("");
    setValidationError("");
  };

  return (
    <div className="p-4 border-t border-gray-100">
      <form className="flex items-center" onSubmit={handleSubmit}>
        <Input
          type="text"
          className="flex-1 py-2 px-3 rounded-l-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Add a new task..."
          value={newTaskText}
          onChange={(e) => {
            setNewTaskText(e.target.value);
            if (validationError) setValidationError("");
          }}
        />
        <Button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 ml-2 rounded-r-lg transition-colors"
        >
          Add
        </Button>
      </form>
      
      {validationError && (
        <p className="text-red-500 text-sm mt-1 transition-opacity">
          {validationError}
        </p>
      )}
    </div>
  );
}
