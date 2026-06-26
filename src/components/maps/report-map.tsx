import { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import { Loader2 } from "lucide-react";
import "mapbox-gl/dist/mapbox-gl.css";

import { useTheme } from "@/components/theme-provider";

const ReportMap = ({
  field,
  onChange,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  field: any;
  onChange: (value: { longitude: number; latitude: number }) => void;
}) => {
  const { theme } = useTheme();

  const mapRef = useRef<mapboxgl.Map>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  // Keep onChange in a ref so the map effect never needs to re-run because of it
  const onChangeRef = useRef(onChange);
  const [isMapLoading, setIsMapLoading] = useState(true);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Initialize the map only once (or when the theme changes)
  useEffect(() => {
    if (!mapContainerRef.current) return;
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

    const initialLng = field.state.value.longitude || 9;
    const initialLat = field.state.value.latitude || 38;

    const map = (mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      center: [initialLng, initialLat],
      zoom: 9,
      style:
        theme === "dark"
          ? "mapbox://styles/mapbox/dark-v11"
          : "mapbox://styles/mapbox/streets-v12",
    }));

    // Show loading overlay while map tiles are loading
    map.on("load", () => {
      setIsMapLoading(true);
    });

    // Hide loading overlay once the map is idle
    map.on("idle", () => {
      setIsMapLoading(false);
    });

    // Fly to the user's location after the first idle event
    map.once("idle", () => {
      map.flyTo({
        center: [initialLng, initialLat],
        zoom: 12,
        speed: 1.2,
        curve: 1.42,
        essential: true,
      });
    });

    // Setting the max bounds of the map
    map.setMaxBounds([
      [38.59823780218804, 8.797975532836418],
      [38.935590926262506, 9.089991658552165],
    ]);

    // Adding draggable marker to the user's location
    const marker = new mapboxgl.Marker({ draggable: true })
      .setLngLat([initialLng, initialLat])
      .addTo(map);

    markerRef.current = marker;

    // Update field value when marker is dragged
    marker.on("dragend", () => {
      const lngLat = marker.getLngLat();
      onChangeRef.current({
        longitude: lngLat.lng,
        latitude: lngLat.lat,
      });
    });

    // Cleaning up the map
    return () => {
      mapRef.current?.remove();
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]); // Only rebuild the whole map when the theme changes

  // Sync marker position when the field value changes externally (without rebuilding the map)
  useEffect(() => {
    const lng = field.state.value.longitude;
    const lat = field.state.value.latitude;
    if (markerRef.current && lng && lat) {
      markerRef.current.setLngLat([lng, lat]);
    }
  }, [field.state.value.longitude, field.state.value.latitude]);

  return (
    <div className="relative h-full w-full">
      <div ref={mapContainerRef} className="h-full w-full rounded-lg" />
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
    </div>
  );
};

export default ReportMap;
