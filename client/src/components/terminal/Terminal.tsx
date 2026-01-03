import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTerminal } from '../../hooks/useTerminal';

export const TerminalComponent = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isReady, fit } = useTerminal(containerRef);

  useEffect(() => {
    // Fit terminal when component mounts
    const timeout = setTimeout(() => {
      fit();
    }, 100);

    return () => clearTimeout(timeout);
  }, [fit]);

  return (
    <motion.div
      className="h-full flex flex-col terminal-box rounded-lg overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between px-4 py-2 border-b border-terminal-border bg-terminal-bg-light">
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${
              isReady ? 'bg-terminal-primary' : 'bg-terminal-accent'
            }`}
            style={{
              boxShadow: isReady
                ? '0 0 8px rgba(0, 255, 0, 0.8)'
                : '0 0 8px rgba(255, 176, 0, 0.8)',
            }}
          />
          <span className="text-sm text-terminal-secondary">
            {isReady ? 'bash' : 'connecting...'}
          </span>
        </div>
        <span className="text-xs text-terminal-muted">PTY Session</span>
      </div>

      <div
        ref={containerRef}
        className="flex-1 bg-terminal-bg"
        style={{ minHeight: 0 }}
      />
    </motion.div>
  );
};
