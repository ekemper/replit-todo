import React from "react";
import { FilterType } from "@shared/schema";
import { ClipboardList } from "lucide-react";

interface EmptyStateProps {
  activeFilter: FilterType;
}

export default function EmptyState({ activeFilter }: EmptyStateProps) {
  const getEmptyStateText = (filter: FilterType) => {
    switch (filter) {
      case "active":
        return "You don't have any active tasks. All done!";
      case "completed":
        return "You don't have any completed tasks yet.";
      default:
        return "You don't have any tasks yet. Add a task to get started.";
    }
  };

  return (
    <div className="p-8 text-center">
      <ClipboardList className="h-16 w-16 mx-auto text-gray-300 mb-4" />
      <h3 className="text-lg font-medium text-gray-500 mb-1">No tasks found</h3>
      <p className="text-gray-400 text-sm">{getEmptyStateText(activeFilter)}</p>
    </div>
  );
}
