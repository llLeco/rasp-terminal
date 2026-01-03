import { LoginForm } from '../components/auth/LoginForm';

interface LoginPageProps {
  onLogin: (password: string) => Promise<boolean>;
  error: string | null;
  loading: boolean;
}

export const LoginPage = ({ onLogin, error, loading }: LoginPageProps) => {
  return <LoginForm onLogin={onLogin} error={error} loading={loading} />;
};
