import { useEffect, useState } from "react";
import { Outlet } from "@tanstack/react-router";
import { MapPin } from "lucide-react";

import { useUserLocation } from "@/hooks/useUserLocation";
import { LocationProvider } from "@/providers/locationProvider";
import { MapLoadingStateProvider } from "@/providers/mapLoadingStateProvider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/app-sidebar";
import Navbar from "@/components/navbar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const LocationPermissionDialog = () => {
  const userLocation = useUserLocation();
  const { deviceOS } = userLocation;
  const [steps, setSteps] = useState(1);
  const [isPaused, setIsPaused] = useState(false);

  // device-aware copy
  const isMobile = deviceOS === "ios" || deviceOS === "android";

  const promptDescription = isMobile
    ? 'Tap "Allow" when your browser asks for location access.'
    : "Click the 'Allow while visiting the site' button in the browser popup to enable location access.";

  const deniedStep1Description = isMobile
    ? deviceOS === "ios"
      ? 'Open your phone Settings → Privacy & Security → Location Services → Browser → select "While Using".'
      : 'Open your phone Settings → Apps → Browser → Permissions → Location → select "Allow".'
    : "Click the lock icon (\u{1F512}) in the address bar and select Site settings.";

  const deniedStep2Description = isMobile
    ? "Reload this page after changing the setting."
    : 'Select "Allow" from the site permissions dropdown.';

  useEffect(() => {
    // pause the interval for the given seconds when user clicks on next or previous button
    if (isPaused) return;

    // start the interval
    let intervalId: ReturnType<typeof setInterval>;
    if (userLocation.permissionState === "denied") {
      intervalId = setInterval(
        () => setSteps((prev) => (prev === 1 ? 2 : 1)),
        5000,
      );
    }
    return () => clearInterval(intervalId);
  }, [userLocation.permissionState, isPaused]);

  // resume the interval after 5 seconds
  setTimeout(() => {
    setIsPaused(false);
  }, 5000);

  return (
    <>
      {/* show when permission is prompt*/}
      {userLocation.permissionState === "prompt" && (
        <Dialog
          defaultOpen={userLocation.permissionState === "prompt"}
          open={userLocation.permissionState === "prompt"}
        >
          <DialogContent className="dark:bg-slate-800 dark:border-slate-700">
            <DialogTitle className="flex items-center gap-2">
              <MapPin />
              <span>Allow location access</span>
            </DialogTitle>
            <img src="/instruction-prompt.png" alt="instruction" />
            <DialogDescription>{promptDescription}</DialogDescription>
          </DialogContent>
        </Dialog>
      )}
      {/*  show when permission is denied*/}
      {userLocation.permissionState === "denied" && (
        <Dialog
          defaultOpen={userLocation.permissionState === "denied"}
          open={userLocation.permissionState === "denied"}
        >
          <DialogContent className="dark:bg-slate-800 dark:border-slate-700">
            <DialogTitle className="flex items-center gap-2">
              <MapPin />
              <span>Allow location access</span>
            </DialogTitle>
            <div className="overflow-hidden">
              {steps === 1
                ? !isMobile && (
                    <img
                      src="/instruction-1.png"
                      alt="instruction"
                      className="w-full h-full object-contain rounded-md"
                      style={{ animation: "slideInFromLeft 0.5s ease-in-out" }}
                    />
                  )
                : !isMobile && (
                    <img
                      src="/instruction-2.png"
                      alt="instruction"
                      className="w-full h-full object-contain rounded-md "
                      style={{ animation: "slideInFromRight 0.5s ease-in-out" }}
                    />
                  )}
            </div>

            <DialogDescription>
              {steps === 1 ? deniedStep1Description : deniedStep2Description}
            </DialogDescription>
            <DialogFooter className="bg-transparent">
              <Button
                onClick={() => {
                  setIsPaused(true);
                  setSteps((prev) => (prev === 1 ? 2 : 1));
                }}
                className="rounded-md"
              >
                {steps === 1 ? "Next" : "Previous"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

const MainLayout = () => {
  return (
    <div className="h-screen">
      <LocationProvider>
        <MapLoadingStateProvider>
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
              <Navbar />
              <>
                <main className="w-full h-full">
                  <Outlet />
                </main>
                <LocationPermissionDialog />
              </>
            </SidebarInset>
          </SidebarProvider>
        </MapLoadingStateProvider>
      </LocationProvider>
    </div>
  );
};

export default MainLayout;
