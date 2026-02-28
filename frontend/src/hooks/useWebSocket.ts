import { useState, useEffect, useRef, useCallback } from 'react';

type WebSocketStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

interface UseWebSocketOptions {
  /** Auto-reconnect on disconnect (default: true) */
  reconnect?: boolean;
  /** Reconnect interval in ms (default: 3000) */
  reconnectInterval?: number;
  /** Max reconnect attempts (default: 5) */
  maxRetries?: number;
  /** Protocols */
  protocols?: string | string[];
}

interface UseWebSocketReturn<T> {
  data: T | null;
  status: WebSocketStatus;
  send: (message: string | object) => void;
  close: () => void;
  reconnect: () => void;
}

/**
 * Manages a WebSocket connection with auto-reconnect support.
 * Parses incoming JSON messages automatically.
 */
export function useWebSocket<T = unknown>(
  url: string | null,
  options?: UseWebSocketOptions,
): UseWebSocketReturn<T> {
  const {
    reconnect: autoReconnect = true,
    reconnectInterval = 3000,
    maxRetries = 5,
    protocols,
  } = options || {};

  const [data, setData] = useState<T | null>(null);
  const [status, setStatus] = useState<WebSocketStatus>('disconnected');
  const wsRef = useRef<WebSocket | null>(null);
  const retriesRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const connect = useCallback(() => {
    if (!url) return;
    setStatus('connecting');

    try {
      const ws = new WebSocket(url, protocols);

      ws.onopen = () => {
        setStatus('connected');
        retriesRef.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data) as T;
          setData(parsed);
        } catch {
          setData(event.data as unknown as T);
        }
      };

      ws.onerror = () => {
        setStatus('error');
      };

      ws.onclose = () => {
        setStatus('disconnected');
        wsRef.current = null;

        if (autoReconnect && retriesRef.current < maxRetries) {
          retriesRef.current += 1;
          timerRef.current = setTimeout(connect, reconnectInterval);
        }
      };

      wsRef.current = ws;
    } catch {
      setStatus('error');
    }
  }, [url, protocols, autoReconnect, reconnectInterval, maxRetries]);

  useEffect(() => {
    connect();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      wsRef.current?.close();
    };
  }, [connect]);

  const send = useCallback((message: string | object) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(typeof message === 'string' ? message : JSON.stringify(message));
    }
  }, []);

  const close = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    retriesRef.current = maxRetries; // prevent auto-reconnect
    wsRef.current?.close();
  }, [maxRetries]);

  const reconnectFn = useCallback(() => {
    retriesRef.current = 0;
    wsRef.current?.close();
    connect();
  }, [connect]);

  return { data, status, send, close, reconnect: reconnectFn };
}
