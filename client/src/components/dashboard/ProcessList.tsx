import { motion } from 'framer-motion';
import type { SystemStats } from '../../types';

interface ProcessListProps {
  processes: SystemStats['processes'];
}

export const ProcessList = ({ processes }: ProcessListProps) => {
  return (
    <motion.div
      className="terminal-box p-4 rounded-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
    >
      <h3 className="text-lg font-semibold text-terminal-primary mb-4">
        TOP PROCESSES
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-terminal-muted text-xs uppercase border-b border-terminal-border">
              <th className="text-left py-2 px-2">PID</th>
              <th className="text-left py-2 px-2">Name</th>
              <th className="text-right py-2 px-2">CPU</th>
              <th className="text-right py-2 px-2">MEM</th>
            </tr>
          </thead>
          <tbody>
            {processes.map((process, index) => (
              <motion.tr
                key={process.pid}
                className="border-b border-terminal-border/30 hover:bg-terminal-primary/5"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.05 }}
              >
                <td className="py-2 px-2 text-terminal-muted">{process.pid}</td>
                <td className="py-2 px-2 text-terminal-secondary truncate max-w-[150px]">
                  {process.name}
                </td>
                <td
                  className={`py-2 px-2 text-right ${
                    process.cpu > 50
                      ? 'text-terminal-error'
                      : process.cpu > 20
                      ? 'text-terminal-accent'
                      : 'text-terminal-primary'
                  }`}
                >
                  {process.cpu.toFixed(1)}%
                </td>
                <td
                  className={`py-2 px-2 text-right ${
                    process.memory > 50
                      ? 'text-terminal-error'
                      : process.memory > 20
                      ? 'text-terminal-accent'
                      : 'text-terminal-primary'
                  }`}
                >
                  {process.memory.toFixed(1)}%
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};
