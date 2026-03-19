import { motion } from 'framer-motion';

interface VitalGaugeProps {
  icon: string;
  label: string;
  value: number;
  score: string;
}

export default function VitalGauge({ icon, label, value, score }: VitalGaugeProps) {
  // Map value (0-100) to gauge angle (-90 to 90 degrees)
  const angle = -90 + (value / 100) * 180;

  const getGaugeColor = (val: number) => {
    if (val >= 70) return 'hsl(var(--soft-lime))';
    if (val >= 40) return 'hsl(var(--sunlight-yellow))';
    return 'hsl(var(--destructive))';
  };

  const gaugeColor = getGaugeColor(value);

  return (
    <div className="glass-light rounded-xl p-3 flex flex-col items-center gap-1">
      <span className="text-xs font-medium text-foreground">{label}</span>

      {/* Gauge */}
      <div className="relative w-16 h-9 overflow-hidden">
        {/* Gauge background arc */}
        <svg viewBox="0 0 64 36" className="w-full h-full">
          {/* Background arc */}
          <path
            d="M 6 32 A 26 26 0 0 1 58 32"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="5"
            strokeLinecap="round"
          />
          {/* Colored arc */}
          <motion.path
            d="M 6 32 A 26 26 0 0 1 58 32"
            fill="none"
            stroke={gaugeColor}
            strokeWidth="5"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: value / 100 }}
            transition={{ duration: 1, delay: 0.3 }}
          />
        </svg>
        {/* Needle */}
        <motion.div
          className="absolute bottom-0 left-1/2 origin-bottom"
          style={{ width: '2px', height: '20px', marginLeft: '-1px' }}
          initial={{ rotate: -90 }}
          animate={{ rotate: angle }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          <div
            className="w-1.5 h-1.5 rounded-full -ml-[1px]"
            style={{ background: gaugeColor }}
          />
        </motion.div>
        {/* Center dot */}
        <div className="absolute bottom-0 left-1/2 w-2 h-2 -ml-1 rounded-full bg-foreground/40" />
      </div>

      {/* Score labels */}
      <div className="flex items-center justify-between w-full px-1 -mt-0.5">
        <span className="text-[8px] text-muted-foreground">0</span>
        <span className="text-[8px] text-muted-foreground">{icon}</span>
        <span className="text-[8px] text-muted-foreground">5</span>
      </div>

      <span className="text-sm font-semibold text-foreground">{score}</span>
    </div>
  );
}
