import React from 'react';
import { LeagueType } from '@/types';

interface MeshGradientProps {
  activeLeague?: LeagueType;
}

export const MeshGradient: React.FC<MeshGradientProps> = ({ activeLeague }) => {
  const getBlobColors = () => {
    switch (activeLeague) {
      case 'cricket':
        return {
          blob1: 'bg-amber-300/40',
          blob2: 'bg-orange-300/35',
          blob3: 'bg-amber-400/25',
        };
      case 'football':
        return {
          blob1: 'bg-emerald-300/40',
          blob2: 'bg-teal-300/35',
          blob3: 'bg-emerald-400/25',
        };
      case 'womens':
        return {
          blob1: 'bg-pink-300/40',
          blob2: 'bg-rose-300/35',
          blob3: 'bg-pink-400/25',
        };
      default:
        return {
          blob1: 'bg-amber-300/35',
          blob2: 'bg-emerald-300/35',
          blob3: 'bg-pink-300/35',
        };
    }
  };

  const colors = getBlobColors();

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 transition-colors duration-1000 transform-gpu">
      {/* Radiant light base canvas */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#FFFDF5] via-[#F8FAFC] to-[#F1F5F9]" />

      {/* Hardware-accelerated GPU ambient orbs */}
      <div
        style={{ transform: 'translateZ(0)' }}
        className={`absolute -top-32 -left-32 w-[30rem] h-[30rem] rounded-full blur-[80px] transition-all duration-1000 will-change-transform ${colors.blob1}`}
      />
      <div
        style={{ transform: 'translateZ(0)' }}
        className={`absolute top-1/3 -right-32 w-[32rem] h-[32rem] rounded-full blur-[90px] transition-all duration-1000 will-change-transform ${colors.blob2}`}
      />
      <div
        style={{ transform: 'translateZ(0)' }}
        className={`absolute -bottom-32 left-1/4 w-[36rem] h-[36rem] rounded-full blur-[100px] transition-all duration-1000 will-change-transform ${colors.blob3}`}
      />

      {/* Soft positive dot grid texture */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(rgba(15, 23, 42, 0.4) 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }}
      />
    </div>
  );
};
