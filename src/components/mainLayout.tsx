import { Outlet } from "@tanstack/react-router";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/app-sidebar";
import Navbar from "@/components/navbar";
import { LocationProvider } from "@/providers/locationProvider";
import { MapLoadingStateProvider } from "@/providers/mapLoadingStateProvider";

const MainLayout = () => {
  return (
    <div className="h-screen">
      <LocationProvider>
        <MapLoadingStateProvider>
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
              <Navbar />
              <main className="w-full h-full">
                <Outlet />
              </main>
            </SidebarInset>
          </SidebarProvider>
        </MapLoadingStateProvider>
      </LocationProvider>
    </div>
  );
};

export default MainLayout;
