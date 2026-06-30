import {
  useEffect,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { LocationContext } from "@/contexts/locationContext";

// Device detection
export type DeviceOS = "ios" | "android" | "desktop";

const getDeviceOS = (): DeviceOS => {
  const ua = navigator.userAgent;
  // pointer:coarse is the most reliable signal for touch screens
  const isTouch = window.matchMedia("(pointer: coarse)").matches;
  if (!isTouch) return "desktop";
  if (/iphone|ipad|ipod/i.test(ua)) return "ios";
  return "android";
};

// The supported service area bounding box (matches map.tsx maxBounds)
const BOUNDS = {
  swLng: 38.59823780218804,
  swLat: 8.797975532836418,
  neLng: 38.935590926262506,
  neLat: 9.089991658552165,
};

// check if the position is within the bounds
const isWithinBounds = (lat: number, lng: number) =>
  lng >= BOUNDS.swLng &&
  lng <= BOUNDS.neLng &&
  lat >= BOUNDS.swLat &&
  lat <= BOUNDS.neLat;

// ── localStorage helpers ──────────────────────────────────────────────────────
const LOCATION_KEY = "user_location";
const STALE_THRESHOLD_MS = 24 * 60 * 60 * 1000; // 24 hours

interface CachedLocation {
  lat: number;
  lng: number;
  timestamp: number;
}

const readCache = (): CachedLocation | null => {
  try {
    const raw = localStorage.getItem(LOCATION_KEY);
    if (!raw) return null;
    const parsed: CachedLocation = JSON.parse(raw);
    const isStale = Date.now() - parsed.timestamp > STALE_THRESHOLD_MS;
    return isStale ? null : parsed;
  } catch {
    return null;
  }
};

const writeCache = (lat: number, lng: number) => {
  try {
    const entry: CachedLocation = { lat, lng, timestamp: Date.now() };
    localStorage.setItem(LOCATION_KEY, JSON.stringify(entry));
  } catch {
    // localStorage unavailable (private browsing quota, etc.) — fail silently
  }
};

const clearCache = () => {
  try {
    localStorage.removeItem(LOCATION_KEY);
  } catch {
    // fail silently
  }
};
// ─────────────────────────────────────────────────────────────────────────────

export const LocationProvider = ({ children }: { children: ReactNode }) => {
  const deviceOS = useMemo(() => getDeviceOS(), []);
  const [positions, setPositions] = useState<{
    lat: number;
    lng: number;
  } | null>(() => {
    // Initialise from cache for an instant first paint — no GPS wait
    const cached = readCache();
    return cached ? { lat: cached.lat, lng: cached.lng } : null;
  });
  const [permissionState, setPermissionState] = useState<
    "granted" | "denied" | "prompt"
  >("prompt");
  const [isOutOfBounds, setIsOutOfBounds] = useState(() => {
    // Compute out-of-bounds from the cache so the warning shows immediately
    const cached = readCache();
    return cached ? !isWithinBounds(cached.lat, cached.lng) : false;
  });

  // fetch position
  const fetchPosition = useCallback(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setPositions({ lat, lng });
        setPermissionState("granted");
        setIsOutOfBounds(!isWithinBounds(lat, lng));
        // Persist fresh fix — overwrites stale or out-of-bounds cached value
        writeCache(lat, lng);
      },
      (error) => {
        console.error("Geolocation error:", error.message);
        if (error.code === error.PERMISSION_DENIED) {
          setPermissionState("denied");
        }
      },
    );
  }, []);

  // Wrap setPositions so callers (e.g. "Use Default Location") clear the cache
  const setPositionsAndClearCache = useCallback(
    (pos: { lat: number; lng: number } | null) => {
      clearCache();
      if (pos) {
        writeCache(pos.lat, pos.lng);
      }
      setPositions(pos);
      setIsOutOfBounds(false);
    },
    [],
  );

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
        // Always fetch fresh GPS — cache is only for the initial paint
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
    isOutOfBounds,
    deviceOS,
    setIsOutOfBounds,
    setPositions: setPositionsAndClearCache,
    setPermissionState,
    fetchPosition,
  };
  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};
