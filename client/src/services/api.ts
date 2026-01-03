const API_BASE = '/api';

interface RequestOptions extends RequestInit {
  body?: string;
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const token = localStorage.getItem('token');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// Auth
export const auth = {
  login: (password: string) =>
    request<{ success: boolean; token: string; expiresIn: number }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ password }),
    }),

  logout: () => request<{ success: boolean }>('/auth/logout', { method: 'POST' }),

  verify: () => request<{ valid: boolean; userId: string }>('/auth/verify'),

  changePassword: (currentPassword: string, newPassword: string) =>
    request<{ success: boolean; message: string }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
};

// Stats
export const stats = {
  getCurrent: () => request<import('../types').SystemStats>('/stats/current'),

  getHistory: (hours: number) =>
    request<import('../types').StatsHistory[]>(`/stats/history/${hours}`),
};

// Actions
export const actions = {
  // System
  reboot: () =>
    request<{ success: boolean; message: string }>('/actions/system/reboot', {
      method: 'POST',
    }),

  shutdown: () =>
    request<{ success: boolean; message: string }>('/actions/system/shutdown', {
      method: 'POST',
    }),

  serviceAction: (action: string, service: string) =>
    request<{ success: boolean; output: string }>(
      `/actions/system/service/${action}/${service}`,
      { method: 'POST' }
    ),

  clearCache: () =>
    request<{ success: boolean; message: string }>('/actions/system/clear-cache', {
      method: 'POST',
    }),

  updateSystem: () =>
    request<{ success: boolean; output: string }>('/actions/system/update', {
      method: 'POST',
    }),

  // Docker
  getDockerInfo: () => request<import('../types').DockerInfo>('/actions/docker/info'),

  getContainers: () => request<import('../types').Container[]>('/actions/docker/containers'),

  startContainer: (id: string) =>
    request<{ success: boolean; message: string }>(`/actions/docker/containers/${id}/start`, {
      method: 'POST',
    }),

  stopContainer: (id: string) =>
    request<{ success: boolean; message: string }>(`/actions/docker/containers/${id}/stop`, {
      method: 'POST',
    }),

  restartContainer: (id: string) =>
    request<{ success: boolean; message: string }>(`/actions/docker/containers/${id}/restart`, {
      method: 'POST',
    }),

  getContainerLogs: (id: string, tail = 100) =>
    request<{ logs: string }>(`/actions/docker/containers/${id}/logs?tail=${tail}`),

  pruneDocker: () =>
    request<{
      success: boolean;
      message: string;
      containers: number;
      images: number;
      volumes: number;
      spaceReclaimed: number;
    }>('/actions/docker/prune', { method: 'POST' }),
};

// Scripts
export const scripts = {
  getAll: () => request<import('../types').CustomScript[]>('/scripts'),

  create: (script: Omit<import('../types').CustomScript, 'id'>) =>
    request<{ success: boolean; id: number }>('/scripts', {
      method: 'POST',
      body: JSON.stringify(script),
    }),

  update: (id: number, script: Omit<import('../types').CustomScript, 'id'>) =>
    request<{ success: boolean }>(`/scripts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(script),
    }),

  delete: (id: number) =>
    request<{ success: boolean }>(`/scripts/${id}`, { method: 'DELETE' }),

  execute: (id: number) =>
    request<{ success: boolean; output: string; error?: string }>(
      `/scripts/${id}/execute`,
      { method: 'POST' }
    ),
};
