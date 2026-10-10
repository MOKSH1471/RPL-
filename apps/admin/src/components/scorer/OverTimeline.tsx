import React from 'react';
import { BallEvent } from '@/types/cricket';

interface OverTimelineProps {
  currentOverBalls: BallEvent[];
  legalBallsBowled: number;
}

export const OverTimeline: React.FC<OverTimelineProps> = ({ currentOverBalls, legalBallsBowled }) => {
  const overNumber = Math.floor(legalBallsBowled / 6) + 1;
  const runsThisOver = currentOverBalls.reduce((acc, b) => acc + b.totalBallRuns, 0);

  const getBallStyle = (ball: BallEvent) => {
    if (ball.isWicket) {
      return {
        cls: 'bg-red-600 text-white border-red-700 font-bold',
        label: 'W',
      };
    }
    if (ball.isExtra) {
      if (ball.extraType === 'wide') {
        return {
          cls: 'bg-amber-100 text-amber-900 border-amber-300 font-bold',
          label: ball.extraRuns > 1 ? `Wd+${ball.extraRuns - 1}` : 'Wd',
        };
      }
      if (ball.extraType === 'noball') {
        return {
          cls: 'bg-orange-100 text-orange-900 border-orange-300 font-bold',
          label: ball.runsOffBat > 0 ? `Nb+${ball.runsOffBat}` : 'Nb',
        };
      }
      if (ball.extraType === 'bye') {
        return {
          cls: 'bg-slate-100 text-slate-800 border-slate-300 font-semibold',
          label: `B${ball.extraRuns}`,
        };
      }
      if (ball.extraType === 'legbye') {
        return {
          cls: 'bg-slate-100 text-slate-800 border-slate-300 font-semibold',
          label: `Lb${ball.extraRuns}`,
        };
      }
    }
    if (ball.runsOffBat === 6) {
      return {
        cls: 'bg-purple-600 text-white border-purple-700 font-bold',
        label: '6',
      };
    }
    if (ball.runsOffBat === 4) {
      return {
        cls: 'bg-emerald-600 text-white border-emerald-700 font-bold',
        label: '4',
      };
    }
    if (ball.runsOffBat === 0) {
      return {
        cls: 'bg-slate-100 text-slate-500 border-slate-200',
        label: '•',
      };
    }
    return {
      cls: 'bg-white text-slate-800 border-slate-300 font-bold',
      label: String(ball.runsOffBat),
    };
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-2xs flex items-center justify-between gap-3">
      <div className="flex items-center space-x-2 shrink-0">
        <span className="text-xs font-bold text-slate-700">Over {overNumber}:</span>
        <span className="text-xs text-slate-500 font-mono">({runsThisOver} runs)</span>
      </div>

      {/* Ball Badges */}
      <div className="flex items-center space-x-1.5 overflow-x-auto py-0.5">
        {currentOverBalls.length === 0 ? (
          <span className="text-xs text-slate-400 italic">This over has not started</span>
        ) : (
          currentOverBalls.map((ball, idx) => {
            const style = getBallStyle(ball);
            return (
              <div
                key={ball.id || idx}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-mono text-xs border ${style.cls} shrink-0`}
              >
                {style.label}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
