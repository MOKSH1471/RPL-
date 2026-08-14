import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search } from 'lucide-react';

export interface CountryCode {
  country: string;
  code: string;
  flag: string;
  iso: string;
}

export const COUNTRY_CODES: CountryCode[] = [
  { country: 'India', code: '+91', flag: '🇮🇳', iso: 'IN' },
  { country: 'United Arab Emirates', code: '+971', flag: '🇦🇪', iso: 'AE' },
  { country: 'United States', code: '+1', flag: '🇺🇸', iso: 'US' },
  { country: 'United Kingdom', code: '+44', flag: '🇬🇧', iso: 'GB' },
  { country: 'Canada', code: '+1', flag: '🇨🇦', iso: 'CA' },
  { country: 'Singapore', code: '+65', flag: '🇸🇬', iso: 'SG' },
  { country: 'Australia', code: '+61', flag: '🇦🇺', iso: 'AU' },
  { country: 'Kenya', code: '+254', flag: '🇰🇪', iso: 'KE' },
  { country: 'Tanzania', code: '+255', flag: '🇹🇿', iso: 'TZ' },
  { country: 'New Zealand', code: '+64', flag: '🇳🇿', iso: 'NZ' },
  { country: 'Oman', code: '+968', flag: '🇴🇲', iso: 'OM' },
  { country: 'Qatar', code: '+974', flag: '🇶🇦', iso: 'QA' },
  { country: 'Saudi Arabia', code: '+966', flag: '🇸🇦', iso: 'SA' },
  { country: 'South Africa', code: '+27', flag: '🇿🇦', iso: 'ZA' },
  { country: 'Bahrain', code: '+973', flag: '🇧🇭', iso: 'BH' },
  { country: 'Kuwait', code: '+965', flag: '🇰🇼', iso: 'KW' },
  { country: 'Germany', code: '+49', flag: '🇩🇪', iso: 'DE' },
  { country: 'Switzerland', code: '+41', flag: '🇨🇭', iso: 'CH' },
  { country: 'Malaysia', code: '+60', flag: '🇲🇾', iso: 'MY' },
  { country: 'Hong Kong', code: '+852', flag: '🇭🇰', iso: 'HK' },
];

interface CountryCodeSelectProps {
  value: string; // e.g. '+91'
  onChange: (code: string) => void;
  className?: string;
}

export const CountryCodeSelect: React.FC<CountryCodeSelectProps> = ({
  value = '+91',
  onChange,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedCountry = COUNTRY_CODES.find((c) => c.code === value) || COUNTRY_CODES[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = COUNTRY_CODES.filter(
    (c) =>
      c.country.toLowerCase().includes(search.toLowerCase()) ||
      c.code.includes(search) ||
      c.iso.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (code: string) => {
    onChange(code);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div ref={containerRef} className={`relative flex items-stretch shrink-0 ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center space-x-1.5 px-3.5 py-3 bg-transparent hover:bg-slate-200/50 text-slate-900 font-bold text-sm min-h-[48px] transition-colors cursor-pointer rounded-l-2xl shrink-0 select-none"
      >
        <span className="text-base">{selectedCountry.flag}</span>
        <span className="font-mono text-xs sm:text-sm font-extrabold">{selectedCountry.code}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-amber-600' : ''
          }`}
        />
      </button>

      {/* Country Code Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute top-full left-0 mt-2 z-50 w-72 sm:w-80 p-3 bg-white rounded-2xl border border-slate-200 shadow-2xl space-y-2"
          >
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search country or code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
                className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-amber-600 font-medium"
              />
            </div>

            {/* Country List */}
            <div className="max-h-60 overflow-y-auto space-y-0.5 pr-1">
              {filtered.map((item) => {
                const isSelected = item.code === value && item.country === selectedCountry.country;
                return (
                  <button
                    key={`${item.iso}-${item.code}`}
                    type="button"
                    onClick={() => handleSelect(item.code)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-50 text-amber-900 font-bold border border-amber-200'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <span className="text-base shrink-0">{item.flag}</span>
                      <span className="truncate">{item.country}</span>
                    </div>
                    <span className="font-mono text-slate-900 font-extrabold ml-2 shrink-0">
                      {item.code}
                    </span>
                  </button>
                );
              })}

              {filtered.length === 0 && (
                <div className="text-center py-4 text-xs text-slate-400">
                  No country found for "{search}"
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CountryCodeSelect;
