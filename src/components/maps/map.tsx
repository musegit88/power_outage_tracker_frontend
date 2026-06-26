import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Loader2 } from "lucide-react";

import { useTheme } from "../theme-provider";
import { useUserLocation } from "@/hooks/useUserLocation";

const Map = () => {
  const { theme } = useTheme();
  const { positions } = useUserLocation();

  const mapRef = useRef<mapboxgl.Map>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const [isMapLoading, setIsMapLoading] = useState(false);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      center: [positions?.lng || 38, positions?.lat || 9],
      zoom: 9,
      style:
        theme === "dark"
          ? "mapbox://styles/mapbox/dark-v11"
          : "mapbox://styles/mapbox/streets-v12",
    });

    // Adding map controls but not the zoom button
    mapRef.current.addControl(
      new mapboxgl.NavigationControl({ showZoom: false }),
    );

    // Setting the max bounds of the map
    mapRef.current.setMaxBounds([
      [38.59823780218804, 8.797975532836418],
      [38.935590926262506, 9.089991658552165],
    ]);

    // changing the loading state when the map is loaded
    mapRef.current.on("load", () => {
      setIsMapLoading(true);
    });

    // Hide loading overlay once the map is idle
    mapRef.current.on("idle", () => {
      setIsMapLoading(false);
    });

    // Fly to the user's location after the first idle event
    mapRef.current.once("idle", () => {
      mapRef.current?.flyTo({
        center: [positions?.lng || 38, positions?.lat || 9],
        zoom: 12,
        speed: 1.2,
        curve: 1.42,
        essential: true,
      });
    });

    // Adding the Marker to the user's location
    new mapboxgl.Marker({
      draggable: false,
    })
      .setLngLat([positions?.lng || 38, positions?.lat || 9])
      .addTo(mapRef.current);

    // Cleaning up the map
    return () => {
      mapRef.current?.remove();
    };
  }, [theme, positions]);
  return (
    <>
      <div ref={mapContainerRef} className="relative w-full h-full" />
      {isMapLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-sm font-medium animate-pulse text-muted-foreground">
              Initializing Map...
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default Map;
