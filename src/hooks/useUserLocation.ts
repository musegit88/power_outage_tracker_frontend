import { useContext } from "react";

import { LocationContext } from "@/contexts/locationContext";

export const useUserLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
};
