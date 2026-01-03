import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Save, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { auth } from '../services/api';

export const SettingsPage = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage({ text: 'Passwords do not match', isError: true });
      return;
    }

    if (newPassword.length < 8) {
      setMessage({ text: 'Password must be at least 8 characters', isError: true });
      return;
    }

    setLoading(true);
    try {
      await auth.changePassword(currentPassword, newPassword);
      setMessage({ text: 'Password changed successfully', isError: false });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setMessage({
        text: err instanceof Error ? err.message : 'Failed to change password',
        isError: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Change Password */}
      <motion.div
        className="terminal-box p-6 rounded-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h3 className="text-lg font-semibold text-terminal-primary mb-6 flex items-center gap-2">
          <Lock className="w-5 h-5" />
          CHANGE PASSWORD
        </h3>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm text-terminal-secondary mb-2">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full terminal-input px-4 py-2 rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-terminal-secondary mb-2">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full terminal-input px-4 py-2 rounded"
              minLength={8}
              required
            />
          </div>

          <div>
            <label className="block text-sm text-terminal-secondary mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full terminal-input px-4 py-2 rounded"
              minLength={8}
              required
            />
          </div>

          {message && (
            <motion.div
              className={`flex items-center gap-2 p-3 rounded ${
                message.isError
                  ? 'bg-terminal-error/10 border border-terminal-error/30'
                  : 'bg-terminal-primary/10 border border-terminal-primary/30'
              }`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {message.isError ? (
                <AlertCircle className="w-5 h-5 text-terminal-error" />
              ) : (
                <CheckCircle className="w-5 h-5 text-terminal-primary" />
              )}
              <span
                className={
                  message.isError ? 'text-terminal-error' : 'text-terminal-primary'
                }
              >
                {message.text}
              </span>
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="terminal-btn px-6 py-2 flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            <span>UPDATE PASSWORD</span>
          </button>
        </form>
      </motion.div>

      {/* System Info */}
      <motion.div
        className="terminal-box p-6 rounded-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <h3 className="text-lg font-semibold text-terminal-primary mb-6">
          ABOUT
        </h3>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-terminal-muted">Version</span>
            <span className="text-terminal-secondary">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-terminal-muted">Domain</span>
            <span className="text-terminal-secondary">terminal.devbyle.co</span>
          </div>
          <div className="flex justify-between">
            <span className="text-terminal-muted">Stack</span>
            <span className="text-terminal-secondary">React + Node.js + Socket.io</span>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-terminal-border">
          <p className="text-xs text-terminal-muted text-center">
            RaspTerminal - Raspberry Pi Control Panel
          </p>
        </div>
      </motion.div>
    </div>
  );
};
