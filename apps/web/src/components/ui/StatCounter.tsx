import React, { useEffect, useState } from 'react';
import { StatItem } from '@/types';

interface StatCounterProps {
  stat: StatItem;
}

export const StatCounter: React.FC<StatCounterProps> = ({ stat }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1800;
    const increment = stat.value / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= stat.value) {
        setCount(stat.value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [stat.value]);

  const accentGradients = {
    amber: 'from-amber-300 to-orange-400',
    emerald: 'from-emerald-300 to-teal-400',
    magenta: 'from-pink-300 to-rose-400',
    cyan: 'from-emerald-300 to-cyan-400',
  };

  return (
    <div className="solid-card p-6 md:p-8 rounded-2xl flex flex-col items-center justify-center text-center transition-all duration-300 hover:-translate-y-1">
      <div className={`font-display text-4xl md:text-5xl lg:text-6xl font-extrabold bg-gradient-to-r ${accentGradients[stat.accent]} bg-clip-text text-transparent mb-2`}>
        {stat.prefix}
        {count}
        {stat.suffix}
      </div>
      <p className="text-slate-200 font-semibold text-xs md:text-sm uppercase tracking-wider">
        {stat.label}
      </p>
    </div>
  );
};
