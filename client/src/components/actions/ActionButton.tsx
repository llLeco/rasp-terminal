import { useState } from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, Loader2 } from 'lucide-react';

interface ActionButtonProps {
  label: string;
  icon: LucideIcon;
  onClick: () => Promise<void>;
  variant?: 'default' | 'danger' | 'accent';
  confirmMessage?: string;
  delay?: number;
}

export const ActionButton = ({
  label,
  icon: Icon,
  onClick,
  variant = 'default',
  confirmMessage,
  delay = 0,
}: ActionButtonProps) => {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (confirmMessage && !window.confirm(confirmMessage)) {
      return;
    }

    setLoading(true);
    try {
      await onClick();
    } finally {
      setLoading(false);
    }
  };

  const variantClasses = {
    default: 'text-terminal-primary border-terminal-border hover:border-terminal-primary',
    danger: 'text-terminal-error border-red-900/50 hover:border-terminal-error',
    accent: 'text-terminal-accent border-amber-900/50 hover:border-terminal-accent',
  };

  return (
    <motion.button
      className={`action-btn ${variantClasses[variant]}`}
      onClick={handleClick}
      disabled={loading}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {loading ? (
        <Loader2 className="w-8 h-8 animate-spin" />
      ) : (
        <Icon className="w-8 h-8" />
      )}
      <span className="text-xs font-medium uppercase tracking-wider">
        {label}
      </span>
    </motion.button>
  );
};
