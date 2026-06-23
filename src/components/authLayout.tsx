import { Home } from "lucide-react";
import { Link, Outlet } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";

const AuthLayout = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="relative flex items-center justify-center w-full h-screen">
      <Link
        to={isAuthenticated ? "/live-map" : "/"}
        className="absolute top-5 left-5 bg-muted/50 border rounded-full p-2 hover:bg-muted/80 hover:shadow-lg transition-all"
      >
        <Home />
      </Link>
      <Outlet />
    </div>
  );
};

export default AuthLayout;
