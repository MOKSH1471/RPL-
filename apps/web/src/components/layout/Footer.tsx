import React from 'react';
import { InView } from '@/components/ui/in-view';
import { FlipLink } from '@/components/ui/RevealLinks';
import { MessageCircle, Mail, ExternalLink, Heart, Sparkles } from 'lucide-react';

interface FooterProps {
  onRegisterClick?: () => void;
  onCheckPassClick?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onRegisterClick, onCheckPassClick }) => {

  return (
    <footer className="relative z-10 border-t border-slate-200 bg-white pt-10 sm:pt-16 pb-24 sm:pb-16 safe-bottom w-full max-w-full overflow-hidden">
      <InView
        viewOptions={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
        className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8"
      >
        {/* Interactive Staggered Reveal Links Section */}
        <div id="connect" className="mb-16 pb-12 border-b border-slate-200 scroll-mt-24">
          <div className="flex items-center space-x-2 mb-6">
            <span className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-700 text-amber-300 font-extrabold text-[11px] uppercase tracking-wider shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>CONNECT WITH RPL</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-8 pt-2">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Official Media
              </span>
              <FlipLink
                href="https://www.instagram.com/s/aGlnaGxpZ2h0OjE4MTAzMTUwNTIzMDU4ODUx?story_media_id=3882939722385675094_8604235348&rpxt=dGt5Y2RzNDgxOWp3"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-900 hover:text-pink-600 transition-colors text-xl sm:text-2xl lg:text-[1.65rem] xl:text-3xl font-extrabold tracking-tight"
              >
                Instagram
              </FlipLink>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Live Stream
              </span>
              <FlipLink
                className="text-slate-900 hover:text-red-600 transition-colors text-xl sm:text-2xl lg:text-[1.65rem] xl:text-3xl font-extrabold tracking-tight cursor-default"
              >
                YouTube Live
              </FlipLink>
            </div>


          </div>



        </div>



        {/* 4-Column Footer Information */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Column 1: Brand & Logo */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <img
                src="/rpl-logo.png"
                alt="Raj Premier League"
                className="h-10 w-auto object-contain drop-shadow-xs"
              />
              <span className="font-display font-extrabold text-2xl text-slate-900 tracking-wider">
                Raj Premier League
              </span>
            </div>
            <p className="text-slate-600 text-sm font-medium max-w-md leading-relaxed">
              Raj Premier League (RPL) is an annual community sports championship, bringing together athletes from all around the world.
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
                <a href="#schedule" className="hover:text-amber-600 transition-colors">
                  Match Schedule
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
                <a href="#/faq" className="hover:text-amber-600 transition-colors">
                  Frequently Asked Questions (FAQ)
                </a>
              </li>
              <li>
                <a href="#register" className="hover:text-amber-600 transition-colors">
                  Player Registration
                </a>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onCheckPassClick}
                  className="hover:text-amber-600 transition-colors text-left font-medium cursor-pointer"
                >
                  Check Pass
                </button>
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
                <a
                  href="https://wa.me/919321001499"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-600 transition-colors"
                >
                  +91 9321001499
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-pink-600 shrink-0" />
                <a
                  href="https://mail.google.com/mail/?view=cm&to=info.rplevents@gmail.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-pink-600 transition-colors"
                >
                  info.rplevents@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 sm:pt-8 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 font-medium gap-3 sm:gap-4">
          <p>© 2026 Raj Premier League (RPL). All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a
              href="#/faq"
              className="hover:text-amber-600 transition-colors underline underline-offset-2"
            >
              FAQ
            </a>
            <a
              href="#/privacy-policy"
              className="hover:text-amber-600 transition-colors underline underline-offset-2"
            >
              Privacy Policy
            </a>
            <a
              href="#/terms"
              className="hover:text-amber-600 transition-colors underline underline-offset-2"
            >
              Terms &amp; Conditions
            </a>
            <p className="flex items-center space-x-1">
              <span>Crafted with passion for community sports</span>
              <Heart className="w-3.5 h-3.5 text-pink-600 fill-pink-600 inline" />
            </p>
          </div>
        </div>
      </InView>
    </footer>
  );
};

export default Footer;
