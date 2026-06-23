import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/mode-toggle";

const AppSidebar = () => {
  return (
    <Sidebar>
      <SidebarHeader>
        <h1>Sidebar</h1>
      </SidebarHeader>
      <SidebarContent>
        <div>Sidebar Content</div>
      </SidebarContent>
      <SidebarFooter>
        <ModeToggle />
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
