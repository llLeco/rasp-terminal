import si from 'systeminformation';
import { Server } from 'socket.io';
import { config } from '../config.js';
import { saveStats } from './database.js';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface SystemStats {
  cpu: {
    usage: number;
    cores: number[];
    temperature: number;
    model: string;
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
    cached: number;
  };
  disk: {
    used: number;
    total: number;
    percentage: number;
    drives: Array<{ mount: string; used: number; total: number; percentage: number }>;
  };
  network: {
    rx: number;
    tx: number;
    rxSec: number;
    txSec: number;
  };
  gpu: {
    temperature: number;
  };
  system: {
    uptime: number;
    hostname: string;
    platform: string;
    kernel: string;
  };
  processes: Array<{
    pid: number;
    name: string;
    cpu: number;
    memory: number;
  }>;
  timestamp: number;
}

let lastNetworkStats = { rx: 0, tx: 0, timestamp: Date.now() };

const getGpuTemperature = async (): Promise<number> => {
  try {
    // Raspberry Pi specific: read GPU temperature via vcgencmd
    const { stdout } = await execAsync('vcgencmd measure_temp 2>/dev/null || echo "temp=0"');
    const match = stdout.match(/temp=([\d.]+)/);
    return match ? parseFloat(match[1]) : 0;
  } catch {
    return 0;
  }
};

export const getSystemStats = async (): Promise<SystemStats> => {
  const [cpu, cpuTemp, mem, disk, network, osInfo, processes, time] = await Promise.all([
    si.currentLoad(),
    si.cpuTemperature(),
    si.mem(),
    si.fsSize(),
    si.networkStats(),
    si.osInfo(),
    si.processes(),
    si.time(),
  ]);

  const gpuTemp = await getGpuTemperature();

  // Calculate network speed
  const currentRx = network.reduce((acc, n) => acc + n.rx_bytes, 0);
  const currentTx = network.reduce((acc, n) => acc + n.tx_bytes, 0);
  const timeDiff = (Date.now() - lastNetworkStats.timestamp) / 1000;

  const rxSec = timeDiff > 0 ? (currentRx - lastNetworkStats.rx) / timeDiff : 0;
  const txSec = timeDiff > 0 ? (currentTx - lastNetworkStats.tx) / timeDiff : 0;

  lastNetworkStats = { rx: currentRx, tx: currentTx, timestamp: Date.now() };

  // Get top processes
  const topProcesses = processes.list
    .sort((a, b) => b.cpu - a.cpu)
    .slice(0, 10)
    .map((p) => ({
      pid: p.pid,
      name: p.name,
      cpu: Math.round(p.cpu * 100) / 100,
      memory: Math.round(p.mem * 100) / 100,
    }));

  // Calculate disk usage
  const mainDisk = disk.find((d) => d.mount === '/') || disk[0];
  const drives = disk
    .filter((d) => d.size > 0)
    .map((d) => ({
      mount: d.mount,
      used: d.used,
      total: d.size,
      percentage: Math.round((d.used / d.size) * 100),
    }));

  return {
    cpu: {
      usage: Math.round(cpu.currentLoad * 100) / 100,
      cores: cpu.cpus.map((c) => Math.round(c.load * 100) / 100),
      temperature: cpuTemp.main || 0,
      model: (await si.cpu()).brand,
    },
    memory: {
      used: mem.used,
      total: mem.total,
      percentage: Math.round((mem.used / mem.total) * 100),
      cached: mem.cached,
    },
    disk: {
      used: mainDisk?.used || 0,
      total: mainDisk?.size || 0,
      percentage: mainDisk ? Math.round((mainDisk.used / mainDisk.size) * 100) : 0,
      drives,
    },
    network: {
      rx: currentRx,
      tx: currentTx,
      rxSec: Math.max(0, rxSec),
      txSec: Math.max(0, txSec),
    },
    gpu: {
      temperature: gpuTemp,
    },
    system: {
      uptime: time.uptime,
      hostname: osInfo.hostname,
      platform: `${osInfo.distro} ${osInfo.release}`,
      kernel: osInfo.kernel,
    },
    processes: topProcesses,
    timestamp: Date.now(),
  };
};

let statsInterval: NodeJS.Timeout | null = null;
let saveInterval: NodeJS.Timeout | null = null;

export const startStatsCollection = (io: Server): void => {
  // Broadcast stats to connected clients every interval
  statsInterval = setInterval(async () => {
    try {
      const stats = await getSystemStats();
      io.emit('stats:update', stats);
    } catch (error) {
      console.error('[Stats] Error collecting stats:', error);
    }
  }, config.statsInterval);

  // Save stats to database every minute for historical data
  saveInterval = setInterval(async () => {
    try {
      const stats = await getSystemStats();
      saveStats({
        cpuUsage: stats.cpu.usage,
        cpuTemp: stats.cpu.temperature,
        memoryUsed: stats.memory.used,
        memoryTotal: stats.memory.total,
        diskUsed: stats.disk.used,
        diskTotal: stats.disk.total,
        networkRx: stats.network.rx,
        networkTx: stats.network.tx,
        gpuTemp: stats.gpu.temperature,
      });
    } catch (error) {
      console.error('[Stats] Error saving stats:', error);
    }
  }, 60000); // Save every minute

  console.log(`[Stats] Collection started (interval: ${config.statsInterval}ms)`);
};

export const stopStatsCollection = (): void => {
  if (statsInterval) {
    clearInterval(statsInterval);
    statsInterval = null;
  }
  if (saveInterval) {
    clearInterval(saveInterval);
    saveInterval = null;
  }
  console.log('[Stats] Collection stopped');
};
