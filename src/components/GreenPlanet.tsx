import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';

const FLOATING_DECORATIONS = [
  { emoji: '⭐', size: 'text-sm', color: 'text-sunlight' },
  { emoji: '✨', size: 'text-xs', color: 'text-sunlight' },
  { emoji: '🍀', size: 'text-sm', color: 'text-lime' },
  { emoji: '⭐', size: 'text-[10px]', color: 'text-orange-300' },
  { emoji: '✨', size: 'text-sm', color: 'text-pink-300' },
  { emoji: '🍀', size: 'text-xs', color: 'text-lime' },
  { emoji: '⭐', size: 'text-xs', color: 'text-sunlight' },
  { emoji: '🌿', size: 'text-sm', color: 'text-lime' },
];

const PLANET_PLANTS = [
  { emoji: '🌳', x: '50%', y: '18%', size: 'text-3xl' },
  { emoji: '🌿', x: '25%', y: '35%', size: 'text-xl' },
  { emoji: '🌸', x: '20%', y: '55%', size: 'text-lg' },
  { emoji: '🌺', x: '28%', y: '65%', size: 'text-base' },
  { emoji: '☘️', x: '48%', y: '45%', size: 'text-2xl' },
  { emoji: '🪴', x: '72%', y: '35%', size: 'text-xl' },
  { emoji: '🌱', x: '65%', y: '55%', size: 'text-lg' },
  { emoji: '🌾', x: '75%', y: '50%', size: 'text-base' },
];

interface GreenPlanetProps {
  glowIntensity: number;
}

export default function GreenPlanet({ glowIntensity }: GreenPlanetProps) {
  const { myPlants } = useAppStore();
  const plantCount = myPlants.length;

  return (
    <div className="relative w-full flex items-center justify-center py-4">
      {/* Floating decorations around the planet */}
      {FLOATING_DECORATIONS.map((dec, i) => {
        const angle = (i / FLOATING_DECORATIONS.length) * Math.PI * 2;
        const radius = 140 + Math.random() * 30;
        const cx = 50 + Math.cos(angle) * (radius / 3.2);
        const cy = 50 + Math.sin(angle) * (radius / 3.2);
        return (
          <motion.span
            key={i}
            className={`absolute ${dec.size} pointer-events-none z-10`}
            style={{ left: `${cx}%`, top: `${cy}%` }}
            animate={{
              y: [0, -8, 0],
              opacity: [0.4, 0.9, 0.4],
              scale: [0.8, 1.1, 0.8],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.6,
            }}
          >
            {dec.emoji}
          </motion.span>
        );
      })}

      {/* Outer glow ring */}
      <motion.div
        animate={{
          boxShadow: glowIntensity > 0
            ? '0 0 80px 20px rgba(168, 214, 114, 0.4), 0 0 160px 40px rgba(168, 214, 114, 0.15)'
            : '0 0 60px 10px rgba(168, 214, 114, 0.15), 0 0 120px 30px rgba(168, 214, 114, 0.05)',
        }}
        className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-full"
      >
        {/* Inner glow layer */}
        <div
          className="absolute inset-2 rounded-full"
          style={{
            background: 'radial-gradient(circle at 40% 35%, rgba(168, 214, 114, 0.12), transparent 70%)',
          }}
        />

        {/* Planet surface */}
        <div
          className="absolute inset-4 rounded-full overflow-hidden"
          style={{
            background: 'radial-gradient(ellipse at 40% 40%, hsl(var(--soft-lime) / 0.3), hsl(var(--forest-green) / 0.6) 50%, hsl(var(--forest-green) / 0.9) 100%)',
            border: '1px solid rgba(168, 214, 114, 0.2)',
          }}
        >
          {/* Surface texture - curved path */}
          <div
            className="absolute w-full h-full"
            style={{
              background: `
                radial-gradient(ellipse at 30% 60%, rgba(168, 214, 114, 0.2) 0%, transparent 50%),
                radial-gradient(ellipse at 70% 40%, rgba(45, 90, 39, 0.3) 0%, transparent 40%)
              `,
            }}
          />

          {/* Hill shapes */}
          <div
            className="absolute bottom-0 left-0 right-0 h-3/5 rounded-t-full"
            style={{
              background: 'radial-gradient(ellipse at 50% 100%, hsl(var(--forest-green) / 0.5), transparent 80%)',
            }}
          />

          {/* Plant emojis on planet */}
          {PLANET_PLANTS.slice(0, Math.max(3, plantCount + 3)).map((plant, i) => (
            <motion.span
              key={i}
              className={`absolute ${plant.size} select-none`}
              style={{
                left: plant.x,
                top: plant.y,
                transform: 'translate(-50%, -50%)',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
              }}
              animate={{ y: [0, -3, 0] }}
              transition={{
                duration: 4 + i * 0.3,
                repeat: Infinity,
                delay: i * 0.5,
              }}
            >
              {plant.emoji}
            </motion.span>
          ))}

          {/* Highlight shine */}
          <div
            className="absolute top-3 left-6 w-16 h-8 rounded-full"
            style={{
              background: 'radial-gradient(ellipse, rgba(255,255,255,0.12), transparent)',
            }}
          />
        </div>

        {/* AI character */}
        <motion.div
          className="absolute bottom-4 right-2 z-20 flex items-end gap-1"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <div className="w-8 h-8 rounded-full bg-foreground/10 border border-foreground/20 flex items-center justify-center text-base backdrop-blur-sm">
            🤖
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
