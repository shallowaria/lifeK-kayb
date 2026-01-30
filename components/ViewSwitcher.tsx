"use client";

import React from "react";
import { Calendar, CalendarRange, CalendarDays } from "lucide-react";

export type ViewMode = "year" | "mouth" | "day";

interface ViewSwitcherProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export default function ViewSwitcher({
  currentView,
  onViewChange,
}: ViewSwitcherProps) {
  return (
    <div className="flex justify-between sm:gap-2 bg-xuanpaper p-1 rounded-lg shadow-sm text-sm">
      <button
        onClick={() => onViewChange("year")}
        className={`flex items-center sm:gap-2 px-2 sm:px-4 py-2 rounded-md transition-colors whitespace-nowrap ${
          currentView === "year"
            ? "bg-white text-red-600 font-semibold shadow-sm"
            : "text-gray-600 hover:text-gray-900"
        }`}
      >
        <Calendar className="w-4 h-4" />
        年视图
      </button>
      <button
        onClick={() => onViewChange("mouth")}
        className={`flex items-center sm:gap-2 px-2 sm:px-4 py-2 rounded-md transition-colors whitespace-nowrap ${
          currentView === "mouth"
            ? "bg-white text-red-600 font-semibold shadow-sm"
            : "text-gray-600 hover:text-gray-900"
        }`}
      >
        <CalendarRange className="w-4 h-4" />
        月视图
      </button>
      <button
        onClick={() => onViewChange("day")}
        className={`flex items-center sm:gap-2 px-2 sm:px-4 py-2 rounded-md transition-colors whitespace-nowrap ${
          currentView === "day"
            ? "bg-white text-red-600 font-semibold shadow-sm"
            : "text-gray-600 hover:text-gray-900"
        }`}
      >
        <CalendarDays className="w-4 h-4" />
        日视图
      </button>
    </div>
  );
}
