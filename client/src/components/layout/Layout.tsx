import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Navigation } from './Navigation';
import { StatusBar } from './StatusBar';
import { useStats } from '../../hooks/useStats';
import { useSocket } from '../../hooks/useSocket';

interface LayoutProps {
  onLogout: () => void;
}

export const Layout = ({ onLogout }: LayoutProps) => {
  const { stats } = useStats();
  const { isConnected } = useSocket();

  return (
    <div className="flex flex-col h-screen bg-terminal-bg overflow-hidden">
      <Header hostname={stats?.system.hostname} onLogout={onLogout} />
      <Navigation />

      <main className="flex-1 overflow-auto p-6">
        <Outlet />
      </main>

      <StatusBar stats={stats} isConnected={isConnected} />

      {/* Scanline effect overlay */}
      <div className="scanline-overlay pointer-events-none" />
    </div>
  );
};
