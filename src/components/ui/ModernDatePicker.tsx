import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, ChevronDown, Check, X, Sparkles } from 'lucide-react';

interface ModernDatePickerProps {
  value?: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  placeholder?: string;
  error?: string;
  minYear?: number;
  maxYear?: number;
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
  placeholder = 'Select date of birth',
  error,
  minYear = 1950,
  maxYear = new Date().getFullYear() - 5,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'calendar' | 'month' | 'year'>('calendar');
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse initial date or default to a reasonable adult/youth year (e.g., 2002)
  const initialDate = value ? new Date(value) : new Date(2002, 0, 1);
  const [currentYear, setCurrentYear] = useState<number>(
    isNaN(initialDate.getFullYear()) ? 2002 : initialDate.getFullYear()
  );
  const [currentMonth, setCurrentMonth] = useState<number>(
    isNaN(initialDate.getMonth()) ? 0 : initialDate.getMonth()
  );

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

  // Update year/month view when value changes externally
  useEffect(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        setCurrentYear(d.getFullYear());
        setCurrentMonth(d.getMonth());
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
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  // Generate Year Range
  const years = [];
  for (let y = maxYear; y >= minYear; y--) {
    years.push(y);
  }

  // Calculate age if selected
  const getAge = (dateStr: string) => {
    if (!dateStr) return null;
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

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3.5 min-h-[48px] rounded-2xl bg-white border text-left flex items-center justify-between transition-all cursor-pointer shadow-xs ${
          isOpen
            ? 'border-amber-500 ring-2 ring-amber-200'
            : error
            ? 'border-pink-500'
            : 'border-slate-300 hover:border-slate-400'
        }`}
      >
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
            <CalendarIcon className="w-4 h-4" />
          </div>
          <div className="truncate">
            {isSelectedValid ? (
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-900 text-sm">
                  {formatDisplayDate(value!)}
                </span>
                {age !== null && (
                  <span className="px-2 py-0.5 rounded-md bg-amber-100/80 text-amber-900 font-extrabold text-[10px] uppercase">
                    {age} yrs
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
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute top-full left-0 right-0 mt-2 z-50 p-3 sm:p-4 bg-white rounded-3xl border border-slate-200 shadow-2xl space-y-4 w-full max-w-full origin-top"
          >
            {/* Header: Month & Year Switchers */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">

              <div className="flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={() => setViewMode(viewMode === 'month' ? 'calendar' : 'month')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    viewMode === 'month'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                  }`}
                >
                  {MONTHS[currentMonth]}
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode(viewMode === 'year' ? 'calendar' : 'year')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    viewMode === 'year'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-xs'
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
                    className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextMonth}
                    className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* View Mode 1: Days Calendar Grid */}
            {viewMode === 'calendar' && (
              <div className="space-y-2">
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
                            ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/25 font-extrabold scale-105'
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
              <div className="grid grid-cols-3 gap-2 py-2">
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
                      className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/25 font-extrabold'
                          : 'bg-slate-50 text-slate-700 hover:bg-amber-50 hover:text-amber-700 border border-slate-100'
                      }`}
                    >
                      {mName}
                    </button>
                  );
                })}
              </div>
            )}

            {/* View Mode 3: Year Scroll Picker */}
            {viewMode === 'year' && (
              <div className="grid grid-cols-4 gap-2 max-h-56 overflow-y-auto py-2 pr-1">
                {years.map((y) => {
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
                          ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/25 font-extrabold'
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
              <span>Select month/year to jump fast</span>
              <button
                type="button"
                onClick={() => {
                  onChange('');
                  setIsOpen(false);
                }}
                className="text-pink-600 font-bold hover:underline"
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
