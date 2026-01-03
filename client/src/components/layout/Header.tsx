import { motion } from 'framer-motion';
import { LogOut, Terminal } from 'lucide-react';
import { GlitchText } from '../ui/GlitchText';

interface HeaderProps {
  hostname?: string;
  onLogout: () => void;
}

export const Header = ({ hostname = 'raspberrypi', onLogout }: HeaderProps) => {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-terminal-border bg-terminal-bg-light">
      <motion.div
        className="flex items-center gap-3"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Terminal className="w-8 h-8 text-terminal-primary" />
        <div>
          <GlitchText
            text="RASPTERMINAL"
            className="text-xl font-bold tracking-wider"
          />
          <p className="text-xs text-terminal-muted">v1.0.0</p>
        </div>
      </motion.div>

      <motion.div
        className="flex items-center gap-6"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="text-right">
          <p className="text-sm text-terminal-secondary">
            user@<span className="text-terminal-primary">{hostname}</span>
          </p>
        </div>

        <button
          onClick={onLogout}
          className="terminal-btn px-4 py-2 flex items-center gap-2 text-sm"
        >
          <LogOut size={16} />
          <span>LOGOUT</span>
        </button>
      </motion.div>
    </header>
  );
};
