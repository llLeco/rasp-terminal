import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Terminal,
  Plus,
  Play,
  Edit2,
  Trash2,
  Loader2,
  Save,
  X,
} from 'lucide-react';
import { scripts as scriptsApi } from '../../services/api';
import type { CustomScript } from '../../types';
import { Modal } from '../ui/Modal';

interface CustomScriptsProps {
  onResult: (message: string, isError?: boolean) => void;
}

export const CustomScripts = ({ onResult }: CustomScriptsProps) => {
  const [scripts, setScripts] = useState<CustomScript[]>([]);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState<number | null>(null);
  const [editModal, setEditModal] = useState<Partial<CustomScript> | null>(null);
  const [outputModal, setOutputModal] = useState<{ name: string; output: string } | null>(null);

  const fetchScripts = async () => {
    try {
      const data = await scriptsApi.getAll();
      setScripts(data);
    } catch (err) {
      onResult(err instanceof Error ? err.message : 'Failed to fetch scripts', true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScripts();
  }, []);

  const handleExecute = async (script: CustomScript) => {
    setExecuting(script.id);
    try {
      const result = await scriptsApi.execute(script.id);
      setOutputModal({ name: script.name, output: result.output || result.error || 'No output' });
      onResult(`Script "${script.name}" executed`);
    } catch (err) {
      onResult(err instanceof Error ? err.message : 'Execution failed', true);
    } finally {
      setExecuting(null);
    }
  };

  const handleSave = async () => {
    if (!editModal?.name || !editModal?.command) {
      onResult('Name and command are required', true);
      return;
    }

    try {
      if (editModal.id) {
        await scriptsApi.update(editModal.id, {
          name: editModal.name,
          description: editModal.description || '',
          command: editModal.command,
          icon: editModal.icon || 'terminal',
        });
        onResult('Script updated');
      } else {
        await scriptsApi.create({
          name: editModal.name,
          description: editModal.description || '',
          command: editModal.command,
          icon: editModal.icon || 'terminal',
        });
        onResult('Script created');
      }
      setEditModal(null);
      fetchScripts();
    } catch (err) {
      onResult(err instanceof Error ? err.message : 'Save failed', true);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this script?')) return;
    try {
      await scriptsApi.delete(id);
      onResult('Script deleted');
      fetchScripts();
    } catch (err) {
      onResult(err instanceof Error ? err.message : 'Delete failed', true);
    }
  };

  return (
    <motion.div
      className="terminal-box p-4 rounded-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-terminal-primary">
          CUSTOM SCRIPTS
        </h3>
        <button
          onClick={() => setEditModal({ name: '', description: '', command: '', icon: 'terminal' })}
          className="terminal-btn px-3 py-1 text-xs flex items-center gap-1"
        >
          <Plus size={14} />
          Add Script
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="loading-spinner w-8 h-8" />
        </div>
      ) : scripts.length === 0 ? (
        <p className="text-terminal-muted text-center py-8">
          No custom scripts. Click "Add Script" to create one.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {scripts.map((script) => (
            <motion.div
              key={script.id}
              className="relative group p-4 border border-terminal-border rounded hover:border-terminal-primary transition-colors"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="flex flex-col items-center gap-2 text-center">
                <Terminal className="w-8 h-8 text-terminal-secondary" />
                <p className="text-sm font-medium text-terminal-primary truncate w-full">
                  {script.name}
                </p>
                {script.description && (
                  <p className="text-xs text-terminal-muted truncate w-full">
                    {script.description}
                  </p>
                )}
              </div>

              <div className="absolute inset-0 bg-terminal-bg/90 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => handleExecute(script)}
                  disabled={executing === script.id}
                  className="p-2 text-terminal-primary hover:bg-terminal-primary/20 rounded"
                  title="Execute"
                >
                  {executing === script.id ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <Play size={20} />
                  )}
                </button>
                <button
                  onClick={() => setEditModal(script)}
                  className="p-2 text-terminal-accent hover:bg-terminal-accent/20 rounded"
                  title="Edit"
                >
                  <Edit2 size={20} />
                </button>
                <button
                  onClick={() => handleDelete(script.id)}
                  className="p-2 text-terminal-error hover:bg-terminal-error/20 rounded"
                  title="Delete"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      <Modal
        isOpen={!!editModal}
        onClose={() => setEditModal(null)}
        title={editModal?.id ? 'Edit Script' : 'New Script'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-terminal-secondary mb-1">Name</label>
            <input
              type="text"
              value={editModal?.name || ''}
              onChange={(e) => setEditModal({ ...editModal, name: e.target.value })}
              className="w-full terminal-input px-3 py-2 rounded"
              placeholder="Script name"
            />
          </div>
          <div>
            <label className="block text-sm text-terminal-secondary mb-1">Description</label>
            <input
              type="text"
              value={editModal?.description || ''}
              onChange={(e) => setEditModal({ ...editModal, description: e.target.value })}
              className="w-full terminal-input px-3 py-2 rounded"
              placeholder="Optional description"
            />
          </div>
          <div>
            <label className="block text-sm text-terminal-secondary mb-1">Command</label>
            <textarea
              value={editModal?.command || ''}
              onChange={(e) => setEditModal({ ...editModal, command: e.target.value })}
              className="w-full terminal-input px-3 py-2 rounded h-24 resize-none"
              placeholder="bash command or script path"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setEditModal(null)}
              className="terminal-btn px-4 py-2 flex items-center gap-2"
            >
              <X size={16} />
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="terminal-btn px-4 py-2 flex items-center gap-2"
            >
              <Save size={16} />
              Save
            </button>
          </div>
        </div>
      </Modal>

      {/* Output Modal */}
      <Modal
        isOpen={!!outputModal}
        onClose={() => setOutputModal(null)}
        title={`Output: ${outputModal?.name || ''}`}
        size="lg"
      >
        <pre className="text-xs text-terminal-secondary bg-terminal-bg p-4 rounded overflow-auto max-h-96 whitespace-pre-wrap">
          {outputModal?.output || 'No output'}
        </pre>
      </Modal>
    </motion.div>
  );
};
