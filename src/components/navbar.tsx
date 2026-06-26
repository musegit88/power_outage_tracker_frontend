import { Link, useLocation, useRouter } from "@tanstack/react-router";
import { LogOut, Menu, Zap } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { navLinks } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarBadge, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Navbar = () => {
  const router = useRouter();
  const location = useLocation();

  const { logout, user } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.navigate({ to: "/signin", search: { redirect: location.pathname } });
  };
  return (
    <nav className="w-full top-0 z-50 bg-white/80 dark:bg-slate-900/95 backdrop-blur-sm p-4 border-b">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-2" />
          <div className="flex items-center">
            <Link to="/live-map" className="flex items-center gap-2">
              <Zap />
              <span className="text-xl font-bold bg-linear-to-r from-amber-400 via-orange-500 to-red-600 bg-clip-text text-transparent">
                PowerSignal
              </span>
            </Link>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-4">
          {navLinks.map((navLink) => (
            <Link
              key={navLink.id}
              to={navLink.pathname}
              className={cn(
                "text-md transition-all duration-300",
                location.pathname === navLink.pathname && "text-orange-500",
              )}
            >
              {navLink.title}
            </Link>
          ))}
          <Button variant="outline" size="icon" onClick={handleLogout}>
            <LogOut />
            <span className="sr-only">Logout</span>
          </Button>
          <Avatar className="overflow-visible" title={user?.name}>
            <AvatarFallback>
              {user?.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
            <AvatarBadge
              className={cn(
                user?.role === "ADMIN" && "bg-yellow-500",
                user?.role === "SUPER_ADMIN" && "bg-green-500",
              )}
            />
          </Avatar>
        </div>

        {/* Mobile navbar */}
        <div className="sm:hidden flex flex-row-reverse items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="flex flex-col gap-4 p-4 mt-10 h-full">
                {navLinks.map((navLink) => (
                  <Link
                    key={navLink.id}
                    to={navLink.pathname}
                    className={cn(
                      "text-2xl font-semibold",
                      location.pathname === navLink.pathname &&
                        "text-orange-500",
                    )}
                  >
                    {navLink.title}
                  </Link>
                ))}
                <div className=" flex flex-col justify-end h-full">
                  <Button
                    variant="outline"
                    size="icon"
                    className="flex gap-2 rounded-md w-full"
                    onClick={handleLogout}
                  >
                    <LogOut />
                    <span>Logout</span>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <Avatar className="overflow-visible" title={user?.name}>
            <AvatarFallback>
              {user?.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
            <AvatarBadge
              className={cn(
                user?.role === "ADMIN" && "bg-yellow-500",
                user?.role === "SUPER_ADMIN" && "bg-green-500",
              )}
            />
          </Avatar>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
