import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

// Module-level singleton so the socket is shared across all hook consumers
let socket: Socket | null = null;

export function useSocket() {
  const ref = useRef<Socket | null>(null);

  useEffect(() => {
    if (!socket) {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3001';

      // Read the token cookie for the auth handshake
      const tokenMatch =
        typeof document !== 'undefined'
          ? document.cookie.match(/(?:^|;\s*)token=([^;]+)/)
          : null;
      const token = tokenMatch ? tokenMatch[1] : '';

      socket = io(baseUrl, {
        withCredentials: true,
        auth: { token },
        // Do not auto-connect until we actually need it
        autoConnect: true,
      });
    }

    ref.current = socket;

    // No cleanup: keep the singleton alive for the lifetime of the page
    return () => {};
  }, []);

  return ref;
}
