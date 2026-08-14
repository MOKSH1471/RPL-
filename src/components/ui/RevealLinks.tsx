import React from "react";
import { motion } from "framer-motion";

const DURATION = 0.25;
const STAGGER = 0.025;

export interface FlipTextProps {
  children: string;
  className?: string;
  isFlipped?: boolean;
}

export const FlipText: React.FC<FlipTextProps> = ({
  children,
  className = "",
  isFlipped,
}) => {
  return (
    <span
      className={`relative inline-block overflow-hidden whitespace-nowrap select-none pointer-events-none ${className}`}
      style={{
        lineHeight: 1.15,
      }}
    >
      {/* Top text layer moving up */}
      <span className="block pointer-events-none">
        {children.split("").map((l, i) => (
          <motion.span
            key={i}
            variants={{
              initial: {
                y: 0,
              },
              hovered: {
                y: "-110%",
              },
            }}
            animate={isFlipped !== undefined ? (isFlipped ? "hovered" : "initial") : undefined}
            transition={{
              duration: DURATION,
              ease: [0.33, 1, 0.68, 1],
              delay: STAGGER * i,
            }}
            className="inline-block pointer-events-none"
          >
            {l === " " ? "\u00A0" : l}
          </motion.span>
        ))}
      </span>

      {/* Bottom text layer moving in */}
      <span className="absolute inset-0 pointer-events-none">
        {children.split("").map((l, i) => (
          <motion.span
            key={i}
            variants={{
              initial: {
                y: "110%",
              },
              hovered: {
                y: 0,
              },
            }}
            animate={isFlipped !== undefined ? (isFlipped ? "hovered" : "initial") : undefined}
            transition={{
              duration: DURATION,
              ease: [0.33, 1, 0.68, 1],
              delay: STAGGER * i,
            }}
            className="inline-block pointer-events-none"
          >
            {l === " " ? "\u00A0" : l}
          </motion.span>
        ))}
      </span>
    </span>
  );
};

export interface FlipLinkProps {
  children: string;
  href: string;
  className?: string;
  target?: string;
  rel?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export const FlipLink: React.FC<FlipLinkProps> = ({
  children,
  href,
  className = "",
  target,
  rel,
  onClick,
}) => {
  return (
    <motion.a
      href={href}
      target={target}
      rel={rel}
      onClick={onClick}
      initial="initial"
      whileHover="hovered"
      whileTap="hovered"
      className={`relative inline-block max-w-full overflow-hidden whitespace-nowrap font-black uppercase tracking-tight py-1 select-none cursor-pointer touch-manipulation active:opacity-90 ${className}`}
      style={{
        lineHeight: 1.15,
      }}
    >
      <FlipText>{children}</FlipText>
    </motion.a>
  );
};

export const RevealLinks: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <section className={`grid place-content-center gap-4 px-4 py-16 text-slate-900 max-w-full overflow-hidden ${className}`}>
      <FlipLink
        href="https://instagram.com"
        target="_blank"
        rel="noopener noreferrer"
        className="text-3xl sm:text-5xl md:text-6xl hover:text-pink-600 transition-colors"
      >
        Instagram
      </FlipLink>
      <FlipLink
        href="https://youtube.com"
        target="_blank"
        rel="noopener noreferrer"
        className="text-3xl sm:text-5xl md:text-6xl hover:text-red-600 transition-colors"
      >
        YouTube
      </FlipLink>
      <FlipLink
        href="https://chat.whatsapp.com"
        target="_blank"
        rel="noopener noreferrer"
        className="text-3xl sm:text-5xl md:text-6xl hover:text-emerald-600 transition-colors"
      >
        WhatsApp
      </FlipLink>
      <FlipLink
        href="#register"
        className="text-3xl sm:text-5xl md:text-6xl hover:text-amber-500 transition-colors"
      >
        Register Now
      </FlipLink>
    </section>
  );
};

export default RevealLinks;
