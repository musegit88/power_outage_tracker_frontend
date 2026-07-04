import { Link } from "@tanstack/react-router";

const Logo = () => {
  return (
    <Link to="/live-map" className="flex items-center gap-2">
      <img src="/powerwatch_logo.svg" alt="logo" className="w-6 h-6" />
      <span className="text-xl font-bold bg-linear-to-r from-amber-400 via-orange-500 to-red-600 bg-clip-text text-transparent">
        PowerWatch
      </span>
    </Link>
  );
};

export default Logo;
