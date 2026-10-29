import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

interface SixerStrikeAnimationProps {
  /** Callback fired when the animation completes and fades out */
  onComplete: () => void;
}

type AnimationPhase = 'ball' | 'six' | 'flip-to-logo' | 'logo' | 'fade-out';

export const SixerStrikeAnimation: React.FC<SixerStrikeAnimationProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<AnimationPhase>('ball');
  // Use pre-cropped, 100% transparent PNG with zero background box
  const [cutoutLogoSrc, setCutoutLogoSrc] = useState<string>('/traket_logo_cutout.png');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Store onComplete in a ref so useEffect timers never get wiped when parent re-renders
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Fireworks Spark Burst on ball impact
  const triggerImpactSparks = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2 - 15;

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      color: string;
      radius: number;
      alpha: number;
      decay: number;
    }

    const colors = ['#F59E0B', '#EF4444', '#38BDF8', '#10B981', '#FFFFFF', '#FDE047', '#3B82F6'];
    const particles: Particle[] = [];

    for (let i = 0; i < 120; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 15 + 4;
      particles.push({
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: colors[Math.floor(Math.random() * colors.length)],
        radius: Math.random() * 3.5 + 1.2,
        alpha: 1,
        decay: Math.random() * 0.024 + 0.015,
      });
    }

    let animId: number;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let alive = false;
      for (const p of particles) {
        if (p.alpha > 0.01) {
          alive = true;
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.22; // gravity
          p.vx *= 0.98;
          p.alpha -= p.decay;

          ctx.save();
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.restore();
        }
      }

      if (alive) {
        animId = requestAnimationFrame(render);
      }
    };

    animId = requestAnimationFrame(render);
  };

  // Main Choreography Sequence: empty dependency array so parent polling re-renders never cancel timers
  useEffect(() => {
    // 0.65s: Ball arrives at center -> detonates into sparks -> 3D plain 6 appears
    const timer1 = setTimeout(() => {
      triggerImpactSparks();
      setPhase('six');
    }, 650);

    // 1.90s: Plain 3D Number 6 begins fluid 3D flip towards TRAKET Logo
    const timer2 = setTimeout(() => {
      setPhase('flip-to-logo');
    }, 1900);

    // 2.30s: Mid-flip confetti explosion & switch face to TRAKET Logo
    const timer3 = setTimeout(() => {
      setPhase('logo');
      try {
        confetti({
          particleCount: 65,
          spread: 90,
          origin: { y: 0.5 },
          colors: ['#0284C7', '#10B981', '#F59E0B', '#38BDF8', '#FFFFFF'],
        });
      } catch {
        // Confetti fallback
      }
    }, 2300);

    // 4.60s: Graceful fade-out back into the live scorecard
    const timer4 = setTimeout(() => {
      setPhase('fade-out');
    }, 4600);

    // 5.15s: Auto-finish and completely dismiss overlay
    const timer5 = setTimeout(() => {
      onCompleteRef.current?.();
    }, 5150);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
    };
  }, []);

  const handleDismiss = () => {
    onCompleteRef.current?.();
  };

  const isFlipped = phase === 'flip-to-logo' || phase === 'logo' || phase === 'fade-out';

  return (
    <div
      onClick={handleDismiss}
      className="fixed inset-0 z-[60] flex items-center justify-center overflow-hidden select-none cursor-pointer"
      title="Click anywhere to dismiss"
    >
      {/* Spark Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-20"
      />

      {/* STAGE 1: Incoming Cricket Ball with Aerodynamic Flame Trail */}
      <AnimatePresence>
        {phase === 'ball' && (
          <motion.div
            key="cricket-ball"
            initial={{
              x: '-45vw',
              y: '45vh',
              scale: 0.2,
              rotate: 0,
              opacity: 0.9,
            }}
            animate={{
              x: 0,
              y: -15,
              scale: 1.6,
              rotate: 840,
              opacity: 1,
            }}
            exit={{
              scale: 2.2,
              opacity: 0,
              transition: { duration: 0.12 },
            }}
            transition={{
              duration: 0.65,
              ease: [0.16, 1, 0.3, 1], // explosive crack trajectory
            }}
            className="absolute z-30 pointer-events-none flex items-center justify-center"
          >
            {/* Luminous Aerodynamic Motion Tail */}
            <div
              className="absolute w-52 h-10 -left-44 rounded-full opacity-80 pointer-events-none blur-[4px]"
              style={{
                background:
                  'linear-gradient(to right, transparent, rgba(254,243,199,0.1), rgba(245,158,11,0.8), rgba(255,255,255,1))',
                transform: 'rotate(-25deg)',
              }}
            />

            {/* Realistic 3D Cricket Ball */}
            <svg
              className="w-20 h-20 drop-shadow-[0_12px_28px_rgba(239,68,68,0.75)]"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <radialGradient id="ballShading" cx="35%" cy="35%" r="65%">
                  <stop offset="0%" stopColor="#FFA4A4" />
                  <stop offset="25%" stopColor="#EF4444" />
                  <stop offset="70%" stopColor="#B91C1C" />
                  <stop offset="100%" stopColor="#7F1D1D" />
                </radialGradient>
              </defs>
              <circle cx="50" cy="50" r="46" fill="url(#ballShading)" />
              {/* White Cricket Seam Stitches */}
              <path
                d="M18 50 C26 28, 74 28, 82 50"
                stroke="#FFFFFF"
                strokeWidth="3.5"
                strokeDasharray="4 2"
                strokeLinecap="round"
                opacity="0.9"
              />
              <path
                d="M18 50 C26 72, 74 72, 82 50"
                stroke="#FFFFFF"
                strokeWidth="3.5"
                strokeDasharray="4 2"
                strokeLinecap="round"
                opacity="0.9"
              />
              {/* Specular Shine Highlight */}
              <ellipse
                cx="38"
                cy="32"
                rx="14"
                ry="8"
                fill="#FFFFFF"
                opacity="0.45"
                transform="rotate(-20 38 32)"
              />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>

      {/* STAGE 2 & 3: 3D Flip Container (Number 6 flips into Freestanding Cut-Out Logo) */}
      <AnimatePresence>
        {phase !== 'ball' && (
          <motion.div
            key="3d-flip-scene"
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: phase === 'fade-out' ? 1.08 : 1,
              opacity: phase === 'fade-out' ? 0 : 1,
            }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{
              scale: { type: 'spring', damping: 14, stiffness: 200 },
              opacity: { duration: 0.55 },
            }}
            className="relative z-30 flex flex-col items-center justify-center pointer-events-none"
            style={{ perspective: 1400 }}
          >
            {/* Clean Impact Shockwave Ring on 'six' entrance */}
            {phase === 'six' && (
              <motion.div
                initial={{ scale: 0.2, opacity: 1 }}
                animate={{ scale: 3.2, opacity: 0 }}
                transition={{ duration: 0.65, ease: 'easeOut' }}
                className="absolute w-72 h-72 rounded-full border-4 border-cyan-400 pointer-events-none blur-xs"
              />
            )}

            {/* The 3D Flipping Body with smooth 180° rotation */}
            <motion.div
              className="relative w-84 sm:w-96 md:w-[420px] h-84 sm:h-96 md:h-[420px] flex items-center justify-center"
              animate={{
                rotateY: isFlipped ? 180 : 0,
              }}
              transition={{
                duration: 0.95,
                ease: [0.34, 1.35, 0.64, 1], // fluid 3D coin flip
              }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* FRONT FACE: 3D Plain Metallic Chrome Number 6 (NO BOX, NO TRICOLOUR) */}
              <div
                className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none transition-opacity duration-300"
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  opacity: phase === 'six' || phase === 'flip-to-logo' ? 1 : 0,
                  transform: 'rotateY(0deg)',
                }}
              >
                <div className="relative flex items-center justify-center">
                  {/* Cyan backlight aura */}
                  <div className="absolute w-60 h-60 rounded-full bg-cyan-400/25 blur-3xl" />

                  {/* Plain 3D Chrome Numeral 6 SVG */}
                  <svg
                    className="w-60 h-72 drop-shadow-[0_20px_45px_rgba(14,165,233,0.7)] filter"
                    viewBox="0 0 200 240"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <defs>
                      <linearGradient id="chromeMetal" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FFFFFF" />
                        <stop offset="20%" stopColor="#E2E8F0" />
                        <stop offset="45%" stopColor="#94A3B8" />
                        <stop offset="70%" stopColor="#F1F5F9" />
                        <stop offset="100%" stopColor="#475569" />
                      </linearGradient>
                      <linearGradient id="neonCyan" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#38BDF8" />
                        <stop offset="50%" stopColor="#0284C7" />
                        <stop offset="100%" stopColor="#0369A1" />
                      </linearGradient>
                    </defs>

                    {/* Deep 3D Bevel Shadow */}
                    <path
                      d="M130 25 C75 25 35 65 35 125 C35 185 75 220 125 220 C165 220 190 190 190 155 C190 120 165 95 125 95 C105 95 90 102 80 112 C82 78 105 55 138 55 C152 55 165 60 172 65 L182 38 C168 30 150 25 130 25 Z M122 125 C145 125 158 138 158 156 C158 174 144 188 122 188 C100 188 86 174 86 156 C86 138 100 125 122 125 Z"
                      fill="#0F172A"
                      transform="translate(6, 8)"
                      opacity="0.4"
                    />

                    {/* Electric Cyan Rim */}
                    <path
                      d="M130 25 C75 25 35 65 35 125 C35 185 75 220 125 220 C165 220 190 190 190 155 C190 120 165 95 125 95 C105 95 90 102 80 112 C82 78 105 55 138 55 C152 55 165 60 172 65 L182 38 C168 30 150 25 130 25 Z M122 125 C145 125 158 138 158 156 C158 174 144 188 122 188 C100 188 86 174 86 156 C86 138 100 125 122 125 Z"
                      fill="url(#neonCyan)"
                    />

                    {/* Plain Chrome Metallic Front Face (Plain, No Tricolour) */}
                    <path
                      d="M130 30 C80 30 42 68 42 125 C42 180 78 214 125 214 C160 214 184 186 184 155 C184 124 160 101 125 101 C107 101 94 107 85 116 C88 80 110 59 138 59 C150 59 160 63 167 67 L175 44 C162 35 148 30 130 30 Z M122 130 C141 130 152 141 152 156 C152 171 141 182 122 182 C103 182 92 171 92 156 C92 141 103 130 122 130 Z"
                      fill="url(#chromeMetal)"
                      stroke="#FFFFFF"
                      strokeWidth="1.5"
                    />

                    {/* Racing Decal Grooves */}
                    <path
                      d="M58 115 C62 75 88 52 120 48"
                      stroke="#0284C7"
                      strokeWidth="3.5"
                      strokeDasharray="6 4"
                      fill="none"
                    />
                    <path
                      d="M100 196 C130 196 168 185 172 155"
                      stroke="#0284C7"
                      strokeWidth="3.5"
                      strokeDasharray="6 4"
                      fill="none"
                    />
                  </svg>
                </div>
              </div>

              {/* BACK FACE: Freestanding Cut-Out TRAKET Logo (NO BOX, NO CARD, INDEPENDENT) */}
              <div
                className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none transition-opacity duration-300"
                style={{
                  transform: 'rotateY(180deg)',
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  opacity: isFlipped ? 1 : 0,
                }}
              >
                {/* Floating Freestanding Emblem with Emerald/Cyan Aura */}
                <div className="relative flex flex-col items-center justify-center">
                  {/* Glowing atmospheric halo */}
                  <div className="absolute w-96 h-96 rounded-full bg-emerald-400/20 blur-3xl animate-pulse" />
                  <div className="absolute w-80 h-80 rounded-full bg-cyan-400/20 blur-2xl" />

                  {/* Cut-Out Logo (NO BOX, NO CARD, completely freestanding and little bigger) */}
                  <img
                    src={cutoutLogoSrc}
                    alt="Traket Multiventures"
                    className="w-72 sm:w-84 md:w-[335px] max-w-[88vw] h-auto object-contain filter drop-shadow-[0_16px_36px_rgba(2,132,199,0.6)] drop-shadow-[0_4px_16px_rgba(16,185,129,0.35)] select-none"
                    style={{
                      background: 'transparent',
                    }}
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
