import { motion } from 'framer-motion';
import {
  Cpu,
  HardDrive,
  Wifi,
  Thermometer,
  Clock,
  Server,
} from 'lucide-react';
import { useStats } from '../hooks/useStats';
import { StatsCard } from '../components/dashboard/StatsCard';
import { HistoryGraph } from '../components/dashboard/HistoryGraph';
import { ProcessList } from '../components/dashboard/ProcessList';
import { ProgressBar } from '../components/ui/ProgressBar';

const formatBytes = (bytes: number): string => {
  const gb = bytes / (1024 * 1024 * 1024);
  if (gb >= 1) return `${gb.toFixed(2)} GB`;
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(0)} MB`;
};

const formatUptime = (seconds: number): string => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h ${mins}m`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
};

const formatSpeed = (bytesPerSec: number): string => {
  if (bytesPerSec >= 1024 * 1024) {
    return `${(bytesPerSec / (1024 * 1024)).toFixed(1)} MB/s`;
  }
  if (bytesPerSec >= 1024) {
    return `${(bytesPerSec / 1024).toFixed(1)} KB/s`;
  }
  return `${bytesPerSec.toFixed(0)} B/s`;
};

export const DashboardPage = () => {
  const { stats, loading } = useStats();

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="loading-spinner w-12 h-12 mx-auto mb-4" />
          <p className="text-terminal-secondary">Loading system stats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatsCard
          title="CPU Usage"
          value={`${stats.cpu.usage.toFixed(1)}%`}
          subValue={stats.cpu.model}
          percentage={stats.cpu.usage}
          icon={Cpu}
          delay={0}
        />
        <StatsCard
          title="Memory"
          value={formatBytes(stats.memory.used)}
          subValue={`/ ${formatBytes(stats.memory.total)}`}
          percentage={stats.memory.percentage}
          icon={HardDrive}
          delay={0.1}
        />
        <StatsCard
          title="Disk"
          value={formatBytes(stats.disk.used)}
          subValue={`/ ${formatBytes(stats.disk.total)}`}
          percentage={stats.disk.percentage}
          icon={Server}
          delay={0.2}
        />
        <StatsCard
          title="CPU Temp"
          value={`${stats.cpu.temperature.toFixed(0)}°C`}
          subValue={stats.gpu.temperature > 0 ? `GPU: ${stats.gpu.temperature.toFixed(0)}°C` : undefined}
          icon={Thermometer}
          delay={0.3}
        />
        <StatsCard
          title="Network"
          value={formatSpeed(stats.network.rxSec)}
          subValue={`↑ ${formatSpeed(stats.network.txSec)}`}
          icon={Wifi}
          delay={0.4}
        />
        <StatsCard
          title="Uptime"
          value={formatUptime(stats.system.uptime)}
          subValue={stats.system.platform}
          icon={Clock}
          delay={0.5}
        />
      </div>

      {/* CPU Cores */}
      <motion.div
        className="terminal-box p-4 rounded-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <h3 className="text-lg font-semibold text-terminal-primary mb-4">
          CPU CORES
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.cpu.cores.map((usage, index) => (
            <ProgressBar
              key={index}
              value={usage}
              label={`Core ${index}`}
              size="sm"
            />
          ))}
        </div>
      </motion.div>

      {/* History Graph and Process List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HistoryGraph />
        <ProcessList processes={stats.processes} />
      </div>

      {/* Disk Drives */}
      {stats.disk.drives.length > 1 && (
        <motion.div
          className="terminal-box p-4 rounded-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <h3 className="text-lg font-semibold text-terminal-primary mb-4">
            DISK DRIVES
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats.disk.drives.map((drive) => (
              <ProgressBar
                key={drive.mount}
                value={drive.percentage}
                label={drive.mount}
                size="md"
              />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};
