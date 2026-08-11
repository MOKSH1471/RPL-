import React from 'react';
import { StatCounter } from '@/components/ui/StatCounter';
import { InView } from '@/components/ui/in-view';
import { StatItem } from '@/types';
import { Users, Flame, HeartHandshake } from 'lucide-react';

export const AboutSection: React.FC = () => {
  const stats: StatItem[] = [
    { id: '1', label: 'Seasons of Excellence', value: 9, suffix: '', accent: 'amber' },
    { id: '2', label: 'Registered Athletes', value: 300, prefix: '', suffix: '+', accent: 'magenta' },
    { id: '3', label: 'Sports Leagues', value: 3, suffix: '', accent: 'emerald' },
    { id: '4', label: 'Championship Matches', value: 50, prefix: '', suffix: '+', accent: 'cyan' },
  ];

  return (
    <section id="about" className="py-24 relative z-10">
      <InView
        viewOptions={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase font-extrabold tracking-widest text-pink-600 block mb-3">
            ABOUT THE CHAMPIONSHIP
          </span>
          <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 mb-6">
            Where Passion Meets <span className="text-gradient-vibrant">Purpose</span>
          </h2>
          <p className="text-slate-700 text-base md:text-lg font-medium leading-relaxed">
            Raj Premier League (RPL) returns for Season 9 under Vitraag Vigyaan! Uniting players across regions to compete, excel, and build lifelong bonds through world-class sportsmanship.
          </p>
        </div>

        {/* Stat Counters Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-16">
          {stats.map((stat) => (
            <StatCounter key={stat.id} stat={stat} />
          ))}
        </div>

        {/* Asymmetrical Highlight Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Featured Pillar Card */}
          <div className="md:col-span-2 p-8 md:p-10 rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-500/10 via-white to-amber-500/5 shadow-md flex flex-col justify-between">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-600 flex items-center justify-center border border-amber-300">
                <HeartHandshake className="w-7 h-7" />
              </div>
              <div>
                <span className="text-xs uppercase font-bold tracking-widest text-amber-700 block">Core Pillar</span>
                <h3 className="font-display text-2xl md:text-3xl font-extrabold text-slate-900">Vitraag Vigyaan Community</h3>
              </div>
            </div>
            <p className="text-slate-700 text-base font-medium leading-relaxed">
              More than a sports tournament — RPL Season 9 is a celebration of unity, athletic excellence, and youth empowerment. Every league match is structured to bring participants together in a high-energy, uplifting environment.
            </p>
          </div>

          {/* Secondary Stack Cards */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl border border-emerald-200 bg-emerald-500/10 shadow-sm">
              <div className="flex items-center space-x-3 mb-3">
                <Flame className="w-5 h-5 text-emerald-600" />
                <h3 className="font-display text-lg font-bold text-slate-900">Competitive Spirit</h3>
              </div>
              <p className="text-slate-700 text-sm font-medium leading-relaxed">
                High-octane matches designed to foster athleticism, teamwork, and healthy community rivalry.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-pink-200 bg-pink-500/10 shadow-sm">
              <div className="flex items-center space-x-3 mb-3">
                <Users className="w-5 h-5 text-pink-600" />
                <h3 className="font-display text-lg font-bold text-slate-900">Inclusive Participation</h3>
              </div>
              <p className="text-slate-700 text-sm font-medium leading-relaxed">
                Dedicated divisions for Cricket, Football, and Women’s Sports welcoming all skill levels.
              </p>
            </div>
          </div>
        </div>
      </InView>
    </section>
  );
};
