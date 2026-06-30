import { createContext } from "react";
import type { DeviceOS } from "@/providers/locationProvider";

interface LocationContextType {
  positions: { lat: number; lng: number } | null;
  permissionState: "granted" | "denied" | "prompt";
  isOutOfBounds: boolean;
  deviceOS: DeviceOS;
  setIsOutOfBounds: (isOutOfBounds: boolean) => void;
  setPositions: (positions: { lat: number; lng: number } | null) => void;
  setPermissionState: (
    permissionState: "granted" | "denied" | "prompt",
  ) => void;
  fetchPosition: () => void;
}

export const LocationContext = createContext<LocationContextType | undefined>(
  undefined,
);
