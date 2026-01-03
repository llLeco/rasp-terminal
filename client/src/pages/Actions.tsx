import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, X } from 'lucide-react';
import { SystemActions } from '../components/actions/SystemActions';
import { DockerActions } from '../components/actions/DockerActions';
import { CustomScripts } from '../components/actions/CustomScripts';

interface Notification {
  id: number;
  message: string;
  isError: boolean;
}

export const ActionsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (message: string, isError = false) => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message, isError }]);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
  };

  const removeNotification = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="space-y-6">
      <SystemActions onResult={addNotification} />
      <DockerActions onResult={addNotification} />
      <CustomScripts onResult={addNotification} />

      {/* Notifications */}
      <div className="fixed bottom-20 right-6 space-y-2 z-50">
        <AnimatePresence>
          {notifications.map((notification) => (
            <motion.div
              key={notification.id}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${
                notification.isError
                  ? 'bg-terminal-error/10 border-terminal-error/30'
                  : 'bg-terminal-primary/10 border-terminal-primary/30'
              }`}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
            >
              {notification.isError ? (
                <XCircle className="w-5 h-5 text-terminal-error" />
              ) : (
                <CheckCircle className="w-5 h-5 text-terminal-primary" />
              )}
              <span
                className={`text-sm ${
                  notification.isError ? 'text-terminal-error' : 'text-terminal-primary'
                }`}
              >
                {notification.message}
              </span>
              <button
                onClick={() => removeNotification(notification.id)}
                className="p-1 hover:bg-white/10 rounded"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
