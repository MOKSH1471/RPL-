import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

export interface WicketStrikeAnimationProps {
  /** Callback fired when the animation completes and fades out */
  onComplete: () => void;
}

type AnimationPhase = 'out' | 'flip-to-logo' | 'logo' | 'fade-out';

/**
 * Unified Wicket Animation:
 * Instantly pops up the bold 3D metallic word "OUT" (no ball first),
 * then dynamically flips 180° into the high-contrast, freestanding SeaMak GROUP logo.
 */
export const WicketStrikeAnimation: React.FC<WicketStrikeAnimationProps> = ({
  onComplete,
}) => {
  // Start immediately with the "OUT" pop up - NO ball first!
  const [phase, setPhase] = useState<AnimationPhase>('out');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Store onComplete in a ref so useEffect timers never get wiped when parent re-renders
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Fireworks Spark Burst on instant OUT pop up
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

    // Fiery red, electric crimson, amber, and gold spark palette
    const colors = ['#EF4444', '#DC2626', '#F59E0B', '#F87171', '#FFFFFF', '#FDE047', '#E11D48'];
    const particles: Particle[] = [];

    for (let i = 0; i < 130; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 15 + 4;
      particles.push({
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        radius: Math.random() * 3.6 + 1.2,
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
          ctx.shadowBlur = 10;
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

  // Main Choreography Sequence (Immediate OUT pop up -> 3D flip -> SeaMak logo -> fade out)
  useEffect(() => {
    // Immediate spark detonation alongside the OUT pop up
    triggerImpactSparks();

    // 1.50s: 3D "OUT" begins fluid 3D coin flip towards SeaMak GROUP Logo
    const timer1 = setTimeout(() => {
      setPhase('flip-to-logo');
    }, 1500);

    // 1.90s: Mid-flip confetti explosion (magenta, purple, gold brand colors) & reveal SeaMak logo
    const timer2 = setTimeout(() => {
      setPhase('logo');
      try {
        confetti({
          particleCount: 75,
          spread: 95,
          origin: { y: 0.5 },
          colors: ['#A21CAF', '#C026D3', '#E879F9', '#F59E0B', '#FFFFFF', '#EF4444'],
        });
      } catch {
        // Confetti fallback
      }
    }, 1900);

    // 4.30s: Graceful fade-out back into the live scorecard
    const timer3 = setTimeout(() => {
      setPhase('fade-out');
    }, 4300);

    // 4.80s: Auto-finish and completely dismiss overlay
    const timer4 = setTimeout(() => {
      onCompleteRef.current?.();
    }, 4800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
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

      {/* 3D Flip Container: "OUT" Pop Up flips into High-Contrast SeaMak GROUP Logo */}
      <AnimatePresence>
        <motion.div
          key="wicket-3d-scene"
          initial={{ scale: 0.3, opacity: 0 }}
          animate={{
            scale: phase === 'fade-out' ? 1.08 : 1,
            opacity: phase === 'fade-out' ? 0 : 1,
          }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{
            scale: { type: 'spring', damping: 14, stiffness: 220 },
            opacity: { duration: 0.5 },
          }}
          className="relative z-30 flex flex-col items-center justify-center pointer-events-none"
          style={{ perspective: 1400 }}
        >
          {/* Shockwave Ring on instant OUT entrance */}
          {phase === 'out' && (
            <motion.div
              initial={{ scale: 0.2, opacity: 1 }}
              animate={{ scale: 3.4, opacity: 0 }}
              transition={{ duration: 0.65, ease: 'easeOut' }}
              className="absolute w-80 h-80 rounded-full border-4 border-red-500 pointer-events-none blur-xs"
            />
          )}

          {/* The 3D Flipping Body with smooth 180° rotation */}
          <motion.div
            className="relative w-88 sm:w-[460px] md:w-[500px] h-88 sm:h-[460px] md:h-[500px] flex items-center justify-center"
            animate={{
              rotateY: isFlipped ? 180 : 0,
            }}
            transition={{
              duration: 0.95,
              ease: [0.34, 1.35, 0.64, 1], // fluid 3D coin flip
            }}
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* FRONT FACE: Instant 3D Chrome Metallic "OUT" Pop Up */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none transition-opacity duration-300"
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                opacity: phase === 'out' || phase === 'flip-to-logo' ? 1 : 0,
                transform: 'rotateY(0deg)',
              }}
            >
              <div className="relative flex flex-col items-center justify-center">
                {/* Fiery crimson backlight aura */}
                <div className="absolute w-84 h-84 rounded-full bg-red-600/30 blur-3xl" />

                {/* 3D Metallic OUT SVG Pop Up */}
                <svg
                  className="w-72 sm:w-96 md:w-[420px] h-auto drop-shadow-[0_20px_45px_rgba(239,68,68,0.75)] filter"
                  viewBox="0 0 340 180"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <linearGradient id="chromeMetalOut" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FFFFFF" />
                      <stop offset="20%" stopColor="#F1F5F9" />
                      <stop offset="45%" stopColor="#94A3B8" />
                      <stop offset="70%" stopColor="#F8FAFC" />
                      <stop offset="100%" stopColor="#475569" />
                    </linearGradient>
                    <linearGradient id="neonCrimsonRim" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FF4D4D" />
                      <stop offset="50%" stopColor="#EF4444" />
                      <stop offset="100%" stopColor="#991B1B" />
                    </linearGradient>
                  </defs>

                  {/* Flanking Championship Stars */}
                  <path
                    d="M28 110 L34 122 L47 124 L38 133 L40 146 L28 140 L16 146 L18 133 L9 124 L22 122 Z"
                    fill="#EF4444"
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M312 110 L318 122 L331 124 L322 133 L324 146 L312 140 L300 146 L302 133 L293 124 L306 122 Z"
                    fill="#EF4444"
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                  />

                  {/* Deep 3D Bevel Shadow */}
                  <text
                    x="176"
                    y="136"
                    fill="#0F172A"
                    opacity="0.45"
                    fontFamily="Impact, Arial Black, system-ui, sans-serif"
                    fontSize="120"
                    fontWeight="900"
                    textAnchor="middle"
                    letterSpacing="8"
                  >
                    OUT
                  </text>

                  {/* Electric Crimson Rim */}
                  <text
                    x="170"
                    y="128"
                    stroke="url(#neonCrimsonRim)"
                    strokeWidth="14"
                    strokeLinejoin="round"
                    fill="none"
                    fontFamily="Impact, Arial Black, system-ui, sans-serif"
                    fontSize="120"
                    fontWeight="900"
                    textAnchor="middle"
                    letterSpacing="8"
                  >
                    OUT
                  </text>

                  {/* Chrome Metallic Front Face */}
                  <text
                    x="170"
                    y="128"
                    fill="url(#chromeMetalOut)"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                    strokeLinejoin="round"
                    fontFamily="Impact, Arial Black, system-ui, sans-serif"
                    fontSize="120"
                    fontWeight="900"
                    textAnchor="middle"
                    letterSpacing="8"
                  >
                    OUT
                  </text>

                  {/* Racing Decal Grooves */}
                  <line
                    x1="65"
                    y1="78"
                    x2="275"
                    y2="78"
                    stroke="#EF4444"
                    strokeWidth="3.5"
                    strokeDasharray="10 6"
                    opacity="0.9"
                  />
                </svg>
              </div>
            </div>

            {/* BACK FACE: High-Contrast Freestanding SeaMak GROUP Logo (NO CAMOUFLAGE, NO BOX) */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none transition-opacity duration-300"
              style={{
                transform: 'rotateY(180deg)',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                opacity: isFlipped ? 1 : 0,
              }}
            >
              <div className="relative flex flex-col items-center justify-center">
                {/* 1. Luminous Pure-White Stadium Spotlight (completely prevents dark purple letters from camouflaging) */}
                <div
                  className="absolute w-[90%] max-w-[480px] h-36 rounded-full blur-2xl pointer-events-none"
                  style={{
                    background:
                      'radial-gradient(ellipse at center, rgba(255,255,255,0.96) 0%, rgba(250,232,255,0.85) 45%, rgba(192,38,211,0.3) 75%, transparent 100%)',
                  }}
                />

                {/* 2. Secondary Magenta/Purple Ambient Aura */}
                <div className="absolute w-[440px] h-[340px] rounded-full bg-fuchsia-600/25 blur-3xl animate-pulse" />

                {/* 3. Freestanding SeaMak GROUP Logo with Crisp Multi-layer White Outline + Glow */}
                <div className="relative p-3 flex flex-col items-center justify-center">
                  <img
                    src="/seamak_logo.png"
                    alt="SeaMak GROUP"
                    className="w-80 sm:w-96 md:w-[450px] max-w-[88vw] h-auto object-contain select-none"
                    style={{
                      background: 'transparent',
                      // Crisp white stroke contour around every letter + rich brand drop shadow
                      filter:
                        'drop-shadow(0 0 1.5px #FFFFFF) drop-shadow(0 0 5px rgba(255,255,255,0.95)) drop-shadow(0 4px 18px rgba(255,255,255,0.9)) drop-shadow(0 14px 32px rgba(162,28,175,0.75))',
                    }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
