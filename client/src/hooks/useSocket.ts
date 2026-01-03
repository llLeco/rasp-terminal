import { useState, useEffect } from 'react';
import { getSocket } from '../services/socket';

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = getSocket();

    if (!socket) {
      setIsConnected(false);
      return;
    }

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    setIsConnected(socket.connected);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
    };
  }, []);

  return { isConnected };
};
