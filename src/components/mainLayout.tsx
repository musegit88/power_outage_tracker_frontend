import { Outlet } from "@tanstack/react-router";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/app-sidebar";
import Navbar from "@/components/navbar";
import { LocationProvider } from "@/providers/locationProvider";

const MainLayout = () => {
  return (
    <LocationProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <Navbar />
          <main>
            <Outlet />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </LocationProvider>
  );
};

export default MainLayout;
