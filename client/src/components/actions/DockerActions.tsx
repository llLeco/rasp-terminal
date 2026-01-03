import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Box,
  Play,
  Square,
  RefreshCw,
  FileText,
  Trash2,
  Loader2,
} from 'lucide-react';
import { actions } from '../../services/api';
import type { Container, DockerInfo } from '../../types';
import { Modal } from '../ui/Modal';

interface DockerActionsProps {
  onResult: (message: string, isError?: boolean) => void;
}

export const DockerActions = ({ onResult }: DockerActionsProps) => {
  const [containers, setContainers] = useState<Container[]>([]);
  const [dockerInfo, setDockerInfo] = useState<DockerInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [logsModal, setLogsModal] = useState<{ id: string; name: string; logs: string } | null>(null);

  const fetchData = async () => {
    try {
      const [containersData, infoData] = await Promise.all([
        actions.getContainers(),
        actions.getDockerInfo(),
      ]);
      setContainers(containersData);
      setDockerInfo(infoData);
    } catch (err) {
      onResult(err instanceof Error ? err.message : 'Failed to fetch Docker data', true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleContainerAction = async (id: string, action: 'start' | 'stop' | 'restart') => {
    setActionLoading(`${id}-${action}`);
    try {
      const actionFn = action === 'start' ? actions.startContainer :
                       action === 'stop' ? actions.stopContainer :
                       actions.restartContainer;
      await actionFn(id);
      onResult(`Container ${action} successful`);
      await fetchData();
    } catch (err) {
      onResult(err instanceof Error ? err.message : `${action} failed`, true);
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewLogs = async (id: string, name: string) => {
    setActionLoading(`${id}-logs`);
    try {
      const result = await actions.getContainerLogs(id, 200);
      setLogsModal({ id, name, logs: result.logs });
    } catch (err) {
      onResult(err instanceof Error ? err.message : 'Failed to fetch logs', true);
    } finally {
      setActionLoading(null);
    }
  };

  const handlePrune = async () => {
    if (!window.confirm('This will remove stopped containers, unused images, and volumes. Continue?')) {
      return;
    }
    setActionLoading('prune');
    try {
      const result = await actions.pruneDocker();
      onResult(`Pruned: ${result.containers} containers, ${result.images} images, ${result.volumes} volumes`);
      await fetchData();
    } catch (err) {
      onResult(err instanceof Error ? err.message : 'Prune failed', true);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <motion.div
      className="terminal-box p-4 rounded-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-terminal-primary">
          DOCKER CONTAINERS
        </h3>
        <div className="flex items-center gap-4">
          {dockerInfo && (
            <span className="text-xs text-terminal-muted">
              v{dockerInfo.version} | {dockerInfo.running}/{dockerInfo.containers} running
            </span>
          )}
          <button
            onClick={handlePrune}
            disabled={actionLoading === 'prune'}
            className="terminal-btn-danger px-3 py-1 text-xs flex items-center gap-1"
          >
            {actionLoading === 'prune' ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Trash2 size={14} />
            )}
            Prune
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="loading-spinner w-8 h-8" />
        </div>
      ) : containers.length === 0 ? (
        <p className="text-terminal-muted text-center py-8">No containers found</p>
      ) : (
        <div className="space-y-2">
          {containers.map((container) => (
            <motion.div
              key={container.id}
              className="flex items-center justify-between p-3 border border-terminal-border rounded hover:border-terminal-primary-dim transition-colors"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="flex items-center gap-3">
                <Box
                  size={20}
                  className={container.state === 'running' ? 'text-terminal-primary' : 'text-terminal-muted'}
                />
                <div>
                  <p className="text-terminal-secondary font-medium">{container.name}</p>
                  <p className="text-xs text-terminal-muted">{container.image}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    container.state === 'running'
                      ? 'bg-terminal-primary/10 text-terminal-primary'
                      : 'bg-terminal-muted/10 text-terminal-muted'
                  }`}
                >
                  {container.state}
                </span>

                <div className="flex items-center gap-1">
                  {container.state !== 'running' && (
                    <button
                      onClick={() => handleContainerAction(container.id, 'start')}
                      disabled={actionLoading === `${container.id}-start`}
                      className="p-1 text-terminal-primary hover:bg-terminal-primary/10 rounded"
                      title="Start"
                    >
                      {actionLoading === `${container.id}-start` ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Play size={16} />
                      )}
                    </button>
                  )}
                  {container.state === 'running' && (
                    <button
                      onClick={() => handleContainerAction(container.id, 'stop')}
                      disabled={actionLoading === `${container.id}-stop`}
                      className="p-1 text-terminal-error hover:bg-terminal-error/10 rounded"
                      title="Stop"
                    >
                      {actionLoading === `${container.id}-stop` ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Square size={16} />
                      )}
                    </button>
                  )}
                  <button
                    onClick={() => handleContainerAction(container.id, 'restart')}
                    disabled={actionLoading === `${container.id}-restart`}
                    className="p-1 text-terminal-accent hover:bg-terminal-accent/10 rounded"
                    title="Restart"
                  >
                    {actionLoading === `${container.id}-restart` ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <RefreshCw size={16} />
                    )}
                  </button>
                  <button
                    onClick={() => handleViewLogs(container.id, container.name)}
                    disabled={actionLoading === `${container.id}-logs`}
                    className="p-1 text-terminal-secondary hover:bg-terminal-secondary/10 rounded"
                    title="View Logs"
                  >
                    {actionLoading === `${container.id}-logs` ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <FileText size={16} />
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Modal
        isOpen={!!logsModal}
        onClose={() => setLogsModal(null)}
        title={`Logs: ${logsModal?.name || ''}`}
        size="xl"
      >
        <pre className="text-xs text-terminal-secondary bg-terminal-bg p-4 rounded overflow-auto max-h-96 whitespace-pre-wrap">
          {logsModal?.logs || 'No logs available'}
        </pre>
      </Modal>
    </motion.div>
  );
};
