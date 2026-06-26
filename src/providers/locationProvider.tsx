import { useEffect, useState, useCallback, type ReactNode } from "react";
import { LocationContext } from "@/contexts/locationContext";

export const LocationProvider = ({ children }: { children: ReactNode }) => {
  const [positions, setPositions] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [permissionState, setPermissionState] = useState<
    "granted" | "denied" | "prompt"
  >("prompt");

  // fetch position
  const fetchPosition = useCallback(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setPositions({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setPermissionState("granted");
      },
      (error) => {
        console.error("Geolocation error:", error.message);
        if (error.code === error.PERMISSION_DENIED) {
          setPermissionState("denied");
        }
      },
    );
  }, []);

  useEffect(() => {
    // check if geolocation is supported
    if (!navigator.geolocation) {
      console.log("Geolocation not supported");
      return;
    }

    // get permission status
    let permissionStatus: PermissionStatus | null = null;

    // handle permission change
    const handlePermissionChange = () => {
      if (permissionStatus) {
        setPermissionState(permissionStatus.state);
        if (permissionStatus.state === "granted") {
          fetchPosition();
        }
      }
    };

    // initialize permission status
    const init = async () => {
      permissionStatus = await navigator.permissions.query({
        name: "geolocation",
      });

      setPermissionState(permissionStatus.state);

      if (
        permissionStatus.state === "granted" ||
        permissionStatus.state === "prompt"
      ) {
        fetchPosition();
      }

      permissionStatus.addEventListener("change", handlePermissionChange);
    };

    init();

    return () => {
      permissionStatus?.removeEventListener("change", handlePermissionChange);
    };
  }, [fetchPosition]);

  const value = {
    positions,
    permissionState,
    setPositions,
    setPermissionState,
    fetchPosition,
  };
  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};
