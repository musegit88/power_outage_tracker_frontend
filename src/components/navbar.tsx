import { Link, useLocation } from "@tanstack/react-router";
import { LogOut, Menu, Zap } from "lucide-react";

import { cn } from "@/lib/utils";
import { navLinks } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Navbar = () => {
  const location = useLocation();
  return (
    <nav className="w-full top-0 z-50 backdrop-blur-sm p-4 border-b">
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
          <Button variant="outline" size="icon">
            <LogOut />
          </Button>
          <Avatar>
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </div>

        {/* Mobile navbar */}
        <div className="sm:hidden flex flex-row-reverse items-center gap-2">
          <Sheet>
            <SheetTrigger>
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
                  >
                    <LogOut />
                    <span>Logout</span>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <Avatar>
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
