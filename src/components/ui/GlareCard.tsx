import React, { useRef, useState } from 'react';

interface GlareCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: 'amber' | 'emerald' | 'magenta';
  onClick?: () => void;
}

export const GlareCard: React.FC<GlareCardProps> = ({
  children,
  className = '',
  glowColor = 'amber',
  onClick,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPosition({ x, y });
  };

  const handleMouseEnter = () => setOpacity(1);
  const handleMouseLeave = () => setOpacity(0);

  const glowStyles = {
    amber: 'hover:shadow-[0_0_30px_-5px_rgba(245,158,11,0.4)] border-amber-500/30 hover:border-amber-400',
    emerald: 'hover:shadow-[0_0_30px_-5px_rgba(16,185,129,0.4)] border-emerald-500/30 hover:border-emerald-400',
    magenta: 'hover:shadow-[0_0_30px_-5px_rgba(236,72,153,0.4)] border-pink-500/30 hover:border-pink-400',
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={`relative overflow-hidden rounded-3xl transition-all duration-300 transform hover:-translate-y-1.5 cursor-pointer ${glowStyles[glowColor]} ${className}`}
    >
      {/* Interactive Glare spotlight overlay on hover */}
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300"
        style={{
          opacity,
          background: `radial-gradient(500px circle at ${position.x}% ${position.y}%, rgba(255, 255, 255, 0.12), transparent 40%)`,
        }}
      />
      {children}
    </div>
  );
};
