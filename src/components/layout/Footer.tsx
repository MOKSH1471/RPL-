import React from 'react';
import { InView } from '@/components/ui/in-view';
import { FlipLink } from '@/components/ui/RevealLinks';
import { Trophy, MessageCircle, Mail, ExternalLink, Heart, Sparkles } from 'lucide-react';

interface FooterProps {
  onRegisterClick?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onRegisterClick }) => {

  return (
    <footer className="relative z-10 border-t border-slate-200 bg-white py-10 sm:py-16 safe-bottom w-full max-w-full overflow-hidden">
      <InView
        viewOptions={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
        className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8"
      >
        {/* Interactive Staggered Reveal Links Section */}
        <div className="mb-16 pb-12 border-b border-slate-200">
          <div className="flex items-center space-x-2 mb-6">
            <span className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-700 text-amber-300 font-extrabold text-[11px] uppercase tracking-wider shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>CONNECT WITH RPL</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 pt-2">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Official Media
              </span>
              <FlipLink
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-900 hover:text-pink-600 transition-colors text-2xl sm:text-3xl lg:text-4xl"
              >
                Instagram
              </FlipLink>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Match Highlights
              </span>
              <FlipLink
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-900 hover:text-red-600 transition-colors text-2xl sm:text-3xl lg:text-4xl"
              >
                YouTube
              </FlipLink>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Player Community
              </span>
              <FlipLink
                href="https://chat.whatsapp.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-900 hover:text-emerald-600 transition-colors text-2xl sm:text-3xl lg:text-4xl"
              >
                WhatsApp
              </FlipLink>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Season 9 Entry
              </span>
              <FlipLink
                href="#register"
                onClick={(e) => {
                  e.preventDefault();
                  onRegisterClick?.();
                }}
                className="text-slate-900 hover:text-amber-500 transition-colors text-2xl sm:text-3xl lg:text-4xl"
              >
                Register Now
              </FlipLink>
            </div>
          </div>



        </div>



        {/* 4-Column Footer Information */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Column 1: Brand & Logo */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 p-0.5 border border-slate-200 shadow-sm">
                <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-amber-600" />
                </div>
              </div>
              <span className="font-display font-extrabold text-2xl text-slate-900 tracking-wider">
                RPL <span className="text-gradient-vibrant">Season 9</span>
              </span>
            </div>
            <p className="text-slate-600 text-sm font-medium max-w-md leading-relaxed">
              Raj Premier League (RPL) is an annual community sports championship, bringing together athletes for Cricket, Football, Badminton, Table Tennis, Pickleball, Volleyball, and Women's sports leagues.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="font-display text-sm font-bold uppercase tracking-wider text-slate-900 mb-4">
              Quick Navigation
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-600 font-medium">
              <li>
                <a href="#about" className="hover:text-amber-600 transition-colors">
                  About RPL
                </a>
              </li>
              <li>
                <a href="#leagues" className="hover:text-amber-600 transition-colors">
                  Championship Leagues
                </a>
              </li>
              <li>
                <a href="#gallery" className="hover:text-amber-600 transition-colors">
                  Past Season Highlights
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-amber-600 transition-colors">
                  Tournament Process
                </a>
              </li>
              <li>
                <a href="#register" className="hover:text-amber-600 transition-colors">
                  Player Registration
                </a>
              </li>
              <li>
                <a href="#/admin" className="text-amber-600 font-bold hover:underline">
                  Admin Portal →
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact & Support */}
          <div>
            <h4 className="font-display text-sm font-bold uppercase tracking-wider text-slate-900 mb-4">
              Organizer Support
            </h4>
            <ul className="space-y-3 text-sm text-slate-600 font-medium">
              <li className="flex items-center space-x-3">
                <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>WhatsApp Helpline</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-pink-600 shrink-0" />
                <span>contact@rplseason9.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 sm:pt-8 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 font-medium gap-3 sm:gap-4">
          <p>© 2026 Raj Premier League (RPL Season 9). All rights reserved.</p>
          <p className="flex items-center space-x-1">
            <span>Crafted with passion for community sports</span>
            <Heart className="w-3.5 h-3.5 text-pink-600 fill-pink-600 inline" />
          </p>
        </div>
      </InView>
    </footer>
  );
};

export default Footer;
