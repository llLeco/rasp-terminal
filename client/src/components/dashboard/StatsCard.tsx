import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { ProgressBar } from '../ui/ProgressBar';

interface StatsCardProps {
  title: string;
  value: string;
  subValue?: string;
  percentage?: number;
  icon: LucideIcon;
  delay?: number;
}

export const StatsCard = ({
  title,
  value,
  subValue,
  percentage,
  icon: Icon,
  delay = 0,
}: StatsCardProps) => {
  return (
    <motion.div
      className="stats-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs text-terminal-muted uppercase tracking-wider mb-1">
            {title}
          </p>
          <p className="text-2xl font-bold text-terminal-primary text-glow">
            {value}
          </p>
          {subValue && (
            <p className="text-xs text-terminal-secondary mt-1">{subValue}</p>
          )}
        </div>
        <Icon className="w-8 h-8 text-terminal-border" />
      </div>

      {percentage !== undefined && (
        <ProgressBar value={percentage} showValue={false} size="sm" />
      )}
    </motion.div>
  );
};
