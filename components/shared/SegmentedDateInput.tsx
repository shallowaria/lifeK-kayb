'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface SegmentedDateInputProps {
  value: string;
  onChange: (date: string) => void;
  minYear?: number;
  maxYear?: number;
}

export default function SegmentedDateInput({
  value,
  onChange,
  minYear = 1900,
  maxYear = 2100
}: SegmentedDateInputProps) {
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [showDayDropdown, setShowDayDropdown] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const yearRef = useRef<HTMLInputElement>(null);
  const monthRef = useRef<HTMLInputElement>(null);
  const dayRef = useRef<HTMLInputElement>(null);
  const [prevValue, setPrevValue] = useState(value);

  // Sync prop to state (React 推荐的 getDerivedStateFromProps 模式)
  if (value !== prevValue) {
    setPrevValue(value);
    if (value) {
      const [y, m, d] = value.split('-');
      if (y && y !== year) setYear(y);
      if (m && m.replace(/^0/, '') !== month) setMonth(m.replace(/^0/, ''));
      if (d && d.replace(/^0/, '') !== day) setDay(d.replace(/^0/, ''));
    }
  }


  // Date validation helper
  const isValidDate = (y: string, m: string, d: string): boolean => {
    const yearNum = parseInt(y);
    const monthNum = parseInt(m);
    const dayNum = parseInt(d);

    if (!yearNum || !monthNum || !dayNum) return false;
    if (yearNum < minYear || yearNum > maxYear) return false;
    if (monthNum < 1 || monthNum > 12) return false;

    // Check days in month (handles leap years)
    const daysInMonth = new Date(yearNum, monthNum, 0).getDate();
    return dayNum >= 1 && dayNum <= daysInMonth;
  };

  // Emit date string when all fields are valid
  useEffect(() => {
    if (year.length === 4 && month && day) {
      const m = month.padStart(2, '0');
      const d = day.padStart(2, '0');
      const dateString = `${year}-${m}-${d}`;

      if (isValidDate(year, m, d)) {
        onChange(dateString);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month, day]);

  // Handle year change with auto-focus
  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setYear(value);
    if (value.length === 4) {
      monthRef.current?.focus();
    }
  };

  // Handle month change with auto-focus
  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 2);
    setMonth(value);
    if (value.length === 2) {
      dayRef.current?.focus();
    }
  };

  // Handle day change
  const handleDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 2);
    setDay(value);
  };

  // Handle backspace on empty field to focus previous
  const handleYearKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && year === '') {
      // Already at first field
    }
  };

  const handleMonthKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && month === '') {
      yearRef.current?.focus();
    }
  };

  const handleDayKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && day === '') {
      monthRef.current?.focus();
    }
  };

  // Generate month options (01-12)
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const val = (i + 1).toString().padStart(2, '0');
    return val;
  });

  // Generate day options based on month/year
  const getDaysInMonth = (): number => {
    if (!year || !month) return 31;
    const yearNum = parseInt(year);
    const monthNum = parseInt(month);
    if (!yearNum || !monthNum) return 31;
    return new Date(yearNum, monthNum, 0).getDate();
  };

  const dayOptions = Array.from({ length: getDaysInMonth() }, (_, i) => {
    const val = (i + 1).toString().padStart(2, '0');
    return val;
  });

  // Handle month selection from dropdown
  const handleMonthSelect = (selectedMonth: string) => {
    setMonth(selectedMonth.replace(/^0/, ''));
    setShowMonthDropdown(false);
    dayRef.current?.focus();
  };

  // Handle day selection from dropdown
  const handleDaySelect = (selectedDay: string) => {
    setDay(selectedDay.replace(/^0/, ''));
    setShowDayDropdown(false);
  };

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setShowMonthDropdown(false);
        setShowDayDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="date-segment-container relative w-full flex justify-center" >
      {/* Year input */}
      <input
        ref={yearRef}
        type="text"
        inputMode="numeric"
        value={year}
        onChange={handleYearChange}
        onKeyDown={handleYearKeyDown}
        placeholder="YYYY"
        className="date-segment-input date-segment-year"
        aria-label="年份"
      />

      <span className="date-separator">/</span>

      {/* Month input with dropdown */}
      <div className='relative flex items-center'>
        <input
          ref={monthRef}
          type="text"
          inputMode="numeric"
          value={month}
          onChange={handleMonthChange}
          onKeyDown={handleMonthKeyDown}
          placeholder="MM"
          className="date-segment-input date-segment-month"
          aria-label="月份"
        />
        <button
          type="button"
          onClick={() => setShowMonthDropdown(!showMonthDropdown)}
          className="date-dropdown-trigger"
          aria-label="选择月份"
        >
          <ChevronDown size={16} />
        </button>

        {showMonthDropdown && (
          <div className="date-dropdown-menu">
            {monthOptions.map((m) => (
              <div
                key={m}
                onClick={() => handleMonthSelect(m)}
                className={`date-dropdown-item ${month.padStart(2, '0') === m ? 'selected' : ''}`}
              >
                {m}
              </div>
            ))}
          </div>
        )}
      </div>

      <span className="date-separator">/</span>

      {/* Day input with dropdown */}
      <div className='relative flex items-center'>
        <input
          ref={dayRef}
          type="text"
          inputMode="numeric"
          value={day}
          onChange={handleDayChange}
          onKeyDown={handleDayKeyDown}
          placeholder="DD"
          className="date-segment-input date-segment-day"
          aria-label="日期"
        />
        <button
          type="button"
          onClick={() => setShowDayDropdown(!showDayDropdown)}
          className="date-dropdown-trigger"
          aria-label="选择日期"
        >
          <ChevronDown size={16} />
        </button>

        {showDayDropdown && (
          <div className="date-dropdown-menu">
            {dayOptions.map((d) => (
              <div
                key={d}
                onClick={() => handleDaySelect(d)}
                className={`date-dropdown-item ${day.padStart(2, '0') === d ? 'selected' : ''}`}
              >
                {d}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
