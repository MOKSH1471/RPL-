import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { InView } from '@/components/ui/in-view';
import { GalleryItem } from '@/types';
import { X, ChevronLeft, ChevronRight, Maximize2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const GallerySection: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'cricket' | 'football' | 'womens' | 'ceremony'>('all');
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

  const galleryItems: GalleryItem[] = [
    {
      id: '1',
      title: 'RPL Season 8 Grand Inaugural Ceremony',
      season: 'Season 8',
      category: 'ceremony',
      image: '/rpl-photos/rpl-12.jpg',
      caption: 'Auditorium opening ceremony with team captains, dignitaries, LED stadium stage, and official flag bearers.',
    },
    {
      id: '2',
      title: 'Cricket Champions Coronation with Pujya Pappaji & Pujya Nileshbhai',
      season: 'Season 8',
      category: 'cricket',
      image: '/rpl-photos/rpl-21.jpg',
      caption: 'The winning cricket squad lifting the championship cup in the divine presence of Pujya Pappaji and Pujya Nileshbhai.',
    },
    {
      id: '3',
      title: 'Fast-Paced Turf Football Action',
      season: 'Season 8',
      category: 'football',
      image: '/rpl-photos/rpl-4.jpg',
      caption: 'Intense sprint and counter-attack during the floodlit knockout turf football matches.',
    },
    {
      id: '4',
      title: "Women's League Cricket Matchday",
      season: 'Season 8',
      category: 'womens',
      image: '/rpl-photos/rpl-2.jpg',
      caption: "Pinpoint bowling delivery and tense batting duel during the Women's Cricket Championship clash.",
    },
    {
      id: '5',
      title: 'Championship Trophy Jubilation with Pujya Nileshbhai',
      season: 'Season 8',
      category: 'ceremony',
      image: '/rpl-photos/rpl-5.jpg',
      caption: 'The champion team proudly celebrating and lifting the prestigious RPL championship trophy with Pujya Nileshbhai.',
    },
    {
      id: '6',
      title: 'Football Volley & Penalty Box Action',
      season: 'Season 8',
      category: 'football',
      image: '/rpl-photos/rpl-7.jpg',
      caption: 'Mid-air strike on the turf arena during a crucial league-stage encounter.',
    },
    {
      id: '7',
      title: 'Match-Winning Knock Ovation',
      season: 'Season 8',
      category: 'cricket',
      image: '/rpl-photos/rpl-1.jpg',
      caption: 'Cricket batsman acknowledging cheers from the stands after steering his squad into the finals.',
    },
    {
      id: '8',
      title: "Women's League Spirit & Joyous Celebration",
      season: 'Season 8',
      category: 'womens',
      image: '/rpl-photos/rpl-6.jpg',
      caption: 'Participants posing in themed celebratory attires, highlighting friendship, energy, and sportsmanship.',
    },
    {
      id: '9',
      title: 'The Golden Batsman & Stumps Trophies',
      season: 'Season 8',
      category: 'cricket',
      image: '/rpl-photos/rpl-10.jpg',
      caption: 'Custom gold-plated trophies awarded to the Best Batsman, Best Bowler, and Tournament MVP.',
    },
    {
      id: '10',
      title: 'Official Gold & Silver Championship Medals',
      season: 'Season 8',
      category: 'ceremony',
      image: '/rpl-photos/rpl-20.jpg',
      caption: 'Commemorative RPL medals crafted for podium finishers and individual milestone performers.',
    },
    {
      id: '11',
      title: 'Pre-Match Turf Dance Warm-Up Flashmob',
      season: 'Season 8',
      category: 'ceremony',
      image: '/rpl-photos/rpl-15.jpg',
      caption: 'Energetic synchronized community warm-up and dance kickstarting the tournament opening day.',
    },
    {
      id: '12',
      title: 'Captains Oath of Fair Play & Sportsmanship',
      season: 'Season 8',
      category: 'ceremony',
      image: '/rpl-photos/rpl-8.jpg',
      caption: 'Squad captains pledging commitment to humility, team unity, and pure sporting spirit with team flags.',
    },
    {
      id: '13',
      title: "Women's League Community Fun Games",
      season: 'Season 8',
      category: 'womens',
      image: '/rpl-photos/rpl-18.jpg',
      caption: 'Thrilling interactive challenge matches engaging youth and families across the Ashram courtyard.',
    },
    {
      id: '14',
      title: 'Cricket Runners-Up & Squad Fellowship',
      season: 'Season 8',
      category: 'cricket',
      image: '/rpl-photos/rpl-3.jpg',
      caption: 'Celebrating high-intensity sporting excellence with silver honors and camaraderie.',
    },
    {
      id: '15',
      title: 'Squad March-In onto the Turf Arena',
      season: 'Season 7',
      category: 'ceremony',
      image: '/rpl-photos/rpl-19.jpg',
      caption: 'Athletes marching into the arena under sunny skies with victory hand signs and high spirits.',
    },
    {
      id: '16',
      title: 'Cheering Squads & Team Colors',
      season: 'Season 7',
      category: 'ceremony',
      image: '/rpl-photos/rpl-23.jpg',
      caption: 'Supporters waving team banners and flags from the sidelines during championship matches.',
    },
  ];

  const filteredItems =
    activeFilter === 'all'
      ? galleryItems
      : galleryItems.filter((item) => item.category === activeFilter);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedPhotoIndex === null) return;
      if (e.key === 'Escape') setSelectedPhotoIndex(null);
      if (e.key === 'ArrowRight') handleNextPhoto();
      if (e.key === 'ArrowLeft') handlePrevPhoto();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPhotoIndex, filteredItems]);

  // Lock body scroll while lightbox is open (with scrollbar compensation to eliminate layout shift)
  useEffect(() => {
    if (selectedPhotoIndex !== null) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [selectedPhotoIndex]);

  const handleNextPhoto = () => {
    if (selectedPhotoIndex === null) return;
    setSelectedPhotoIndex((selectedPhotoIndex + 1) % filteredItems.length);
  };

  const handlePrevPhoto = () => {
    if (selectedPhotoIndex === null) return;
    setSelectedPhotoIndex((selectedPhotoIndex - 1 + filteredItems.length) % filteredItems.length);
  };

  const currentPhoto = selectedPhotoIndex !== null ? filteredItems[selectedPhotoIndex] : null;

  return (
    <section id="gallery" className="py-16 md:py-24 relative z-10 w-full max-w-full overflow-hidden bg-gradient-to-b from-slate-50 via-white to-amber-50/20">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Section Header with InView */}
        <InView
          viewOptions={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="text-center max-w-3xl mx-auto mb-10 md:mb-12"
        >
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold uppercase tracking-widest mb-3">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>AUTHENTIC RPL MEMORIES</span>
          </div>
          <h2 className="font-display font-extrabold text-slate-900 mb-3 md:mb-5" style={{ fontSize: 'clamp(1.75rem, 4vw + 0.5rem, 3.5rem)' }}>
            RPL Highlights & <span className="text-gradient-emerald">Glory</span>
          </h2>
          <p className="text-slate-700 text-sm sm:text-base md:text-lg font-medium leading-relaxed max-w-2xl mx-auto">
            Glimpses of unyielding passion, teamwork, celebrations, and divine camaraderie from past RPL seasons. Get ready for Season 9!
          </p>
        </InView>

        {/* Filter Tab Bar with InView */}
        <InView
          viewOptions={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55, delay: 0.1, ease: 'easeOut' }}
          className="flex flex-nowrap sm:flex-wrap justify-start sm:justify-center items-center gap-2 sm:gap-2.5 mb-10 md:mb-12 overflow-x-auto mobile-hide-scrollbar px-1 pb-1"
        >
          {[
            { id: 'all', label: 'All Highlights', count: galleryItems.length },
            { id: 'cricket', label: '🏏 Cricket', count: galleryItems.filter((i) => i.category === 'cricket').length },
            { id: 'football', label: '⚽ Football', count: galleryItems.filter((i) => i.category === 'football').length },
            { id: 'womens', label: "🏆 Women's League", count: galleryItems.filter((i) => i.category === 'womens').length },
            { id: 'ceremony', label: '✨ Ceremonies & Trophies', count: galleryItems.filter((i) => i.category === 'ceremony').length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveFilter(tab.id as any);
                setSelectedPhotoIndex(null);
              }}
              className={`flex-shrink-0 px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all border min-h-[44px] touch-manipulation cursor-pointer flex items-center space-x-2 ${
                activeFilter === tab.id
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-transparent shadow-md shadow-amber-500/20 scale-102'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full ${
                activeFilter === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </InView>

        {/* Gallery Grid - Balanced 4-column layout for 16 items (4x4) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
          {filteredItems.map((item, idx) => {
            const getCategoryBadge = (category: string) => {
              switch (category) {
                case 'cricket':
                  return { label: 'Cricket', icon: '🏏', bg: 'bg-amber-500/90 text-white' };
                case 'football':
                  return { label: 'Football', icon: '⚽', bg: 'bg-emerald-600/90 text-white' };
                case 'womens':
                  return { label: "Women's", icon: '🏆', bg: 'bg-pink-600/90 text-white' };
                case 'ceremony':
                  return { label: 'Ceremony', icon: '✨', bg: 'bg-purple-600/90 text-white' };
                default:
                  return { label: 'Highlight', icon: '🏅', bg: 'bg-slate-700/90 text-white' };
              }
            };
            const catInfo = getCategoryBadge(item.category);

            return (
              <InView
                key={item.id}
                viewOptions={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.45, delay: Math.min(idx * 0.03, 0.2), ease: 'easeOut' }}
              >
                <div
                  onClick={() => setSelectedPhotoIndex(idx)}
                  className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200/90 shadow-sm hover:shadow-xl transition-[transform,box-shadow] duration-200 hover:-translate-y-1 active:scale-[0.98] group cursor-pointer flex flex-col h-full"
                >
                  {/* Image Container with Consistent 4:3 Aspect Ratio */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                    <img
                      src={item.image}
                      alt={item.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 group-hover:from-black/50 transition-colors" />

                    {/* Top Badges */}
                    <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                      <span className="font-display text-[10px] sm:text-[11px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-amber-300 border border-amber-400/30 shadow-xs">
                        {item.season}
                      </span>
                      <span className={`text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full backdrop-blur-md border border-white/20 shadow-xs ${catInfo.bg}`}>
                        {catInfo.icon} {catInfo.label}
                      </span>
                    </div>

                    {/* Expand Zoom Indicator */}
                    <div className="absolute bottom-2.5 right-2.5 w-7 h-7 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-md">
                      <Maximize2 className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between">
                    <div>
                      <h3 className="font-display font-extrabold text-sm sm:text-base text-slate-900 leading-snug group-hover:text-amber-600 transition-colors mb-1 line-clamp-1">
                        {item.title}
                      </h3>
                      <p className="text-slate-600 text-xs font-medium leading-relaxed line-clamp-2">
                        {item.caption}
                      </p>
                    </div>

                    <div className="pt-2.5 mt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] sm:text-xs font-bold text-amber-600 group-hover:text-amber-700">
                      <span className="flex items-center space-x-1">
                        <Maximize2 className="w-3 h-3" />
                        <span>View full photo</span>
                      </span>
                      <span className="group-hover:translate-x-1 transition-transform font-mono">→</span>
                    </div>
                  </div>
                </div>
              </InView>
            );
          })}
        </div>
      </div>

      {/* High-Resolution Photo Lightbox Modal (Portal to body, Light RPL Theme, 100% Uncropped) */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {selectedPhotoIndex !== null && currentPhoto && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-2.5 sm:p-5 md:p-8">
                {/* Backdrop with independent smooth fade and no blur flicker */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
                  onClick={() => setSelectedPhotoIndex(null)}
                />

                {/* Light Theme Modal Card with stable scale & fade animation */}
                <motion.div
                  initial={{ scale: 0.96, opacity: 0, y: 8 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.96, opacity: 0, y: 8 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  onClick={(e) => e.stopPropagation()}
                  className="relative z-10 max-w-5xl w-full bg-white rounded-2xl sm:rounded-3xl border border-amber-200/90 shadow-2xl shadow-slate-900/25 flex flex-col max-h-[94vh] overflow-hidden"
                >
                  {/* Lightbox Header Bar */}
                  <div className="shrink-0 flex items-center justify-between px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-amber-50/90 via-white to-amber-50/60 border-b border-amber-100 select-none">
                    <div className="flex items-center space-x-2.5">
                      <span className="font-display text-[11px] sm:text-xs uppercase font-extrabold tracking-wider px-3 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300/80">
                        {currentPhoto.season}
                      </span>
                      <span className="text-xs sm:text-sm text-slate-500 font-bold">
                        Photo {selectedPhotoIndex + 1} of {filteredItems.length}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => setSelectedPhotoIndex(null)}
                        className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white hover:bg-amber-50 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-all cursor-pointer border border-slate-200 hover:border-amber-300 shadow-xs active:scale-95"
                        title="Close (Esc)"
                      >
                        <X className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Photo Display Frame - Pre-stabilized Height & Zero Jitter */}
                  <div className="relative flex-1 min-h-[260px] sm:min-h-[380px] md:min-h-[460px] max-h-[62vh] bg-slate-50/90 flex items-center justify-center p-2.5 sm:p-4 overflow-hidden">
                    <img
                      key={currentPhoto.image}
                      src={currentPhoto.image}
                      alt={currentPhoto.title}
                      style={{
                        maxHeight: 'min(60vh, 580px)',
                        maxWidth: '100%',
                      }}
                      className="w-auto h-auto object-contain select-none rounded-xl shadow-md border border-slate-200/80"
                    />

                    {/* Previous Navigation Arrow */}
                    {filteredItems.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePrevPhoto();
                        }}
                        className="absolute left-2.5 sm:left-5 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/95 hover:bg-white text-slate-800 hover:text-amber-600 flex items-center justify-center transition-all cursor-pointer border border-slate-200 shadow-lg active:scale-95"
                        title="Previous Photo (←)"
                      >
                        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                      </button>
                    )}

                    {/* Next Navigation Arrow */}
                    {filteredItems.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNextPhoto();
                        }}
                        className="absolute right-2.5 sm:right-5 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/95 hover:bg-white text-slate-800 hover:text-amber-600 flex items-center justify-center transition-all cursor-pointer border border-slate-200 shadow-lg active:scale-95"
                        title="Next Photo (→)"
                      >
                        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                      </button>
                    )}
                  </div>

                  {/* Caption & Details Footer - Light Warm Theme */}
                  <div className="shrink-0 px-4 sm:px-6 py-2.5 sm:py-3 bg-white border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm sm:text-base font-display font-extrabold text-slate-900 truncate">
                        {currentPhoto.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed line-clamp-2 mt-0.5">
                        {currentPhoto.caption}
                      </p>
                    </div>
                    <div className="shrink-0 hidden sm:flex items-center">
                      <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/80 uppercase">
                        {currentPhoto.category}
                      </span>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </section>
  );
};
