import React, { useState } from 'react';
import { InView } from '@/components/ui/in-view';
import { UserCheck, Users, CalendarCheck, Trophy, ChevronRight, Check } from 'lucide-react';

export const HowItWorksSection: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      title: 'Online Registration',
      subtitle: 'Step 1 of 4',
      desc: 'Submit your entry form with your preferred league, sport role or position, and WhatsApp contact details.',
      details: [
        'Select Cricket, Football, or Women’s Sports League',
        'Specify your playing role (Batter, Bowler, Striker, etc.)',
        'Instant confirmation & direct Gmail submission to organizers',
      ],

      icon: UserCheck,
      color: 'border-amber-400 text-amber-600 bg-amber-50',
    },
    {
      title: 'Player Selection & Draft',
      subtitle: 'Step 2 of 4',
      desc: 'Organizers and team captains evaluate player roles for balanced, competitive team formations.',
      details: [
        'Fair player drafting across regional centers',
        'Balanced team composition for high-caliber competition',
        'Team captain & squad announcements',
      ],
      icon: Users,
      color: 'border-emerald-400 text-emerald-600 bg-emerald-50',
    },
    {
      title: 'Fixtures & Schedule Release',
      subtitle: 'Step 3 of 4',
      desc: 'Official match dates, venue locations, and team jerseys announced in WhatsApp groups.',
      details: [
        'Full tournament schedule & matchday timetables',
        'Official RPL jersey allocations',
        'Rules briefing & referee introductions',
      ],
      icon: CalendarCheck,
      color: 'border-pink-400 text-pink-600 bg-pink-50',
    },
    {
      title: 'Matchday Kickoff',
      subtitle: 'Step 4 of 4',
      desc: 'Step onto the field, play under stadium lights, and compete for the RPL Season 9 Trophy!',
      details: [
        'Matchday stadium atmosphere & commentary',
        'Knockout rounds leading to the Grand Finale',
        'Trophy ceremony & individual award distribution',
      ],
      icon: Trophy,
      color: 'border-amber-400 text-amber-600 bg-amber-50',
    },
  ];

  return (
    <section id="how-it-works" className="py-16 md:py-24 relative z-10 w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Section Header */}
        <InView
          viewOptions={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="text-center max-w-3xl mx-auto mb-10 md:mb-16"
        >
          <span className="text-xs uppercase font-extrabold tracking-widest text-pink-600 block mb-3">
            ROAD TO GLORY
          </span>
          <h2 className="font-display font-extrabold text-slate-900 mb-4 md:mb-6" style={{ fontSize: 'clamp(1.5rem, 4vw + 0.25rem, 3.75rem)' }}>
            How RPL Season 9 <span className="text-gradient-magenta">Works</span>
          </h2>
          <p className="text-slate-700 text-base md:text-lg font-medium leading-relaxed">
            From online registration to championship matchday — four simple milestones to get in the game.
          </p>
        </InView>

        {/* Interactive Milestone Accordion with Staggered InView Buttons */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Step Selector Navigation (5 Columns) */}
          <div className="lg:col-span-5 space-y-3">
            {steps.map((item, idx) => {
              const Icon = item.icon;
              const isActive = activeStep === idx;
              return (
                <InView
                  key={idx}
                  viewOptions={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.55, delay: idx * 0.09, ease: 'easeOut' }}
                >
                  <button
                    onClick={() => setActiveStep(idx)}
                    className={`w-full p-4 sm:p-5 rounded-2xl text-left transition-all flex items-center justify-between border min-h-[56px] touch-manipulation ${
                      isActive
                        ? 'bg-white border-amber-400 shadow-md scale-[1.02]'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${item.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 block">
                          {item.subtitle}
                        </span>
                        <span className="font-display font-bold text-slate-900 text-base md:text-lg block">
                          {item.title}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className={`w-5 h-5 transition-transform ${isActive ? 'text-amber-600 translate-x-1' : 'text-slate-400'}`} />
                  </button>
                </InView>
              );
            })}
          </div>

          {/* Active Milestone Detail Panel (7 Columns) */}
          <InView
            viewOptions={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55, delay: 0.2, ease: 'easeOut' }}
            className="lg:col-span-7 bg-white p-6 sm:p-8 md:p-10 rounded-3xl border border-slate-200 shadow-xl"
          >
            <div className="flex items-center space-x-3 mb-4">
              <span className="text-xs uppercase font-extrabold tracking-widest px-3 py-1 rounded-full border border-amber-300 bg-amber-50 text-amber-700">
                {steps[activeStep].subtitle}
              </span>
            </div>

            <h3 className="font-display text-3xl font-extrabold text-slate-900 mb-4">
              {steps[activeStep].title}
            </h3>

            <p className="text-slate-700 text-base font-medium leading-relaxed mb-8">
              {steps[activeStep].desc}
            </p>

            <div className="space-y-3 pt-6 border-t border-slate-100">
              <span className="text-xs uppercase font-bold tracking-wider text-slate-500 block mb-2">
                Key Milestone Highlights
              </span>
              {steps[activeStep].details.map((detail, dIdx) => (
                <div key={dIdx} className="flex items-center space-x-3 text-slate-800 text-sm font-semibold">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>{detail}</span>
                </div>
              ))}
            </div>
          </InView>
        </div>
      </div>
    </section>
  );
};
