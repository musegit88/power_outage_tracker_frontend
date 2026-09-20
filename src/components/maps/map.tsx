import { useCallback, useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Loader2, MapPin, TriangleAlert, X } from "lucide-react";

import { useUserLocation } from "@/hooks/useUserLocation";
import { useMapLoadingState } from "@/hooks/useMapLoadingState";
import socketService from "@/services/socketService";
import type { Outage } from "@/types";
import api from "@/services/api";

import { toast } from "sonner";
import { useTheme } from "../theme-provider";
import { Button } from "@/components/ui/button";
import Marker from "@/components/marker";
import Popup from "@/components/popup";

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
  const userMarkerElementRef = useRef<HTMLDivElement>(null);

  const setPositionsRef = useRef(setPositions);

  const { isMapLoading, setIsMapLoading } = useMapLoadingState();
  const [makeDraggable, setMakeDraggable] = useState(false);
  const [mapInstance, setMapInstance] = useState<mapboxgl.Map | null>(null);
  const [outages, setOutages] = useState<Outage[]>([]);
  const [activeMarker, setActiveMarker] = useState<Outage>();

  useEffect(() => {
    setPositionsRef.current = setPositions;
  }, [setPositions]);

  // Initialize the map only once (or when the theme changes)
  useEffect(() => {
    if (!mapContainerRef.current) return;

    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      center: [
        positions?.lng || DEFAULT_CENTER[0],
        positions?.lat || DEFAULT_CENTER[1],
      ],
      zoom: 12,
      style:
        theme === "dark"
          ? "mapbox://styles/mapbox/dark-v11"
          : "mapbox://styles/mapbox/streets-v12",
    });

    mapRef.current = map;
    setMapInstance(map);

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
    map.on("load", () => {
      setIsMapLoading(true);
    });

    // Hide loading overlay once the map is idle
    map.on("idle", () => {
      setIsMapLoading(false);
    });

    // custom marker element
    const element = document.createElement("div");
    element.style.visibility = isOutOfBounds ? "hidden" : "visible";
    element.style.width = "32px";
    element.style.height = "32px";
    element.style.color = "#4268ff";
    element.title = "Your location";
    element.innerHTML = `<svg title="Your location" viewBox="-4 0 32 32" xmlns="http://www.w3.org/2000/svg" width="32" height="32"><path fill="currentColor" transform="translate(-106, -413)" d="M118,422 C116.343,422 115,423.343 115,425 C115,426.657 116.343,428 118,428 C119.657,428 121,426.657 121,425 C121,423.343 119.657,422 118,422 L118,422 Z M118,430 C115.239,430 113,427.762 113,425 C113,422.238 115.239,420 118,420 C120.761,420 123,422.238 123,425 C123,427.762 120.761,430 118,430 L118,430 Z M118,413 C111.373,413 106,418.373 106,425 C106,430.018 116.005,445.011 118,445 C119.964,445.011 130,429.95 130,425 C130,418.373 124.627,413 118,413 L118,413 Z"/></svg>`;
    userMarkerElementRef.current = element;

    // Popup for user location marker
    const locationPopup = new mapboxgl.Popup({
      offset: 25,
      closeButton: false,
    }).setText("Your location");
    // User location marker
    const marker = new mapboxgl.Marker({
      draggable: false,
      element,
    })
      .setLngLat([
        positions?.lng || DEFAULT_CENTER[0],
        positions?.lat || DEFAULT_CENTER[1],
      ])
      .addTo(map)
      .setPopup(locationPopup);
    markerRef.current = marker;

    marker.on("dragend", () => {
      const lngLat = marker.getLngLat();
      setPositionsRef.current({ lng: lngLat.lng, lat: lngLat.lat });
      map.flyTo({
        center: [lngLat.lng, lngLat.lat],
        zoom: 15,
        speed: 1.2,
        curve: 1.42,
        essential: true,
      });
      setMakeDraggable(false);
      marker.setDraggable(false);
      toast.success("Location updated successfully");
    });

    //____________ close popup when clicking on map, during dragstart, during load, resize and during zoom _________________
    const closePopup = () => setActiveMarker(undefined);
    map.on("click", closePopup);
    map.on("dragstart", closePopup);
    map.on("load", closePopup);
    map.on("resize", closePopup);
    map.on("zoom", closePopup);
    // ___________________________________________

    // Cleaning up the map
    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
      userMarkerElementRef.current = null;
      setMapInstance(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]); // Only rebuild the whole map when the theme changes

  // change color of the marker based on makeDraggable state
  useEffect(() => {
    if (!userMarkerElementRef.current) return;
    userMarkerElementRef.current.style.color = makeDraggable
      ? "#ef4444"
      : "#4268ff";
  }, [makeDraggable]);

  // Sync marker when user location or out-of-bounds status changes
  useEffect(() => {
    if (!markerRef.current || !mapRef.current) return;

    if (isOutOfBounds) {
      // Hide the marker - user is outside the service area
      markerRef.current.getElement().style.visibility = "hidden";
    } else if (positions) {
      markerRef.current.getElement().style.visibility = "visible";
      markerRef.current.setLngLat([
        positions.lng || DEFAULT_CENTER[0],
        positions.lat || DEFAULT_CENTER[1],
      ]);
    }
  }, [positions, isOutOfBounds]);

  //  control  marker draggable state
  useEffect(() => {
    if (!mapRef.current) return;

    markerRef.current?.setDraggable(makeDraggable);
  }, [makeDraggable]);

  // Handle Use default location button
  const handleUseDefaultLocation = () => {
    if (!mapRef.current) return;
    setPositions({ lat: DEFAULT_CENTER[1], lng: DEFAULT_CENTER[0] });
    setMakeDraggable(false);
    mapRef.current.flyTo({
      center: [DEFAULT_CENTER[0], DEFAULT_CENTER[1]],
      zoom: 15,
      speed: 1.2,
      curve: 1.42,
      essential: true,
    });
  };

  // Handle Update location button
  const handleUpdateLocation = () => {
    setMakeDraggable(true);
  };

  const handleMarkerClick = (outage: Outage) => {
    setActiveMarker(outage);
  };

  useEffect(() => {
    const getAllOutages = async () => {
      const response = await api.getAllOutages(limit!, offset!, status);
      setOutages(response.outages);
    };
    getAllOutages();
  }, [limit, offset, status]);

  // handle new or updated outage
  const handleOutage = useCallback((outage: Outage) => {
    setOutages((prev) => {
      const exists = prev.some((o) => o.id === outage.id);
      if (exists) {
        setActiveMarker(outage);
        return prev.map((o) => (o.id === outage.id ? outage : o));
      }
      return [...prev, outage];
    });
  }, []);

  // handle outage status change
  const handleStatusChange = useCallback(
    (data: { outage: Outage }) => {
      console.log("Outage status changed event:", data);
      if (data.outage) {
        handleOutage(data.outage);
      }
    },
    [handleOutage],
  );

  // handle outage confirmation
  const handleConfirmation = useCallback(
    (data: { outage: Outage }) => {
      console.log("Confirmation received in LiveMap:", data);
      const { outage } = data;
      setOutages((prev) =>
        prev.map((o) =>
          o.id === outage.id ? { ...o, _count: outage._count } : o,
        ),
      );

      // Also update activeMarker if it's the one being confirmed
      setActiveMarker((prev) => {
        if (prev?.id === outage.id) {
          return { ...prev, _count: outage._count };
        }
        return prev;
      });
    },
    [setActiveMarker],
  );

  useEffect(() => {
    socketService.connect();
    socketService.onNewOutage(handleOutage);
    socketService.onOutageStatusChanged(handleStatusChange);
    socketService.onOutageConfirmed(handleConfirmation);
    return () => {
      socketService.off("outage:new", handleOutage);
      socketService.off("outage:status_change", handleStatusChange);
      socketService.off("outage:confirmed", handleConfirmation);
    };
  }, [handleOutage, handleStatusChange, handleConfirmation]);
  return (
    <>
      <div ref={mapContainerRef} className="relative w-full h-full">
        {/* change location button */}
        <div className="absolute top-0 right-0 z-50">
          <div className="mt-12 mr-2.5">
            {!makeDraggable && (
              <Button
                disabled={makeDraggable || isOutOfBounds}
                onClick={handleUpdateLocation}
                size="icon"
                title="change location"
              >
                <svg
                  viewBox="-4 0 32 32"
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                >
                  <path
                    fill="currentColor"
                    transform="translate(-106, -413)"
                    d="M118,422 C116.343,422 115,423.343 115,425 C115,426.657 116.343,428 118,428 C119.657,428 121,426.657 121,425 C121,423.343 119.657,422 118,422 L118,422 Z M118,430 C115.239,430 113,427.762 113,425 C113,422.238 115.239,420 118,420 C120.761,420 123,422.238 123,425 C123,427.762 120.761,430 118,430 L118,430 Z M118,413 C111.373,413 106,418.373 106,425 C106,430.018 116.005,445.011 118,445 C119.964,445.011 130,429.95 130,425 C130,418.373 124.627,413 118,413 L118,413 Z"
                  />
                </svg>
              </Button>
            )}
            {makeDraggable && (
              <Button
                onClick={() => setMakeDraggable(false)}
                size="icon"
                variant="destructive"
                title="cancle location change"
              >
                <X />
              </Button>
            )}
          </div>
        </div>
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
      </div>
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
      {mapInstance && <Popup activeMarker={activeMarker} map={mapInstance} />}
    </>
  );
};

export default Map;
