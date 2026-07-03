import { useEffect, useRef, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import { Info, ListFilter, Zap } from "lucide-react";

import { cn } from "@/lib/utils";
import { filters } from "@/lib/constants";
import { useMapLoadingState } from "@/hooks/useMapLoadingState";
import { useUserLocation } from "@/hooks/useUserLocation";
import { useRealTimeOutages } from "@/hooks/useRealTimeOutage";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/mode-toggle";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

const MarqueeStatItem = ({ children }: { children: React.ReactNode }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    const inner = innerRef.current;
    if (!container || !inner) return;

    const check = () => {
      setIsOverflowing(inner.scrollWidth > container.clientWidth);
    };

    check();
    const observer = new ResizeObserver(check);
    observer.observe(container);
    observer.observe(inner);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="h-9 px-3 inline-flex shrink-0 items-center justify-center rounded-md border bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none border-border w-full overflow-hidden"
    >
      <div
        ref={innerRef}
        className={cn(
          "flex gap-8 whitespace-nowrap px-4",
          isOverflowing ? "animate-marquee" : "",
        )}
      >
        {children}
      </div>
    </div>
  );
};

const AppSidebar = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate({ from: "/live-map" });
  const search = useSearch({ strict: false });

  const { open } = useSidebar();
  const { isMapLoading } = useMapLoadingState();

  const { positions } = useUserLocation();
  const { connectionStatus, stats } = useRealTimeOutages({
    userLocation: positions
      ? { lat: positions.lat, lng: positions.lng }
      : undefined,
    enabled: !!positions,
  });

  // a function to update the filter part of the url
  const handleClick = (filter: "ACTIVE" | "INVESTIGATING" | "RESOLVED") => {
    navigate({ search: (prev) => ({ ...prev, status: filter }) });
  };

  return (
    <Sidebar>
      <SidebarHeader className="dark:bg-slate-900 p-4">
        {open && (
          <div className="flex items-center mt-1">
            <Link to="/live-map" className="flex items-center gap-2">
              {/* <Zap /> */}
              <img src="/pwa-192x192.png" alt="logo" className="w-8 h-8" />
              <span className="text-xl font-bold bg-linear-to-r from-amber-400 via-orange-500 to-red-600 bg-clip-text text-transparent">
                PowerSignal
              </span>
            </Link>
          </div>
        )}
      </SidebarHeader>
      <SidebarContent className="dark:bg-slate-900">
        {pathname === "/live-map" && (
          <SidebarGroup>
            <div className="flex justify-center items-center gap-2 w-full mb-2">
              <ListFilter className="text-muted-foreground" />
              <h1 className="text-md text-center text-muted-foreground font-semibold">
                Filters
              </h1>
            </div>
            <div className="flex flex-col gap-2">
              <Button
                disabled={isMapLoading}
                onClick={() =>
                  navigate({ search: (prev) => ({ ...prev, status: "ALL" }) })
                }
                className={cn(
                  "rounded-md",
                  "hover:border-blue-500 dark:hover:border-blue-500",
                  "text-blue-500",
                  search.status === "ALL" &&
                    "border-blue-500 dark:border-blue-500",
                )}
                variant="outline"
              >
                All
              </Button>
              {filters.map((filter) => (
                <Button
                  disabled={isMapLoading}
                  key={filter.id}
                  onClick={() =>
                    handleClick(
                      filter.value as "ACTIVE" | "INVESTIGATING" | "RESOLVED",
                    )
                  }
                  className={cn(
                    "rounded-md",
                    filter.title === "Active"
                      ? "hover:border-red-500 dark:hover:border-red-500"
                      : filter.title === "Investigating"
                        ? "hover:border-yellow-500 dark:hover:border-yellow-500"
                        : "hover:border-green-500 dark:hover:border-green-500",
                    filter.title === "Active"
                      ? "text-red-500"
                      : filter.title === "Investigating"
                        ? "text-yellow-500"
                        : "text-green-500",
                    search.status === "ACTIVE" &&
                      filter.value === "ACTIVE" &&
                      "border-red-500 dark:border-red-500",
                    search.status === "INVESTIGATING" &&
                      filter.value === "INVESTIGATING" &&
                      "border-yellow-500 dark:border-yellow-500",
                    search.status === "RESOLVED" &&
                      filter.value === "RESOLVED" &&
                      "border-green-500 dark:border-green-500",
                  )}
                  variant="outline"
                >
                  {filter.title}
                </Button>
              ))}
            </div>
          </SidebarGroup>
        )}
        <SidebarGroup>
          <div className="flex justify-center items-center gap-2 w-full mb-2">
            <Info className="text-muted-foreground" />
            <h1 className="text-md text-center text-muted-foreground font-semibold">
              Stats
            </h1>
          </div>
          <div className="flex flex-col gap-2">
            {stats?.activeOutages !== 0 && (
              <MarqueeStatItem>
                <span>{stats?.activeOutages} Active outages</span>
              </MarqueeStatItem>
            )}
            {stats?.resolvedToday !== 0 && (
              <MarqueeStatItem>
                <span>
                  {stats?.resolvedToday}{" "}
                  {stats?.resolvedToday && stats.resolvedToday > 1
                    ? "Resolved outages today"
                    : "Resolved outage today"}
                </span>
              </MarqueeStatItem>
            )}
          </div>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="dark:bg-slate-900">
        {stats?.onlineUsers && (
          <div className="h-9 px-3 inline-flex shrink-0 items-center justify-center rounded-md border bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none border-border w-full">
            <p>
              {stats?.onlineUsers}{" "}
              {stats?.onlineUsers && stats.onlineUsers > 1
                ? "users online"
                : "user online"}
            </p>
          </div>
        )}
        <div
          className={cn(
            "h-9 px-3 inline-flex gap-1.5 shrink-0 items-center justify-center rounded-md border bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none border-border w-full",
            connectionStatus
              ? "text-green-500 border-green-500"
              : "text-red-500 border-red-500",
          )}
        >
          <span
            className={cn(
              "w-2 h-2 rounded-full",
              connectionStatus ? "bg-green-500" : "bg-red-500",
            )}
          />
          <p>
            {connectionStatus
              ? "Connected to live updates"
              : "Disconnected from live updates"}
          </p>
        </div>
        <Separator className="mt-2 mb-2" />
        <ModeToggle />
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
