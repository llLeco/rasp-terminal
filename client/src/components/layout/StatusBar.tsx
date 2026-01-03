import { motion } from 'framer-motion';
import { Wifi, WifiOff, Cpu, HardDrive, Thermometer } from 'lucide-react';
import type { SystemStats } from '../../types';

interface StatusBarProps {
  stats: SystemStats | null;
  isConnected: boolean;
}

const formatBytes = (bytes: number): string => {
  const gb = bytes / (1024 * 1024 * 1024);
  if (gb >= 1) return `${gb.toFixed(1)}GB`;
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(0)}MB`;
};

export const StatusBar = ({ stats, isConnected }: StatusBarProps) => {
  return (
    <motion.footer
      className="flex items-center justify-between px-6 py-2 border-t border-terminal-border bg-terminal-bg-light text-xs"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
    >
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          {isConnected ? (
            <>
              <Wifi className="w-4 h-4 text-terminal-primary" />
              <span className="text-terminal-primary">ONLINE</span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4 text-terminal-error" />
              <span className="text-terminal-error">OFFLINE</span>
            </>
          )}
        </div>

        {stats && (
          <>
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-terminal-secondary" />
              <span className="text-terminal-secondary">
                CPU: {stats.cpu.usage.toFixed(1)}%
              </span>
            </div>

            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-terminal-secondary" />
              <span className="text-terminal-secondary">
                RAM: {formatBytes(stats.memory.used)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Thermometer
                className={`w-4 h-4 ${
                  stats.cpu.temperature >= 70
                    ? 'text-terminal-error'
                    : stats.cpu.temperature >= 50
                    ? 'text-terminal-accent'
                    : 'text-terminal-secondary'
                }`}
              />
              <span
                className={
                  stats.cpu.temperature >= 70
                    ? 'text-terminal-error'
                    : stats.cpu.temperature >= 50
                    ? 'text-terminal-accent'
                    : 'text-terminal-secondary'
                }
              >
                TEMP: {stats.cpu.temperature.toFixed(0)}°C
              </span>
            </div>
          </>
        )}
      </div>

      <div className="text-terminal-muted">
        {new Date().toLocaleTimeString('en-US', { hour12: false })}
      </div>
    </motion.footer>
  );
};
