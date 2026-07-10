import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

import { cn } from "@/lib/utils";
import type { Outage } from "@/types";
import MarkerIcon from "./icons/marker-icon";

const Marker = ({
  data,
  map,
  isActive,
  onClick,
}: {
  data: Outage;
  map: mapboxgl.Map;
  isActive: boolean;
  onClick: (outage: Outage) => void;
}) => {
  const [markerNode] = useState(() => document.createElement("div"));

  useEffect(() => {
    if (!map) return;

    const marker = new mapboxgl.Marker({
      element: markerNode,
    })
      .setLngLat([Number(data.longitude), Number(data.latitude)])
      .addTo(map);

    marker.getElement().addEventListener("click", () => {
      // Propagation handled in React onClick
    });

    return () => {
      marker.remove();
    };
  }, [data.latitude, data.longitude, map, markerNode]);

  return createPortal(
    <div
      onClick={(e) => {
        // stop propagation to prevent the map's click event from firing
        e.stopPropagation();
        onClick(data);
      }}
    >
      <MarkerIcon
        className={cn(
          "relative cursor-pointer",
          data.status === "ACTIVE"
            ? "fill-red-500"
            : data.status === "RESOLVED"
              ? "fill-green-500"
              : "fill-yellow-500",
          isActive && data.status === "RESOLVED" && "fill-green-500",
          isActive && data.status === "ACTIVE" && "fill-red-500",
          isActive && data.status === "INVESTIGATING" && "fill-yellow-500",
        )}
      />
      <div
        className={cn(
          isActive &&
            "absolute bg-red-500/20 w-8 h-8 rounded-full -top-1 -left-1 -z-10 animate-ping animation-duration-1500",
          data.status === "RESOLVED" && "bg-green-500/20",
          data.status === "ACTIVE" && "bg-red-500/20",
          data.status === "INVESTIGATING" && "bg-yellow-500/20",
        )}
      ></div>
    </div>,
    markerNode,
  );
};

export default Marker;
