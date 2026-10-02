import React from 'react';
import { LeagueType } from '@/types';

interface MeshGradientProps {
  activeLeague?: LeagueType | string;
}

export const MeshGradient: React.FC<MeshGradientProps> = ({ activeLeague }) => {
  const getGradientColors = () => {
    switch (activeLeague) {
      case 'football':
        return {
          primary: 'rgba(16, 185, 129, 0.15)',
          secondary: 'rgba(20, 184, 166, 0.12)',
          accent: 'rgba(52, 211, 153, 0.10)',
        };
      case 'womens':
      case 'womens-sports':
        return {
          primary: 'rgba(236, 72, 153, 0.15)',
          secondary: 'rgba(244, 114, 182, 0.12)',
          accent: 'rgba(251, 113, 133, 0.10)',
        };
      case 'cricket':
      default:
        return {
          primary: 'rgba(245, 158, 11, 0.16)',
          secondary: 'rgba(251, 146, 60, 0.13)',
          accent: 'rgba(252, 211, 77, 0.10)',
        };
    }
  };

  const colors = getGradientColors();

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 transition-opacity duration-700">
      {/* Light Base Canvas */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#FFFDF8] via-[#F8FAFC] to-[#F1F5F9]" />

      {/* Ultra-smooth zero-lag radial gradient ambient orbs */}
      <div
        className="absolute inset-0 transition-all duration-700"
        style={{
          background: `
            radial-gradient(circle 600px at 15% 10%, ${colors.primary}, transparent 70%),
            radial-gradient(circle 650px at 85% 40%, ${colors.secondary}, transparent 70%),
            radial-gradient(circle 700px at 40% 90%, ${colors.accent}, transparent 70%)
          `,
        }}
      />

      {/* Subtle positive micro-grid */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `radial-gradient(rgba(15, 23, 42, 0.5) 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }}
      />
    </div>
  );
};

