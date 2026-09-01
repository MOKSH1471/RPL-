import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Cake,
} from 'lucide-react';

interface ModernDatePickerProps {
  value?: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  placeholder?: string;
  error?: string;
  minYear?: number;
  maxYear?: number;
  defaultYear?: number;
  isDOB?: boolean;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export const ModernDatePicker: React.FC<ModernDatePickerProps> = ({
  value,
  onChange,
  placeholder = 'Select date',
  error,
  minYear = 1950,
  maxYear = 2030,
  defaultYear,
  isDOB = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'calendar' | 'month' | 'year'>('calendar');
  const containerRef = useRef<HTMLDivElement>(null);

  // Determine starting date
  const getInitialYear = () => {
    if (value) {
      const parsed = parseInt(value.split('-')[0], 10);
      if (!isNaN(parsed)) return parsed;
    }
    if (defaultYear) return defaultYear;
    return isDOB ? 2002 : 2026;
  };

  const getInitialMonth = () => {
    if (value) {
      const parsed = parseInt(value.split('-')[1], 10) - 1;
      if (!isNaN(parsed) && parsed >= 0 && parsed <= 11) return parsed;
    }
    return isDOB ? 0 : 11; // December for tournament stay
  };

  const [currentYear, setCurrentYear] = useState<number>(getInitialYear());
  const [currentMonth, setCurrentMonth] = useState<number>(getInitialMonth());

  const selectedDateObj = value ? new Date(value) : null;
  const isSelectedValid = selectedDateObj && !isNaN(selectedDateObj.getTime());

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setViewMode('calendar');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync external value changes
  useEffect(() => {
    if (value) {
      const parts = value.split('-');
      if (parts.length === 3) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        if (!isNaN(y)) setCurrentYear(y);
        if (!isNaN(m) && m >= 0 && m <= 11) setCurrentMonth(m);
      }
    }
  }, [value]);

  // Days in current month calculation
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  // Generate day items
  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(d);
  }

  const handleSelectDay = (day: number) => {
    const monthStr = String(currentMonth + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const formatted = `${currentYear}-${monthStr}-${dayStr}`;
    onChange(formatted);
    setIsOpen(false);
    setViewMode('calendar');
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  // Calculate age if isDOB is true
  const getAge = (dateStr: string) => {
    if (!dateStr || !isDOB) return null;
    const parts = dateStr.split('-');
    let bday: Date;
    if (parts.length === 3) {
      bday = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    } else {
      bday = new Date(dateStr);
    }
    if (isNaN(bday.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - bday.getFullYear();
    const m = today.getMonth() - bday.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < bday.getDate())) {
      age--;
    }
    return age;
  };

  const age = value ? getAge(value) : null;

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const monthIdx = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      if (!isNaN(year) && !isNaN(monthIdx) && !isNaN(day) && monthIdx >= 0 && monthIdx < 12) {
        return `${day} ${SHORT_MONTHS[monthIdx]} ${year}`;
      }
    }
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return `${d.getDate()} ${SHORT_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  };

  // Generate Year list
  const yearsList = [];
  for (let y = maxYear; y >= minYear; y--) {
    yearsList.push(y);
  }

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Clean, Modern Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 min-h-[48px] rounded-2xl bg-white border text-left flex items-center justify-between transition-all cursor-pointer shadow-xs ${
          isOpen
            ? 'border-amber-500 ring-2 ring-amber-400/20 shadow-sm'
            : error
            ? 'border-pink-500 ring-2 ring-pink-200'
            : 'border-slate-300 hover:border-amber-500 hover:bg-slate-50/50'
        }`}
      >
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
            <CalendarIcon className="w-4 h-4" />
          </div>
          <div className="truncate">
            {isSelectedValid ? (
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-900 text-sm tracking-tight">
                  {formatDisplayDate(value!)}
                </span>
                {age !== null && (
                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-amber-100/80 text-amber-900 font-extrabold text-[10px] uppercase">
                    <Cake className="w-3 h-3 text-amber-700 inline" />
                    <span>{age} yrs</span>
                  </span>
                )}
              </div>
            ) : (
              <span className="text-slate-400 text-sm font-medium">{placeholder}</span>
            )}
          </div>
        </div>

