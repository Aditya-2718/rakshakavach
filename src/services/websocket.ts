/**
 * MineGuard Real-Time WebSocket Client
 * Connects to FastAPI backend WebSocket gateway with exponential backoff reconnection,
 * authentication token delivery, event listeners, and REST refresh triggers.
 */

const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8000/ws/telemetry';
const TOKEN_KEY = 'mg_access_token';

export type WsConnectionStatus = 'connected' | 'reconnecting' | 'disconnected';

export interface WsEventPayload<T = any> {
  type: string;
  timestamp: string;
  data: T;
}

type EventListener = (payload: WsEventPayload) => void;

class MineGuardWebSocketClient {
  private socket: WebSocket | null = null;
  private status: WsConnectionStatus = 'disconnected';
  private listeners: Map<string, Set<EventListener>> = new Map();
  private statusListeners: Set<(status: WsConnectionStatus) => void> = new Set();
  private reconnectAttempts: number = 0;
  private maxReconnectDelayMs: number = 16000;
  private reconnectTimer: any = null;
  private isIntentionallyClosed: boolean = false;
  private onReconnectCallback: (() => void) | null = null;

  public setOnReconnect(cb: () => void) {
    this.onReconnectCallback = cb;
  }

  public getStatus(): WsConnectionStatus {
    return this.status;
  }

  public connect() {
    this.isIntentionallyClosed = false;
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const token = localStorage.getItem(TOKEN_KEY);
    const url = token ? `${WS_BASE_URL}?token=${encodeURIComponent(token)}` : WS_BASE_URL;

    try {
      this.socket = new WebSocket(url);

      this.socket.onopen = () => {
        const wasReconnecting = this.reconnectAttempts > 0;
        this.reconnectAttempts = 0;
        this.setStatus('connected');
        console.log('[MineGuard WebSocket] Connected to real-time telemetry stream.');

        if (wasReconnecting && this.onReconnectCallback) {
          console.log('[MineGuard WebSocket] Reconnected! Triggering REST data catch-up refresh.');
          this.onReconnectCallback();
        }
      };

      this.socket.onmessage = (event) => {
        try {
          const payload: WsEventPayload = JSON.parse(event.data);
          this.notifyListeners(payload);
        } catch (err) {
          console.warn('[MineGuard WebSocket] Failed to parse message:', err);
        }
      };

      this.socket.onerror = (err) => {
        console.warn('[MineGuard WebSocket] Socket error:', err);
      };

      this.socket.onclose = () => {
        if (!this.isIntentionallyClosed) {
          this.setStatus('reconnecting');
          this.scheduleReconnect();
        } else {
          this.setStatus('disconnected');
        }
      };
    } catch (e) {
      console.error('[MineGuard WebSocket] Connection failed:', e);
      this.setStatus('reconnecting');
      this.scheduleReconnect();
    }
  }

  public disconnect() {
    this.isIntentionallyClosed = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.setStatus('disconnected');
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), this.maxReconnectDelayMs);
    this.reconnectAttempts++;
    console.log(`[MineGuard WebSocket] Reconnecting in ${delay}ms (attempt #${this.reconnectAttempts})...`);
    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  private setStatus(newStatus: WsConnectionStatus) {
    this.status = newStatus;
    this.statusListeners.forEach((fn) => fn(newStatus));
  }

  public subscribeStatus(listener: (status: WsConnectionStatus) => void): () => void {
    this.statusListeners.add(listener);
    listener(this.status);
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  public subscribe(eventType: string, listener: EventListener): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(listener);

    return () => {
      const set = this.listeners.get(eventType);
      if (set) {
        set.delete(listener);
      }
    };
  }

  private notifyListeners(payload: WsEventPayload) {
    const set = this.listeners.get(payload.type);
    if (set) {
      set.forEach((fn) => fn(payload));
    }
    // Also notify wildcard "*" listeners
    const wildcardSet = this.listeners.get('*');
    if (wildcardSet) {
      wildcardSet.forEach((fn) => fn(payload));
    }
  }
}

export const wsClient = new MineGuardWebSocketClient();
