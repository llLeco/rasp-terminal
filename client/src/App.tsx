import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { Layout } from './components/layout/Layout';
import { LoginPage } from './pages/Login';
import { DashboardPage } from './pages/Dashboard';
import { TerminalPage } from './pages/Terminal';
import { ActionsPage } from './pages/Actions';
import { SettingsPage } from './pages/Settings';

function App() {
  const { isAuthenticated, loading, error, login, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-terminal-bg">
        <div className="text-center">
          <div className="loading-spinner w-12 h-12 mx-auto mb-4" />
          <p className="text-terminal-secondary">Initializing...</p>
        </div>
        <div className="scanline-overlay pointer-events-none" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={login} error={error} loading={loading} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout onLogout={logout} />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/terminal" element={<TerminalPage />} />
          <Route path="/actions" element={<ActionsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
