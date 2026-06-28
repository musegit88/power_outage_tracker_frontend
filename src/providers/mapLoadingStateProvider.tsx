import { useState, type ReactNode } from "react";
import { MapLoadingStateContext } from "@/contexts/mapLoadingStateContext";

export const MapLoadingStateProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [isMapLoading, setIsMapLoading] = useState(true);
  const value = { isMapLoading, setIsMapLoading };
  return (
    <MapLoadingStateContext.Provider value={value}>
      {children}
    </MapLoadingStateContext.Provider>
  );
};
