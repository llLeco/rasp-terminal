import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { config } from '../config.js';

let db: Database.Database;

export const initDatabase = (): void => {
  const dbDir = path.dirname(config.dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  db = new Database(config.dbPath);

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS stats_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp INTEGER NOT NULL,
      cpu_usage REAL,
      cpu_temp REAL,
      memory_used INTEGER,
      memory_total INTEGER,
      disk_used INTEGER,
      disk_total INTEGER,
      network_rx INTEGER,
      network_tx INTEGER,
      gpu_temp REAL
    );

    CREATE INDEX IF NOT EXISTS idx_stats_timestamp ON stats_history(timestamp);

    CREATE TABLE IF NOT EXISTS custom_scripts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      command TEXT NOT NULL,
      icon TEXT DEFAULT 'terminal',
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now'))
    );
  `);

  // Cleanup old stats
  cleanupOldStats();

  console.log('[DB] Database initialized');
};

export const cleanupOldStats = (): void => {
  const cutoffTime = Date.now() - (config.statsRetentionDays * 24 * 60 * 60 * 1000);
  const stmt = db.prepare('DELETE FROM stats_history WHERE timestamp < ?');
  const result = stmt.run(cutoffTime);
  if (result.changes > 0) {
    console.log(`[DB] Cleaned up ${result.changes} old stats records`);
  }
};

export const saveStats = (stats: {
  cpuUsage: number;
  cpuTemp: number;
  memoryUsed: number;
  memoryTotal: number;
  diskUsed: number;
  diskTotal: number;
  networkRx: number;
  networkTx: number;
  gpuTemp: number;
}): void => {
  const stmt = db.prepare(`
    INSERT INTO stats_history
    (timestamp, cpu_usage, cpu_temp, memory_used, memory_total, disk_used, disk_total, network_rx, network_tx, gpu_temp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    Date.now(),
    stats.cpuUsage,
    stats.cpuTemp,
    stats.memoryUsed,
    stats.memoryTotal,
    stats.diskUsed,
    stats.diskTotal,
    stats.networkRx,
    stats.networkTx,
    stats.gpuTemp
  );
};

export const getStatsHistory = (hours: number = 24): Array<{
  timestamp: number;
  cpu_usage: number;
  cpu_temp: number;
  memory_used: number;
  memory_total: number;
  network_rx: number;
  network_tx: number;
}> => {
  const cutoffTime = Date.now() - (hours * 60 * 60 * 1000);
  const stmt = db.prepare(`
    SELECT timestamp, cpu_usage, cpu_temp, memory_used, memory_total, network_rx, network_tx
    FROM stats_history
    WHERE timestamp > ?
    ORDER BY timestamp ASC
  `);

  return stmt.all(cutoffTime) as Array<{
    timestamp: number;
    cpu_usage: number;
    cpu_temp: number;
    memory_used: number;
    memory_total: number;
    network_rx: number;
    network_tx: number;
  }>;
};

// Custom scripts CRUD
export const getCustomScripts = (): Array<{
  id: number;
  name: string;
  description: string;
  command: string;
  icon: string;
}> => {
  const stmt = db.prepare('SELECT * FROM custom_scripts ORDER BY name');
  return stmt.all() as Array<{
    id: number;
    name: string;
    description: string;
    command: string;
    icon: string;
  }>;
};

export const addCustomScript = (script: {
  name: string;
  description: string;
  command: string;
  icon?: string;
}): number => {
  const stmt = db.prepare(`
    INSERT INTO custom_scripts (name, description, command, icon)
    VALUES (?, ?, ?, ?)
  `);
  const result = stmt.run(script.name, script.description, script.command, script.icon || 'terminal');
  return result.lastInsertRowid as number;
};

export const updateCustomScript = (id: number, script: {
  name: string;
  description: string;
  command: string;
  icon?: string;
}): void => {
  const stmt = db.prepare(`
    UPDATE custom_scripts
    SET name = ?, description = ?, command = ?, icon = ?, updated_at = strftime('%s', 'now')
    WHERE id = ?
  `);
  stmt.run(script.name, script.description, script.command, script.icon || 'terminal', id);
};

export const deleteCustomScript = (id: number): void => {
  const stmt = db.prepare('DELETE FROM custom_scripts WHERE id = ?');
  stmt.run(id);
};

export { db };