        <ChevronDown
          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-amber-600' : ''
          }`}
        />
      </button>

      {/* Modern Popover Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute top-full left-0 right-0 mt-2 z-50 p-3.5 sm:p-4 bg-white rounded-3xl border border-slate-200 shadow-2xl space-y-3 w-full max-w-full origin-top"
          >
            {/* Header: Month & Year Switchers */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={() => setViewMode(viewMode === 'month' ? 'calendar' : 'month')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    viewMode === 'month'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                  }`}
                >
                  {MONTHS[currentMonth]}
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode(viewMode === 'year' ? 'calendar' : 'year')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    viewMode === 'year'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                  }`}
                >
                  {currentYear}
                </button>
              </div>

              {viewMode === 'calendar' && (
                <div className="flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                    aria-label="Previous Month"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextMonth}
                    className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                    aria-label="Next Month"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* View Mode 1: Days Calendar Grid */}
            {viewMode === 'calendar' && (
              <div className="space-y-1.5">
                {/* Days of week */}
                <div className="grid grid-cols-7 gap-1 text-center">
                  {DAYS_OF_WEEK.map((day) => (
                    <span key={day} className="text-[11px] font-extrabold uppercase text-slate-400 py-1">
                      {day}
                    </span>
                  ))}
                </div>

                {/* Day cells */}
                <div className="grid grid-cols-7 gap-1">
                  {days.map((day, idx) => {
                    if (day === null) {
                      return <div key={`empty-${idx}`} className="h-9" />;
                    }

                    const isCurrentSelected =
                      isSelectedValid &&
                      selectedDateObj?.getFullYear() === currentYear &&
                      selectedDateObj?.getMonth() === currentMonth &&
                      selectedDateObj?.getDate() === day;

                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleSelectDay(day)}
                        className={`h-9 w-full rounded-xl text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                          isCurrentSelected
                            ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md shadow-amber-500/25 font-extrabold scale-105'
                            : 'text-slate-700 hover:bg-amber-50 hover:text-amber-700'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* View Mode 2: Month Grid Picker */}
            {viewMode === 'month' && (
              <div className="grid grid-cols-3 gap-2 py-1.5">
                {MONTHS.map((mName, mIdx) => {
                  const isSelected = currentMonth === mIdx;
                  return (
                    <button
                      key={mName}
                      type="button"
                      onClick={() => {
                        setCurrentMonth(mIdx);
                        setViewMode('calendar');
                      }}
                      className={`py-2 px-2 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500 text-white shadow-xs font-extrabold'
                          : 'bg-slate-50 text-slate-700 hover:bg-amber-50 hover:text-amber-700 border border-slate-100'
                      }`}
                    >
                      {mName}
                    </button>
                  );
                })}
              </div>
            )}

            {/* View Mode 3: Year Selector */}
            {viewMode === 'year' && (
              <div className="grid grid-cols-4 gap-2 max-h-52 overflow-y-auto py-1 pr-1">
                {yearsList.map((y) => {
                  const isSelected = currentYear === y;
                  return (
                    <button
                      key={y}
                      type="button"
                      onClick={() => {
                        setCurrentYear(y);
                        setViewMode('calendar');
                      }}
                      className={`py-2 px-1 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500 text-white shadow-xs font-extrabold'
                          : 'bg-slate-50 text-slate-700 hover:bg-amber-50 hover:text-amber-700 border border-slate-100'
                      }`}
                    >
                      {y}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Footer helper */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
              <span>Click month or year to jump</span>
              <button
                type="button"
                onClick={() => {
                  onChange('');
                  setIsOpen(false);
                }}
                className="text-pink-600 font-bold hover:underline cursor-pointer"
              >
                Clear
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ModernDatePicker;
