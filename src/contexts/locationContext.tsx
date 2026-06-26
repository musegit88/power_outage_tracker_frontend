import { createContext } from "react";

interface LocationContextType {
  positions: { lat: number; lng: number } | null;
  permissionState: "granted" | "denied" | "prompt";
  setPositions: (positions: { lat: number; lng: number } | null) => void;
  setPermissionState: (
    permissionState: "granted" | "denied" | "prompt",
  ) => void;
  fetchPosition: () => void;
}

export const LocationContext = createContext<LocationContextType | undefined>(
  undefined,
);
