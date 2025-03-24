"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
type FilterDropdownProps = {
  selected: string;
  setSelected: (value: string) => void;
};

const FilterDropdown: React.FC<FilterDropdownProps> = ({
  selected,
  setSelected,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const options = ["All Tokens", "Valid Only", "Expiring Soon", "Expired"];

  return (
    <div className="relative md:min-w-[200px]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full bg-background border border-secondary rounded-lg p-2.5 text-sm focus:ring-primary focus:border-primary"
      >
        <div className="flex items-center">
          <svg
            className="w-5 h-5 mr-2 text-muted-foreground"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-foreground">{selected}</span>
        </div>
        <ChevronDown className="w-4 h-4 ml-2 text-muted-foreground" />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-10 mt-2 w-full bg-background border border-secondary rounded-lg shadow-lg">
          {options.map((option) => (
            <div
              key={option}
              className="px-4 py-2 text-sm text-foreground hover:bg-secondary/20 cursor-pointer"
              onClick={() => {
                setSelected(option);
                setIsOpen(false);
              }}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FilterDropdown;
