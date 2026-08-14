import React from 'react';
import { motion } from 'framer-motion';

export interface OptionItem<T extends string | number> {
  value: T;
  label: React.ReactNode;
  icon?: React.ReactNode;
}

export interface OptionSelectorProps<T extends string | number> {
  options: readonly (OptionItem<T> | T)[] | (OptionItem<T> | T)[] | readonly T[];
  value: T;
  onChange: (value: T) => void;
  layoutId: string;
  className?: string;
  gridCols?: string;
  buttonClassName?: string;
  activeColor?: string;
  activeTextColor?: string;
  disabled?: boolean;
}

export function OptionSelector<T extends string | number>({
  options,
  value,
  onChange,
  layoutId,
  className = '',
  gridCols = '',
  buttonClassName = '',
  activeColor = 'bg-gradient-to-r from-amber-500 to-orange-600',
  activeTextColor = 'text-white',
  disabled = false,
}: OptionSelectorProps<T>) {
  const normalized: OptionItem<T>[] = options.map((opt) =>
    typeof opt === 'object' && opt !== null && 'value' in opt
      ? (opt as OptionItem<T>)
      : { value: opt as T, label: String(opt) }
  );

  return (
    <div
      className={`relative p-1.5 rounded-2xl bg-slate-100 border border-slate-200 ${
        gridCols ? `grid ${gridCols} gap-1.5` : 'flex gap-1.5'
      } ${className}`}
    >
      {normalized.map((opt) => {
        const isSelected = value === opt.value;
        return (
          <button
            key={String(opt.value)}
            type="button"
            disabled={disabled}
            onClick={() => onChange(opt.value)}
            className={`relative flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition-colors duration-200 flex items-center justify-center space-x-1.5 cursor-pointer touch-manipulation z-10 select-none min-h-[44px] ${
              isSelected
                ? `${activeTextColor} font-extrabold`
                : 'text-slate-700 hover:text-slate-950 hover:bg-white/60'
            } ${buttonClassName}`}
          >
            {isSelected && (
              <motion.div
                layoutId={layoutId}
                transition={{
                  type: 'spring',
                  stiffness: 450,
                  damping: 32,
                  mass: 0.7,
                }}
                className={`absolute inset-0 ${activeColor} rounded-xl shadow-md shadow-amber-500/20 -z-10`}
              />
            )}
            {opt.icon && <span className="shrink-0">{opt.icon}</span>}
            <span className="relative z-10 flex items-center justify-center">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default OptionSelector;
