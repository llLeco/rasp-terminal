import { motion } from 'framer-motion';

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  color?: 'green' | 'amber' | 'red';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const colorClasses = {
  green: 'from-terminal-border to-terminal-primary',
  amber: 'from-amber-900 to-terminal-accent',
  red: 'from-red-900 to-terminal-error',
};

const sizeClasses = {
  sm: 'h-2',
  md: 'h-3',
  lg: 'h-4',
};

export const ProgressBar = ({
  value,
  max = 100,
  label,
  showValue = true,
  color = 'green',
  size = 'md',
  className = '',
}: ProgressBarProps) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  // Auto-color based on percentage
  const autoColor =
    percentage >= 90 ? 'red' : percentage >= 70 ? 'amber' : 'green';
  const finalColor = color === 'green' ? autoColor : color;

  return (
    <div className={`w-full ${className}`}>
      {(label || showValue) && (
        <div className="flex justify-between mb-1 text-sm">
          {label && <span className="text-terminal-primary">{label}</span>}
          {showValue && (
            <span className="text-terminal-secondary">{percentage.toFixed(1)}%</span>
          )}
        </div>
      )}
      <div className={`progress-bar ${sizeClasses[size]} rounded`}>
        <motion.div
          className={`h-full rounded bg-gradient-to-r ${colorClasses[finalColor]}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{
            boxShadow:
              finalColor === 'green'
                ? '0 0 10px rgba(0, 255, 0, 0.5)'
                : finalColor === 'amber'
                ? '0 0 10px rgba(255, 176, 0, 0.5)'
                : '0 0 10px rgba(255, 51, 51, 0.5)',
          }}
        />
      </div>
    </div>
  );
};
