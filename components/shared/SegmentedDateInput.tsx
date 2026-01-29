"use client";

import React, {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { ChevronDown } from "lucide-react";

interface SegmentedDateInputProps {
  value: string;
  onChange: (date: string) => void;
  minYear?: number;
  maxYear?: number;
}

export interface SegmentedDateInputRef {
  validate: () => {
    valid: boolean;
    error: string;
    focusTarget?: "year" | "month" | "day";
  };
}

const SegmentedDateInput = forwardRef<
  SegmentedDateInputRef,
  SegmentedDateInputProps
>(function SegmentedDateInput(
  { value, onChange, minYear = 1900, maxYear = 2100 },
  ref,
) {
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [showDayDropdown, setShowDayDropdown] = useState(false);
  const [validationError, setValidationError] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);
  const yearRef = useRef<HTMLInputElement>(null);
  const monthRef = useRef<HTMLInputElement>(null);
  const dayRef = useRef<HTMLInputElement>(null);
  const [prevValue, setPrevValue] = useState(value);

  // Sync prop to state (React 推荐的 getDerivedStateFromProps 模式)
  if (value !== prevValue) {
    setPrevValue(value);
    if (value) {
      const [y, m, d] = value.split("-");
      if (y && y !== year) setYear(y);
      if (m && m.replace(/^0/, "") !== month) setMonth(m.replace(/^0/, ""));
      if (d && d.replace(/^0/, "") !== day) setDay(d.replace(/^0/, ""));
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

  // Comprehensive validation with user-friendly messages
  const validateCurrentInput = (): {
    valid: boolean;
    error: string;
    focusTarget?: "year" | "month" | "day";
  } => {
    // Clear previous errors
    setValidationError("");

    // Check year
    if (!year || year.length !== 4) {
      return {
        valid: false,
        error: "请输入完整的4位年份",
        focusTarget: "year",
      };
    }

    const yearNum = parseInt(year);
    if (yearNum < minYear) {
      return {
        valid: false,
        error: `出生年份必须大于${minYear}年`,
        focusTarget: "year",
      };
    }
    if (yearNum > maxYear) {
      return {
        valid: false,
        error: `出生年份必须小于${maxYear}年`,
        focusTarget: "year",
      };
    }

    // Check month
    if (!month) {
      return {
        valid: false,
        error: "请输入月份",
        focusTarget: "month",
      };
    }

    const monthNum = parseInt(month);
    if (monthNum < 1 || monthNum > 12) {
      return {
        valid: false,
        error: "月份必须在1-12之间",
        focusTarget: "month",
      };
    }

    // Check day
    if (!day) {
      return {
        valid: false,
        error: "请输入日期",
        focusTarget: "day",
      };
    }

    const dayNum = parseInt(day);
    const daysInMonth = new Date(yearNum, monthNum, 0).getDate();

    if (dayNum < 1 || dayNum > daysInMonth) {
      return {
        valid: false,
        error: `该月份的日期必须在1-${daysInMonth}之间`,
        focusTarget: "day",
      };
    }

    return { valid: true, error: "" };
  };

  // Emit date string when all fields are valid
  useEffect(() => {
    if (year.length === 4 && month && day) {
      const m = month.padStart(2, "0");
      const d = day.padStart(2, "0");
      const dateString = `${year}-${m}-${d}`;

      if (isValidDate(year, m, d)) {
        onChange(dateString);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month, day]);

  // Handle year change with auto-focus
  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 4);
    setYear(value);
    if (value.length === 4) {
      monthRef.current?.focus();
    }
  };

  // Handle month change with auto-focus
  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "").slice(0, 2);

    // Restrict to 1-12 range
    const numValue = parseInt(value);
    if (numValue > 12) {
      value = "12";
    }

    setMonth(value);
    setValidationError(""); // Clear error on change

    if (value.length === 2) {
      dayRef.current?.focus();
    }
  };

  // Handle day change
  const handleDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "").slice(0, 2);

    // Restrict based on month's days
    const daysInMonth = getDaysInMonth();
    const numValue = parseInt(value);
    if (numValue > daysInMonth) {
      value = daysInMonth.toString();
    }

    setDay(value);
    setValidationError(""); // Clear error on change
  };

  // Handle backspace on empty field to focus previous
  const handleYearKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && year === "") {
      // Already at first field
    }
  };

  const handleMonthKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && month === "") {
      yearRef.current?.focus();
    }
  };

  const handleDayKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && day === "") {
      monthRef.current?.focus();
    }
  };

  // Generate month options (01-12)
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const val = (i + 1).toString().padStart(2, "0");
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
    const val = (i + 1).toString().padStart(2, "0");
    return val;
  });

  // Handle month selection from dropdown
  const handleMonthSelect = (selectedMonth: string) => {
    setMonth(selectedMonth.replace(/^0/, ""));
    setShowMonthDropdown(false);
    dayRef.current?.focus();
  };

  // Handle day selection from dropdown
  const handleDaySelect = (selectedDay: string) => {
    setDay(selectedDay.replace(/^0/, ""));
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
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Expose validation method to parent
  useImperativeHandle(ref, () => ({
    validate: () => {
      const result = validateCurrentInput();
      if (!result.valid) {
        setValidationError(result.error);
        // Focus on problematic field
        if (result.focusTarget === "year") yearRef.current?.focus();
        if (result.focusTarget === "month") monthRef.current?.focus();
        if (result.focusTarget === "day") dayRef.current?.focus();
      }
      return result;
    },
  }));

  return (
    <div
      ref={containerRef}
      className="date-segment-container relative w-full flex justify-center"
    >
      {/* Year input */}
      <input
        ref={yearRef}
        type="text"
        inputMode="numeric"
        value={year}
        onChange={handleYearChange}
        onKeyDown={handleYearKeyDown}
        placeholder="年"
        aria-label="年份"
      />

      <span className="date-separator">/</span>

      {/* Month input with dropdown */}
      <div className="relative flex items-center">
        <input
          ref={monthRef}
          type="text"
          inputMode="numeric"
          value={month}
          onChange={handleMonthChange}
          onKeyDown={handleMonthKeyDown}
          placeholder="月"
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
                className={`date-dropdown-item ${month.padStart(2, "0") === m ? "selected" : ""}`}
              >
                {m}
              </div>
            ))}
          </div>
        )}
      </div>

      <span className="date-separator">/</span>

      {/* Day input with dropdown */}
      <div className="relative flex items-center">
        <input
          ref={dayRef}
          type="text"
          inputMode="numeric"
          value={day}
          onChange={handleDayChange}
          onKeyDown={handleDayKeyDown}
          placeholder="日"
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
                className={`date-dropdown-item ${day.padStart(2, "0") === d ? "selected" : ""}`}
              >
                {d}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

export default SegmentedDateInput;
