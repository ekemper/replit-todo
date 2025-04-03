import React from "react";
import { FilterType, filterTypes } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FilterControlsProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

export default function FilterControls({ 
  activeFilter, 
  onFilterChange 
}: FilterControlsProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-100">
      <h2 className="text-lg font-semibold text-gray-700">My Tasks</h2>
      <div className="flex space-x-2">
        {filterTypes.map((filter) => (
          <Button
            key={filter}
            size="sm"
            variant={activeFilter === filter ? "default" : "secondary"}
            onClick={() => onFilterChange(filter)}
            className={cn(
              "px-3 py-1 text-sm rounded-md font-medium capitalize",
              activeFilter === filter 
                ? "bg-blue-500 text-white" 
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            )}
          >
            {filter}
          </Button>
        ))}
      </div>
    </div>
  );
}
