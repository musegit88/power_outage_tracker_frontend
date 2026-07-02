import { io, Socket } from "socket.io-client";
import tokenService from "./tokenService";
import type { Outage } from "@/types";

interface StatsUpdate {
  activeOutages: number;
  onlineUsers: number;
  resolvedToday: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EventCallback<T = any> = (data: T) => void;

class SocketService {
  private socket: Socket | null = null;
  private reconnectionAttempts = 0;
  private maxReconnectionAttempts = 5;

  // Initialize socket connection

  connect() {
    if (this.socket) {
      if (this.socket.connected) {
        console.log("Socket already connected");
      } else {
        console.log("Socket exists but is disconnected. Reconnecting...");
        this.socket.connect();
      }
      return;
    }

    const token = tokenService.getAccessToken();
    const apiUrl = import.meta.env.VITE_SOCKET_URL;

    this.socket = io(apiUrl, {
      auth: {
        token: token || undefined,
      },
      reconnection: true,
      reconnectionAttempts: this.maxReconnectionAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      transports: ["websocket", "polling"],
    });
    this.setupEventHandlers();
  }

  //   Setup connection event handlers
  private setupEventHandlers() {
    const socket = this.socket;
    if (!socket) return;

    socket.on("connect", () => {
      const transport = socket.io.engine.transport.name;
      console.log("transport", transport);
      socket.io.engine.on("upgrade", () => {
        const upgradedTransport = socket.io.engine.transport.name;
        console.log("upgradedTransport", upgradedTransport);
      });
      console.log(`Socket connected: ${socket.id}`);
      this.reconnectionAttempts = 0;
    });
    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      if (reason === "io server disconnect") {
        // Server disconnected, try to connect
        socket.connect();
        console.log("Server disconnected, trying to reconnect");
      }
    });
    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      this.reconnectionAttempts++;

      if (this.reconnectionAttempts >= this.maxReconnectionAttempts) {
        console.error("Max reconnection attempts reached");
      }
    });
    socket.on("reconnect", (attemptNumber) => {
      console.log("Socket reconnected after", attemptNumber, "attempts");
    });
  }

  sendTestEvent() {
    this.socket?.emit("test:client", "hello from client");
  }

  //   Join location-based updates
  joinLocation(lat: number, lng: number, radius?: number) {
    if (!this.socket?.connected) {
      console.warn("Socket not connected");
      return;
    }

    this.socket.emit("join:location", { lat, lng, radius });
    console.log(`Joined location updates: ${lat}, ${lng}`);
  }

  //   Leave location-based updates
  leaveLocation() {
    if (!this.socket?.connected) return;

    this.socket.emit("leave:location");
    console.log("Left location updates");
  }

  //   Listen for new outages
  onNewOutage(callback: EventCallback<Outage>) {
    if (!this.socket) return;

    this.socket.on("outage:new", callback);
  }

  //   Listen for outage confirmation
  onOutageConfirmed(callback: EventCallback<{ outage: Outage }>) {
    if (!this.socket) return;

    this.socket.on("outage:confirmed", callback);
  }

  // Listen for outage status changes
  onOutageStatusChanged(
    callback: EventCallback<{
      outage: Outage;
    }>,
  ) {
    if (!this.socket) return;

    this.socket.on("outage:status_change", callback);
  }

  //   Listen for statistics updates
  onStatsUpdate(callback: EventCallback<StatsUpdate>) {
    if (!this.socket) return;

    this.socket.on("stats:update", (data) => {
      console.log("stats:update", data);
      callback(data);
    });
  }

  // Subscribe to connection events
  onConnect(callback: () => void) {
    if (!this.socket) return;
    this.socket.on("connect", callback);
  }

  onDisconnect(callback: () => void) {
    if (!this.socket) return;
    this.socket.on("disconnect", callback);
  }

  //   Remove event listener
  off(eventName: string, callback: EventCallback) {
    if (!this.socket) return;

    if (callback) {
      this.socket.off(eventName, callback);
    } else {
      this.socket.off(eventName);
    }
  }

  //   Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log("Socket disconnected manually");
    }
  }

  //   Check if socket is connected
  isConnected() {
    return this.socket?.connected || false;
  }

  //   Get socket instance
  getSocket(): Socket | null {
    return this.socket;
  }
}

export default new SocketService();
