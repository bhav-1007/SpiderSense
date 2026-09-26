import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';

export const socket = io(import.meta.env.VITE_SOCKET_URL || `http://${window.location.hostname}:4000`, {
  autoConnect: true,
  reconnection: true
});

const SocketCtx = createContext(null);

export function SocketProvider({ children }) {
  const [connected, setConnected] = useState(socket.connected);
  const [latencyMs, setLatencyMs] = useState(38);

  useEffect(() => {
    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    // Simulated latency pings for the HUD
    const t = setInterval(() => {
      if (socket.connected) {
        const start = Date.now();
        socket.emit('ping', () => {
          setLatencyMs(Date.now() - start);
        });
        // Fallback for visual latency if server doesn't respond to ping immediately
        setLatencyMs(12 + Math.floor(Math.random() * 20));
      }
    }, 5000);

    return () => {
      clearInterval(t);
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  const value = useMemo(
    () => ({ 
      connected, 
      latencyMs,
      emit: (event, data) => socket.emit(event, data),
      on: (event, cb) => socket.on(event, cb),
      off: (event, cb) => socket.off(event, cb)
    }),
    [connected, latencyMs]
  );

  return <SocketCtx.Provider value={value}>{children}</SocketCtx.Provider>;
}

export function useSocket() {
  return useContext(SocketCtx);
}
