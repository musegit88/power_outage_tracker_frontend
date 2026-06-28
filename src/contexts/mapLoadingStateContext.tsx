import { createContext } from "react";

interface MapLoadingStateContextType {
  isMapLoading: boolean;
  setIsMapLoading: (value: boolean) => void;
}

export const MapLoadingStateContext = createContext<
  MapLoadingStateContextType | undefined
>(undefined);
