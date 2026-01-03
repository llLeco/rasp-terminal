import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, AlertCircle, Loader2 } from 'lucide-react';
import { GlitchText } from '../ui/GlitchText';
import { TypeWriter } from '../ui/TypeWriter';

interface LoginFormProps {
  onLogin: (password: string) => Promise<boolean>;
  error: string | null;
  loading: boolean;
}

export const LoginForm = ({ onLogin, error, loading }: LoginFormProps) => {
  const [password, setPassword] = useState('');
  const [showInput, setShowInput] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim()) {
      await onLogin(password);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-terminal-bg p-4">
      <div className="scanline-overlay pointer-events-none" />

      <motion.div
        className="w-full max-w-md terminal-box p-8 rounded-lg"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <GlitchText
              text="RASPTERMINAL"
              className="text-3xl font-bold tracking-widest"
            />
          </motion.div>

          <motion.div
            className="mt-4 text-terminal-secondary text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <TypeWriter
              text="// Raspberry Pi Control Panel"
              speed={40}
              onComplete={() => setShowInput(true)}
            />
          </motion.div>
        </div>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0 }}
          animate={{ opacity: showInput ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mb-6">
            <label className="block text-terminal-secondary text-sm mb-2">
              {'>'} ENTER ACCESS PASSWORD:
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-terminal-border" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full terminal-input pl-12 pr-4 py-3 rounded"
                placeholder="******************"
                disabled={loading}
                autoFocus
              />
            </div>
          </div>

          {error && (
            <motion.div
              className="mb-4 p-3 rounded bg-terminal-error/10 border border-terminal-error/30 flex items-center gap-2"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <AlertCircle className="w-5 h-5 text-terminal-error" />
              <span className="text-terminal-error text-sm">{error}</span>
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading || !password.trim()}
            className="w-full terminal-btn py-3 rounded flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>AUTHENTICATING...</span>
              </>
            ) : (
              <>
                <Lock className="w-5 h-5" />
                <span>AUTHENTICATE</span>
              </>
            )}
          </button>
        </motion.form>

        <motion.div
          className="mt-8 text-center text-xs text-terminal-muted"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <p>Secure connection established</p>
          <p className="mt-1 text-terminal-border">
            terminal.devbyle.co
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};
