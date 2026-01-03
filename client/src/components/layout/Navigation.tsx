import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, Terminal, Zap, Settings } from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'DASHBOARD' },
  { to: '/terminal', icon: Terminal, label: 'TERMINAL' },
  { to: '/actions', icon: Zap, label: 'ACTIONS' },
  { to: '/settings', icon: Settings, label: 'SETTINGS' },
];

export const Navigation = () => {
  return (
    <nav className="flex items-center justify-center gap-2 px-6 py-3 border-b border-terminal-border bg-terminal-bg">
      {navItems.map((item, index) => (
        <motion.div
          key={item.to}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <NavLink
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-2 px-6 py-2 text-sm font-medium transition-all duration-200 border ${
                isActive
                  ? 'bg-terminal-primary/10 border-terminal-primary text-terminal-primary shadow-glow'
                  : 'border-terminal-border text-terminal-muted hover:border-terminal-primary-dim hover:text-terminal-secondary'
              }`
            }
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </NavLink>
        </motion.div>
      ))}
    </nav>
  );
};
