import React from 'react';

interface KineticTextProps {
  items: string[];
  direction?: 'left' | 'right';
  className?: string;
}

export const KineticText: React.FC<KineticTextProps> = ({
  items,
  className = '',
}) => {
  return (
    <div className={`overflow-hidden whitespace-nowrap py-3 select-none ${className}`}>
      <div className="inline-flex animate-marquee">
        {/* Render item list twice for seamless loop */}
        {[...items, ...items, ...items, ...items].map((item, idx) => (
          <div key={idx} className="flex items-center space-x-6 mx-4">
            <span className="font-display text-lg md:text-xl font-extrabold uppercase tracking-widest bg-gradient-to-r from-amber-500 to-amber-700 bg-clip-text text-transparent">
              {item}
            </span>
            <span className="w-2 h-2 rounded-full bg-amber-500/60 inline-block" />
          </div>
        ))}
      </div>
    </div>
  );
};
