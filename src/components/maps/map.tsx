import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Loader2, Locate, MapPin, TriangleAlert } from "lucide-react";

import type { Outage } from "@/types";
import api from "@/services/api";
import { useTheme } from "../theme-provider";
import { useUserLocation } from "@/hooks/useUserLocation";
import { useMapLoadingState } from "@/hooks/useMapLoadingState";
import { Button } from "@/components/ui/button";
import Marker from "@/components/marker";
import Popup from "@/components/popup";
import { toast } from "sonner";

// Default center of the supported service area
const DEFAULT_CENTER: [number, number] = [38.766, 8.944];

interface MapProps {
  limit?: number;
  offset?: number;
  status: string;
}

const Map = ({ limit, offset, status }: MapProps) => {
  const { theme } = useTheme();
  const { positions, isOutOfBounds, setPositions } = useUserLocation();

  const mapRef = useRef<mapboxgl.Map>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<mapboxgl.Marker>(null);

  const { isMapLoading, setIsMapLoading } = useMapLoadingState();
  const [makeDraggable, setMakeDraggable] = useState(false);
  const [mapInstance, setMapInstance] = useState<mapboxgl.Map | null>(null);
  const [outages, setOutages] = useState<Outage[]>([]);
  const [activeMarker, setActiveMarker] = useState<Outage>();

  // Handle Use default location button
  const handleUseDefaultLocation = () => {
    setPositions({ lat: DEFAULT_CENTER[1], lng: DEFAULT_CENTER[0] });
    setMakeDraggable(false);
  };

  // Handle Update location button
  const handleUpdateLocation = () => {
    setMakeDraggable(true);
  };

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
    setMapInstance(mapRef.current);

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

    // Determine effective center: use default if out of bounds, else user position
    const effectiveCenter: [number, number] = isOutOfBounds
      ? DEFAULT_CENTER
      : [
          positions?.lng || DEFAULT_CENTER[0],
          positions?.lat || DEFAULT_CENTER[1],
        ];

    // Fly to the effective location after the first idle event
    mapRef.current.once("idle", () => {
      mapRef.current?.flyTo({
        center: effectiveCenter,
        zoom: 12,
        speed: 1.2,
        curve: 1.42,
        essential: true,
      });
    });

    // Adding the Marker to the effective location
    markerRef.current = new mapboxgl.Marker({
      draggable: makeDraggable,
      color: makeDraggable ? "red" : undefined,
    })
      .setLngLat(effectiveCenter)
      .addTo(mapRef.current);

    // Update location when marker is dragged
    markerRef.current.on("dragend", () => {
      const lngLat = markerRef.current?.getLngLat();
      console.log(lngLat);
      if (lngLat) {
        setPositions({ lng: lngLat.lng, lat: lngLat.lat });
        setMakeDraggable(false);
        toast.success("Location updated successfully");
      }
    });

    //____________ close popup when clicking on map, during dragstart, during load, and during resize _________________
    mapRef.current.on("click", () => {
      setActiveMarker(undefined);
    });
    mapRef.current.on("dragstart", () => {
      setActiveMarker(undefined);
    });
    mapRef.current.on("load", () => {
      setActiveMarker(undefined);
    });
    mapRef.current.on("resize", () => {
      setActiveMarker(undefined);
    });
    // ___________________________________________

    // Cleaning up the map
    return () => {
      mapRef.current?.remove();
    };
  }, [
    theme,
    positions,
    isOutOfBounds,
    setIsMapLoading,
    makeDraggable,
    setPositions,
  ]);

  useEffect(() => {
    const getAllOutages = async () => {
      const response = await api.getAllOutages(limit!, offset!, status);
      setOutages(response.outages);
    };
    getAllOutages();
  }, [limit, offset, status]);

  const handleMarkerClick = (outage: Outage) => {
    setActiveMarker(outage);
  };
  return (
    <>
      <div ref={mapContainerRef} className="relative w-full h-full" />

      {/* Out-of-bounds warning banner */}
      {isOutOfBounds && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md">
          <div className="flex items-start gap-3 rounded-xl border border-amber-400/40 bg-amber-950/80 backdrop-blur-md px-4 py-3 shadow-lg text-amber-200">
            <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-amber-300">
                Location outside service area
              </p>
              <p className="text-xs mt-0.5 text-amber-200/80">
                Your GPS location is outside the supported Addis Ababa region.
                The map is showing the default service area center.
              </p>
              <div className="sm:flex-row flex-col flex justify-end w-full gap-2">
                <Button
                  onClick={handleUseDefaultLocation}
                  className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-amber-400 px-3 py-1 text-xs font-semibold text-amber-950 hover:bg-amber-300 transition-colors"
                >
                  <MapPin />
                  Use Default Location
                </Button>
                <Button
                  onClick={handleUpdateLocation}
                  className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-amber-400 px-3 py-1 text-xs font-semibold text-amber-950 hover:bg-amber-300 transition-colors"
                >
                  <Locate />
                  Update Your Location
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
      {!isMapLoading &&
        mapInstance &&
        outages &&
        outages.map((outage) => (
          <Marker
            key={outage.id}
            data={outage}
            map={mapInstance}
            isActive={activeMarker?.id === outage.id}
            onClick={handleMarkerClick}
          />
        ))}
      {mapInstance && <Popup activeMarker={activeMarker} map={mapInstance} />}
    </>
  );
};

export default Map;
