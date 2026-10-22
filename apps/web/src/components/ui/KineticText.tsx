import React from 'react';

interface KineticTextProps {
  items: string[];
  direction?: 'left' | 'right';
  className?: string;
  speed?: string;
  textClassName?: string;
  separatorClassName?: string;
}

export const KineticText: React.FC<KineticTextProps> = ({
  items,
  direction = 'left',
  className = '',
  speed = '36s',
  textClassName = 'text-lg md:text-xl bg-gradient-to-r from-amber-500 to-amber-700 bg-clip-text text-transparent',
  separatorClassName = 'w-2 h-2 rounded-full bg-amber-500/60 inline-block',
}) => {
  const animClass = direction === 'right' ? 'animate-marquee-reverse' : 'animate-marquee';

  return (
    <div className={`overflow-hidden whitespace-nowrap py-3 select-none ${className}`}>
      <div className={`inline-flex ${animClass}`} style={speed ? { animationDuration: speed } : undefined}>
        {/* Render item list multiple times for seamless loop */}
        {[...items, ...items, ...items, ...items].map((item, idx) => (
          <div key={idx} className="flex items-center space-x-6 mx-4">
            <span className={`font-display font-extrabold uppercase tracking-widest ${textClassName}`}>
              {item}
            </span>
            <span className={separatorClassName} />
          </div>
        ))}
      </div>
    </div>
  );
};
