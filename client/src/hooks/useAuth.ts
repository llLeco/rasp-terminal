import { useState, useEffect, useCallback } from 'react';
import { auth } from '../services/api';
import { initSocket, disconnectSocket } from '../services/socket';
import type { AuthState } from '../types';

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    token: localStorage.getItem('token'),
    loading: true,
    error: null,
  });

  const verifyToken = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setState((s) => ({ ...s, loading: false, isAuthenticated: false }));
      return;
    }

    try {
      await auth.verify();
      initSocket(token);
      setState((s) => ({ ...s, isAuthenticated: true, token, loading: false }));
    } catch {
      localStorage.removeItem('token');
      setState((s) => ({
        ...s,
        isAuthenticated: false,
        token: null,
        loading: false,
      }));
    }
  }, []);

  useEffect(() => {
    verifyToken();
  }, [verifyToken]);

  const login = async (password: string) => {
    setState((s) => ({ ...s, loading: true, error: null }));

    try {
      const response = await auth.login(password);
      localStorage.setItem('token', response.token);
      initSocket(response.token);
      setState({
        isAuthenticated: true,
        token: response.token,
        loading: false,
        error: null,
      });
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      setState((s) => ({
        ...s,
        loading: false,
        error: message,
      }));
      return false;
    }
  };

  const logout = async () => {
    try {
      await auth.logout();
    } catch {
      // Ignore logout errors
    }

    localStorage.removeItem('token');
    disconnectSocket();
    setState({
      isAuthenticated: false,
      token: null,
      loading: false,
      error: null,
    });
  };

  return {
    ...state,
    login,
    logout,
    verifyToken,
  };
};
