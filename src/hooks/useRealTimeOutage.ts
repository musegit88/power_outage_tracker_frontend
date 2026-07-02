import socketService from "@/services/socketService";
import { useEffect, useState } from "react";

interface UserRealTimeOutagesOptions {
  userLocation?: { lat: number; lng: number };
  enabled?: boolean;
}

export const useRealTimeOutages = (
  options: UserRealTimeOutagesOptions = {},
) => {
  const { userLocation, enabled } = options;
  const [stats, setStats] = useState<{
    activeOutages: number;
    onlineUsers: number;
    resolvedToday: number;
  } | null>(null);
  const [connectionStatus, setConnectionStatus] = useState(
    socketService.isConnected(),
  );
  useEffect(() => {
    if (!enabled) return;

    // Connect to socket
    socketService.connect();
    const handelConnect = () => {
      setConnectionStatus(true);
    };
    const handleDisconnect = () => {
      setConnectionStatus(false);
    };

    socketService.onConnect(handelConnect);
    socketService.onDisconnect(handleDisconnect);

    // Join location updates if user location available
    if (userLocation) {
      socketService.joinLocation(userLocation.lat, userLocation.lng);
    }

    // listen for stats updates
    const handleStatsUpdate = (newStats: {
      activeOutages: number;
      onlineUsers: number;
      resolvedToday: number;
    }) => {
      console.log(newStats);
      setStats(newStats);
    };
    socketService.onStatsUpdate(handleStatsUpdate);

    // Cleanup
    return () => {
      socketService.off("stats:update", handleStatsUpdate);
      socketService.off("connect", handelConnect);
      socketService.off("disconnect", handleDisconnect);
      if (userLocation) {
        socketService.leaveLocation();
      }
    };
  }, [enabled, userLocation]);

  return {
    stats,
    connectionStatus,
  };
};
