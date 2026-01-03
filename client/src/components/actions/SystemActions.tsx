import { motion } from 'framer-motion';
import {
  Power,
  PowerOff,
  RefreshCw,
  Trash2,
  Download,
} from 'lucide-react';
import { ActionButton } from './ActionButton';
import { actions } from '../../services/api';

interface SystemActionsProps {
  onResult: (message: string, isError?: boolean) => void;
}

export const SystemActions = ({ onResult }: SystemActionsProps) => {
  const handleReboot = async () => {
    try {
      const result = await actions.reboot();
      onResult(result.message);
    } catch (err) {
      onResult(err instanceof Error ? err.message : 'Reboot failed', true);
    }
  };

  const handleShutdown = async () => {
    try {
      const result = await actions.shutdown();
      onResult(result.message);
    } catch (err) {
      onResult(err instanceof Error ? err.message : 'Shutdown failed', true);
    }
  };

  const handleClearCache = async () => {
    try {
      const result = await actions.clearCache();
      onResult(result.message);
    } catch (err) {
      onResult(err instanceof Error ? err.message : 'Clear cache failed', true);
    }
  };

  const handleUpdate = async () => {
    try {
      onResult('Updating system... This may take a while.');
      const result = await actions.updateSystem();
      onResult('System updated successfully!');
      console.log('Update output:', result.output);
    } catch (err) {
      onResult(err instanceof Error ? err.message : 'Update failed', true);
    }
  };

  const handleServiceRestart = async () => {
    try {
      const result = await actions.serviceAction('restart', 'docker');
      onResult(result.output || 'Docker service restarted');
    } catch (err) {
      onResult(err instanceof Error ? err.message : 'Service restart failed', true);
    }
  };

  return (
    <motion.div
      className="terminal-box p-4 rounded-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h3 className="text-lg font-semibold text-terminal-primary mb-4">
        SYSTEM CONTROLS
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        <ActionButton
          label="Reboot"
          icon={RefreshCw}
          onClick={handleReboot}
          variant="accent"
          confirmMessage="Are you sure you want to reboot the system?"
          delay={0}
        />
        <ActionButton
          label="Shutdown"
          icon={PowerOff}
          onClick={handleShutdown}
          variant="danger"
          confirmMessage="Are you sure you want to shutdown the system?"
          delay={0.05}
        />
        <ActionButton
          label="Clear Cache"
          icon={Trash2}
          onClick={handleClearCache}
          delay={0.1}
        />
        <ActionButton
          label="Update"
          icon={Download}
          onClick={handleUpdate}
          variant="accent"
          confirmMessage="This will run apt update && upgrade. Continue?"
          delay={0.15}
        />
        <ActionButton
          label="Restart Docker"
          icon={Power}
          onClick={handleServiceRestart}
          delay={0.2}
        />
      </div>
    </motion.div>
  );
};
