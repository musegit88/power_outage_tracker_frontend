import { MapLoadingStateContext } from "@/contexts/mapLoadingStateContext";
import { useContext } from "react";

export const useMapLoadingState = () => {
  const context = useContext(MapLoadingStateContext);
  if (!context)
    throw new Error(
      "useMapLoadingState must be used within MapLoadingStateProvider",
    );
  return context;
};
