import React, { useState } from "react";
import { TaskType } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface EditTaskModalProps {
  task: TaskType;
  onClose: () => void;
  onUpdateTask: (id: number, text: string) => void;
}

export default function EditTaskModal({
  task,
  onClose,
  onUpdateTask,
}: EditTaskModalProps) {
  const [editTaskText, setEditTaskText] = useState(task.text);
  const [validationError, setValidationError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate input
    if (!editTaskText.trim()) {
      setValidationError("Task cannot be empty");
      return;
    }
    
    // Update the task
    onUpdateTask(task.id, editTaskText);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="py-4">
            <label htmlFor="editTaskInput" className="block text-sm font-medium text-gray-700 mb-1">
              Task description
            </label>
            <Input
              id="editTaskInput"
              type="text"
              value={editTaskText}
              onChange={(e) => {
                setEditTaskText(e.target.value);
                if (validationError) setValidationError("");
              }}
              className="w-full"
              placeholder="Enter task description"
            />
            {validationError && (
              <p className="text-red-500 text-sm mt-1">{validationError}</p>
            )}
          </div>
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
