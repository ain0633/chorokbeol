import { motion } from 'framer-motion';
import greenPlanetImg from '@/assets/green-planet.png';

const FLOATING_DECORATIONS = [
  { emoji: '⭐', size: 'text-sm' },
  { emoji: '✨', size: 'text-xs' },
  { emoji: '🍀', size: 'text-sm' },
  { emoji: '⭐', size: 'text-[10px]' },
  { emoji: '✨', size: 'text-sm' },
  { emoji: '🍀', size: 'text-xs' },
  { emoji: '⭐', size: 'text-xs' },
  { emoji: '🌿', size: 'text-sm' },
  { emoji: '🌸', size: 'text-xs' },
  { emoji: '⭐', size: 'text-[10px]' },
];

interface GreenPlanetProps {
  glowIntensity: number;
}

export default function GreenPlanet({ glowIntensity }: GreenPlanetProps) {
  return (
    <div className="relative w-full flex items-center justify-center py-6">
      {/* Floating decorations */}
      {FLOATING_DECORATIONS.map((dec, i) => {
        const angle = (i / FLOATING_DECORATIONS.length) * Math.PI * 2;
        const radius = 42 + (i % 3) * 6;
        const cx = 50 + Math.cos(angle) * radius;
        const cy = 50 + Math.sin(angle) * radius;
        return (
          <motion.span
            key={i}
            className={`absolute ${dec.size} pointer-events-none z-10`}
            style={{ left: `${cx}%`, top: `${cy}%` }}
            animate={{
              y: [0, -8, 0],
              opacity: [0.3, 0.8, 0.3],
              scale: [0.8, 1.15, 0.8],
            }}
            transition={{
              duration: 3 + i * 0.4,
              repeat: Infinity,
              delay: i * 0.5,
            }}
          >
            {dec.emoji}
          </motion.span>
        );
      })}

      {/* Glow aura behind planet */}
      <motion.div
        className="absolute w-64 h-64 sm:w-72 sm:h-72 rounded-full"
        animate={{
          boxShadow: glowIntensity > 0
            ? '0 0 80px 30px rgba(168, 214, 114, 0.4), 0 0 150px 50px rgba(168, 214, 114, 0.15)'
            : '0 0 50px 15px rgba(168, 214, 114, 0.12), 0 0 100px 30px rgba(168, 214, 114, 0.05)',
        }}
        style={{
          background: 'radial-gradient(circle, rgba(168, 214, 114, 0.08) 0%, transparent 70%)',
        }}
      />

      {/* Planet image */}
      <motion.img
        src={greenPlanetImg}
        alt="초록별"
        className="relative z-[5] w-56 h-56 sm:w-64 sm:h-64 object-contain drop-shadow-2xl"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          filter: glowIntensity > 0
            ? 'drop-shadow(0 0 30px rgba(168, 214, 114, 0.5))'
            : 'drop-shadow(0 8px 20px rgba(0,0,0,0.3))',
        }}
      />
    </div>
  );
}
