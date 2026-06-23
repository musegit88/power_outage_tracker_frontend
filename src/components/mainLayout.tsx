import { Outlet } from "@tanstack/react-router";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/app-sidebar";
import Navbar from "@/components/navbar";

const MainLayout = () => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Navbar />
        <div>
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default MainLayout;
