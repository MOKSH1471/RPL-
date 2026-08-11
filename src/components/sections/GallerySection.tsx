import React, { useState } from 'react';
import { InView } from '@/components/ui/in-view';
import { GalleryItem } from '@/types';

export const GallerySection: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'cricket' | 'football' | 'womens'>('all');

  const galleryItems: GalleryItem[] = [
    {
      id: '1',
      title: 'Grand Final Championship Trophy',
      season: 'Season 8',
      category: 'cricket',
      image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80',
      caption: 'The thrilling last-over finish in the RPL S8 Cricket Finals.',
    },
    {
      id: '2',
      title: 'Football League Golden Boot Winner',
      season: 'Season 8',
      category: 'football',
      image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80',
      caption: 'Stunning 30-yard free kick goal under matchday floodlights.',
    },
    {
      id: '3',
      title: "Women's Sports Champions",
      season: 'Season 8',
      category: 'womens',
      image: 'https://images.unsplash.com/photo-1517649763962-0c623266010b?auto=format&fit=crop&w=800&q=80',
      caption: "Vitraag Vigyaan Women's League trophy celebration moment.",
    },
    {
      id: '4',
      title: 'High-Flying Boundary Catch',
      season: 'Season 7',
      category: 'cricket',
      image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=800&q=80',
      caption: 'Unbelievable diving catch at the long-on boundary rope.',
    },
    {
      id: '5',
      title: 'Turf Football Penalty Shootout',
      season: 'Season 7',
      category: 'football',
      image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
      caption: 'Nail-biting penalty shootout during semi-final fixtures.',
    },
    {
      id: '6',
      title: 'Community Unity & Celebration',
      season: 'Season 8',
      category: 'womens',
      image: 'https://images.unsplash.com/photo-1526676037777-05a232554f77?auto=format&fit=crop&w=800&q=80',
      caption: 'Teams gathering for the annual Vitraag Vigyaan RPL opening ceremony.',
    },
  ];

  const filteredItems =
    activeFilter === 'all'
      ? galleryItems
      : galleryItems.filter((item) => item.category === activeFilter);

  return (
    <section id="gallery" className="py-24 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header with InView */}
        <InView
          viewOptions={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-600 block mb-3">
            SEASON MEMORIES
          </span>
          <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 mb-6">
            RPL Highlights & <span className="text-gradient-emerald">Glory</span>
          </h2>
          <p className="text-slate-700 text-base md:text-lg font-medium leading-relaxed">
            Relive iconic moments from past RPL seasons. Get ready to create history in Season 9!
          </p>
        </InView>

        {/* Filter Tab Bar with InView */}
        <InView
          viewOptions={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55, delay: 0.1, ease: 'easeOut' }}
          className="flex flex-wrap justify-center items-center gap-3 mb-12"
        >
          {[
            { id: 'all', label: 'All Moments' },
            { id: 'cricket', label: 'Cricket' },
            { id: 'football', label: 'Football' },
            { id: 'womens', label: "Women's League" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as any)}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all border ${
                activeFilter === tab.id
                  ? 'bg-gradient-to-r from-amber-500 via-emerald-500 to-pink-500 text-white border-transparent shadow-md scale-105'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </InView>

        {/* Asymmetrical Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item, idx) => {
            const isHeroCard = idx === 0 && activeFilter === 'all';
            return (
              <InView
                key={item.id}
                viewOptions={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.55, delay: idx * 0.08, ease: 'easeOut' }}
                className={isHeroCard ? 'md:col-span-2 lg:col-span-2' : ''}
              >
                <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-md group hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 h-full">
                  <div className={`relative overflow-hidden ${isHeroCard ? 'h-80 md:h-96' : 'h-64'}`}>
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
                    <span className="absolute top-4 left-4 font-display text-xs uppercase font-extrabold tracking-wider px-3 py-1 rounded-full bg-white/90 text-amber-700 border border-amber-200 shadow-sm">
                      {item.season}
                    </span>
                  </div>

                  <div className="p-6">
                    <h3 className={`font-display font-bold text-slate-900 mb-2 group-hover:text-amber-600 transition-colors ${isHeroCard ? 'text-2xl md:text-3xl' : 'text-xl'}`}>
                      {item.title}
                    </h3>
                    <p className="text-slate-600 text-sm font-medium leading-relaxed">{item.caption}</p>
                  </div>
                </div>
              </InView>
            );
          })}
        </div>
      </div>
    </section>
  );
};
