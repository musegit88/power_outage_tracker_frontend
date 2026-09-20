import { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import { Loader2, MapPin, TriangleAlert } from "lucide-react";
import "mapbox-gl/dist/mapbox-gl.css";

import { useUserLocation } from "@/hooks/useUserLocation";

import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";

const DEFAULT_CENTER: [number, number] = [38.766, 8.944];

const ReportMap = ({
  field,
  onChange,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  field: any;
  onChange: (value: { longitude: number; latitude: number }) => void;
}) => {
  const { theme } = useTheme();
  const { positions, isOutOfBounds, setPositions } = useUserLocation();

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

    const initialLng = field.state.value.longitude || DEFAULT_CENTER[0];
    const initialLat = field.state.value.latitude || DEFAULT_CENTER[1];

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
        zoom: 15,
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

    // custom marker element
    const element = document.createElement("div");
    element.style.width = "32px";
    element.style.height = "32px";
    element.style.color = "#4268ff";
    element.innerHTML = `<svg title="drag the icon to change location" viewBox="-4 0 32 32" xmlns="http://www.w3.org/2000/svg" width="32" height="32"><path fill="currentColor" transform="translate(-106, -413)" d="M118,422 C116.343,422 115,423.343 115,425 C115,426.657 116.343,428 118,428 C119.657,428 121,426.657 121,425 C121,423.343 119.657,422 118,422 L118,422 Z M118,430 C115.239,430 113,427.762 113,425 C113,422.238 115.239,420 118,420 C120.761,420 123,422.238 123,425 C123,427.762 120.761,430 118,430 L118,430 Z M118,413 C111.373,413 106,418.373 106,425 C106,430.018 116.005,445.011 118,445 C119.964,445.011 130,429.95 130,425 C130,418.373 124.627,413 118,413 L118,413 Z"/></svg>`;
    const locationPopup = new mapboxgl.Popup({
      offset: 25,
      closeButton: false,
    }).setText(`Your location`);
    // Adding draggable marker to the user's location
    const marker = new mapboxgl.Marker({ draggable: true, element })
      .setLngLat([
        positions?.lng || DEFAULT_CENTER[0],
        positions?.lat || DEFAULT_CENTER[1],
      ])
      .setPopup(locationPopup)
      .addTo(map);

    markerRef.current = marker;

    // Update field value when marker is dragged
    marker.on("dragend", () => {
      const lngLat = marker.getLngLat();
      onChangeRef.current({
        longitude: lngLat.lng,
        latitude: lngLat.lat,
      });
      map.flyTo({
        center: [lngLat.lng, lngLat.lat],
        zoom: 15,
        speed: 1.2,
        curve: 1.42,
        essential: true,
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

  const handleUseDefaultLocation = () => {
    if (!mapRef.current) return;
    setPositions({ lat: DEFAULT_CENTER[1], lng: DEFAULT_CENTER[0] });
    mapRef.current.flyTo({
      center: [DEFAULT_CENTER[0], DEFAULT_CENTER[1]],
      zoom: 15,
      speed: 1.2,
      curve: 1.42,
      essential: true,
    });
  };
  return (
    <div className="relative h-full w-full">
      <div ref={mapContainerRef} className="h-full w-full rounded-lg" />
      {isOutOfBounds && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md">
          <div className="flex items-start gap-3 rounded-xl border border-amber-400/40 bg-amber-950/80 backdrop-blur-md px-4 py-3 shadow-lg text-amber-200">
            <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-amber-300">
                Location outside service area
              </p>
              <p className="text-xs mt-0.5 text-amber-200/80">
                Your GPS location is outside the supported Area. The map is
                showing the default service area center.
              </p>
              <div className="sm:flex-row flex-col flex justify-end w-full gap-2">
                <Button
                  onClick={handleUseDefaultLocation}
                  className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-amber-400 px-3 py-1 text-xs font-semibold text-amber-950 hover:bg-amber-300 transition-colors"
                >
                  <MapPin />
                  Use Default Location
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
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
