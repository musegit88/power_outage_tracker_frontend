/* eslint-disable react-hooks/refs */
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Copy, CopyCheck, Lightbulb, LightbulbOff } from "lucide-react";

import api from "@/services/api";
import type { Outage } from "@/types";

import { toast } from "sonner";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field";

const Popup = ({
  activeMarker,
  map,
}: {
  activeMarker: Outage | undefined;
  map: mapboxgl.Map | null;
}) => {
  const { user } = useAuth();
  // a ref to hold the popup instance
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  // a ref for an element to hold the popup's content
  const contenetRef = useRef(document.createElement("div"));
  const [copied, setCopied] = useState(false);

  // instantiate the popup on mount, remove it on unmount
  useEffect(() => {
    if (!map) return;
    // create a new popup instance, but do not set its location or content yet
    popupRef.current = new mapboxgl.Popup({
      closeOnClick: true,
      closeOnMove: true,
      closeButton: false,
      offset: 12,
    });
    return () => {
      popupRef.current?.remove();
    };
  }, [map]);

  // when activeMarker changes, set the popup's location and content, and add it to the map
  useEffect(() => {
    if (!activeMarker) return;
    popupRef.current
      ?.setLngLat([activeMarker.longitude, activeMarker.latitude])
      .setDOMContent(contenetRef.current)
      .addTo(map!);
  }, [activeMarker, map]);

  const handleConfirm = async (outageId: string) => {
    if (!user?.id) return;
    try {
      const res = await api.addConfirmation(outageId, user.id);
      toast.success(res.message);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handelClipboard = (outageId: string) => {
    navigator.clipboard.writeText(outageId);
    setCopied(true);
    toast.success("Outage ID copied to clipboard");
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const handleStatusChange = async (status: string) => {
    if (!activeMarker) return;
    try {
      const res = await api.updateOutageStatus(activeMarker.id, status);
      toast.success(res.message);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error);
    }
  };
  return (
    <>
      {createPortal(
        <div className="text-black overflow-hidden flex flex-col gap-2 w-full dark:text-white">
          <div className="flex flex-row items-center gap-2">
            <div
              className={cn(
                "flex items-center justify-center w-9 h-9 bg-slate-500/40 rounded-md p-2",
                activeMarker?.status === "RESOLVED" && "bg-green-500/40",
                activeMarker?.status === "ACTIVE" && "bg-red-500/40",
                activeMarker?.status === "INVESTIGATING" && "bg-yellow-500/40",
              )}
            >
              {activeMarker?.status === "RESOLVED" && <Lightbulb />}
              {activeMarker?.status === "ACTIVE" && <LightbulbOff />}
              {activeMarker?.status === "INVESTIGATING" && <LightbulbOff />}
            </div>
            <div className="flex flex-col max-w-full">
              <div className="w-full overflow-x-scroll">
                <h1
                  className={cn(
                    "text-base font-semibold whitespace-nowrap",
                    activeMarker?.status === "RESOLVED" && "text-green-700",
                    activeMarker?.status === "ACTIVE" && "text-red-700",
                    activeMarker?.status === "INVESTIGATING" &&
                      "text-yellow-700",
                  )}
                >
                  {activeMarker?.locationName}
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 whitespace-nowrap overflow-x-scroll no-scrollbar">
                  {activeMarker?.createdAt &&
                    new Date(activeMarker.createdAt).toDateString()}
                </span>
                <p
                  className={cn(
                    "capitalize px-2 py-0.5 rounded-md text-xs",
                    activeMarker?.status === "RESOLVED" &&
                      "text-green-700 bg-green-500/20",
                    activeMarker?.status === "ACTIVE" &&
                      "text-red-700 bg-red-500/20",
                    activeMarker?.status === "INVESTIGATING" &&
                      "text-yellow-900 bg-yellow-500/20",
                  )}
                >
                  {activeMarker?.status.toLowerCase()}
                </p>
              </div>
              <p className="text-sm text-gray-500">
                by <strong>{activeMarker?.user?.name}</strong>
              </p>
            </div>
          </div>
          <div className="max-w-fit max-h-12 overflow-y-scroll no-scrollbar mb-2">
            <p className="text-sm text-gray-500 wrap-break-word">
              {activeMarker?.description}
            </p>
          </div>

          {user?.role === "ADMIN" || user?.role === "SUPER_ADMIN" ? (
            <div className="flex items-center gap-2">
              {copied ? (
                <CopyCheck className="text-green-500" />
              ) : (
                <Copy
                  onClick={() =>
                    activeMarker?.id && handelClipboard(activeMarker.id)
                  }
                  className="cursor-pointer text-primary"
                />
              )}
              <p>
                {user?.role === "ADMIN" || user?.role === "SUPER_ADMIN"
                  ? activeMarker?.id
                  : ""}
              </p>
            </div>
          ) : (
            <></>
          )}
          {user?.id === activeMarker?.userId ||
          user?.role === "ADMIN" ||
          (user?.role === "SUPER_ADMIN" &&
            activeMarker?.status !== "RESOLVED") ? (
            <Field>
              <FieldContent>
                <FieldLabel>Status</FieldLabel>
                <FieldDescription>
                  Update the status of the outage
                </FieldDescription>
              </FieldContent>

              <Select
                key={activeMarker?.id}
                defaultValue={activeMarker?.status}
                onValueChange={(value) => handleStatusChange(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="dark:bg-slate-900">
                  <SelectItem
                    className="hover:dark:bg-slate-800 w-full"
                    value="ACTIVE"
                  >
                    Active
                  </SelectItem>
                  <SelectItem
                    className="hover:dark:bg-slate-800 w-full"
                    value="INVESTIGATING"
                  >
                    Investigating
                  </SelectItem>
                  <SelectItem
                    className="hover:dark:bg-slate-800 w-full"
                    value="RESOLVED"
                  >
                    Resolved
                  </SelectItem>
                </SelectContent>
              </Select>
            </Field>
          ) : (
            <></>
          )}
          <div>
            <p className="text-sm text-gray-500">
              {activeMarker?._count?.confirmations ?? 0} confirmation
              {activeMarker?._count?.confirmations !== 0 &&
                activeMarker?._count?.confirmations !== 1 &&
                "s"}
            </p>
          </div>
          {user?.id !== activeMarker?.userId && (
            <>
              {activeMarker?.status !== "RESOLVED" && (
                <Button
                  onClick={() =>
                    activeMarker?.id && handleConfirm(activeMarker.id)
                  }
                  className="rounded-md text-sm font-semibold bg-linear-to-r from-amber-400 via-orange-500 to-red-600"
                  size="sm"
                >
                  Confirm Outage
                </Button>
              )}
            </>
          )}
        </div>,
        contenetRef.current,
      )}
    </>
  );
};

export default Popup;
