'use client';

import React from 'react';
import { Calendar, CalendarRange, CalendarDays } from 'lucide-react';

export type ViewMode = 'year' | 'mouth' | 'day';

interface ViewSwitcherProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export default function ViewSwitcher({ currentView, onViewChange }: ViewSwitcherProps) {
  return (
    <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
      <button
        onClick={() => onViewChange('year')}
        className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
          currentView === 'year'
            ? 'bg-white text-red-600 font-semibold shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <Calendar className="w-4 h-4" />
        年视图
      </button>
      <button
        onClick={() => onViewChange('mouth')}
        className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
          currentView === 'mouth'
            ? 'bg-white text-red-600 font-semibold shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <CalendarRange className="w-4 h-4" />
        月视图
      </button>
      <button
        onClick={() => onViewChange('day')}
        className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
          currentView === 'day'
            ? 'bg-white text-red-600 font-semibold shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <CalendarDays className="w-4 h-4" />
        日视图
      </button>
    </div>
  );
}
