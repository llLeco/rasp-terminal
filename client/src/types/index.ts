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

export interface StatsHistory {
  timestamp: number;
  cpu_usage: number;
  cpu_temp: number;
  memory_used: number;
  memory_total: number;
  network_rx: number;
  network_tx: number;
}

export interface Container {
  id: string;
  name: string;
  image: string;
  status: string;
  state: string;
  created: number;
  ports: string[];
}

export interface DockerInfo {
  version: string;
  containers: number;
  images: number;
  running: number;
}

export interface CustomScript {
  id: number;
  name: string;
  description: string;
  command: string;
  icon: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export interface ApiResponse<T = unknown> {
  success?: boolean;
  error?: string;
  data?: T;
}
