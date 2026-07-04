import { Link, useRouter, useLocation } from "@tanstack/react-router";
import { LogOut, Map, Menu, Users, Zap } from "lucide-react";

import { faq, features, landingNavLinks, steps } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "./theme-provider";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Logo from "@/components/logo";

const Landing = () => {
  const router = useRouter();
  const location = useLocation();
  const { theme } = useTheme();
  const { isAuthenticated, logout } = useAuth();
  const year = new Date().getFullYear();
  const handleLogout = () => {
    logout();
    router.navigate({ to: "/signin", search: { redirect: location.pathname } });
  };
  return (
    <div className="min-h-screen dark:bg-slate-900">
      {/* Navigation */}
      <nav className="fixed w-full dark:bg-slate-900/95 border-b backdrop-blur-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Logo />
            <div className="hidden md:flex items-center gap-8">
              <Link
                hash="features"
                to="/"
                className={cn(
                  location.hash === "features" &&
                    "text-orange-500 font-semibold",
                )}
              >
                Features
              </Link>
              <Link
                hash="how-it-works"
                to="/"
                className={cn(
                  location.hash === "how-it-works" &&
                    "text-orange-500 font-semibold",
                )}
              >
                How it works
              </Link>
              <Link
                hash="faq"
                to="/"
                className={cn(
                  location.hash === "faq" && "text-orange-500 font-semibold",
                )}
              >
                FAQ
              </Link>
              <div>
                {isAuthenticated ? (
                  <div className="flex items-center gap-4">
                    <Button asChild variant="outline" className="rounded-md">
                      <Link to="/live-map">Live Map</Link>
                    </Button>
                    <Button
                      title="logout"
                      variant="outline"
                      size="icon"
                      className="rounded-md"
                      onClick={handleLogout}
                    >
                      <LogOut />
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-4">
                    <Button asChild variant="outline" className="rounded-md">
                      <Link search={{ redirect: "/signin" }} to="/signin">
                        Sign In
                      </Link>
                    </Button>
                    <Button asChild className="rounded-md">
                      <Link search={{ redirect: "/signup" }} to="/signup">
                        Get Started
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
            <Sheet>
              <SheetTrigger asChild>
                <Button className="sm:hidden rounded-md" variant="outline">
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent className="dark:bg-slate-900">
                <div className="flex flex-col gap-4 p-4 mt-10">
                  {landingNavLinks.map((navLink) => (
                    <Link
                      key={navLink.id}
                      to="/"
                      hash={navLink.hash}
                      className={cn(
                        "text-2xl",
                        location.hash === navLink.hash &&
                          "text-orange-500 font-semibold",
                      )}
                    >
                      {navLink.title}
                    </Link>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 px-4 bg-accent dark:bg-slate-800/40">
        <div className="max-w-7xl mx-auto py-2">
          <div className="grid md:grid-cols-2 items-center gap-12">
            <div>
              <h1 className="text-4xl md:text-5xl font-semibold leading-tight">
                Track Power Outages in{" "}
                <span className="bg-linear-to-r from-amber-400 via-orange-500 to-red-600 bg-clip-text text-transparent">
                  Real Time
                </span>
              </h1>
              <p className="text-lg text-muted-foreground mt-4">
                Community-powered outage reporting. Stay informed, report
                incidents, and get updates on power restoration in your area.
              </p>
              <div className="flex flex-col sm:flex-row justify-end gap-4 mt-8">
                {!isAuthenticated ? (
                  <Button asChild className="rounded-md">
                    <Link search={{ redirect: "/signup" }} to="/signup">
                      Get Started
                    </Link>
                  </Button>
                ) : (
                  <Button asChild className="rounded-md">
                    <Link to="/report">Report Outage</Link>
                  </Button>
                )}
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="rounded-md"
                >
                  <Link to="/live-map">
                    View Live Map <Map size={8} />
                  </Link>
                </Button>
              </div>
            </div>
            <>
              <div className="relative">
                <div className="dark:bg-slate-800 border dark:border-slate-700 rounded-2xl p-6 shadow-2xl">
                  <div className="bg-accent dark:bg-slate-900 rounded-lg h-96 relative overflow-hidden">
                    {/* Map Grid Background */}
                    <div className="absolute inset-0 opacity-20 dark:opacity-50 z-10">
                      <div className="grid grid-cols-8 grid-rows-6 h-full w-full">
                        {Array.from({ length: 48 }).map((_, i) => (
                          <div
                            key={i}
                            className="border border-slate-600"
                          ></div>
                        ))}
                      </div>
                    </div>
                    {theme === "dark" && (
                      <img
                        className="absolute inset-0 w-full h-full object-cover"
                        src="/map-demo-dark.png"
                        alt="map-demo"
                      />
                    )}
                    {theme === "light" && (
                      <img
                        className="absolute inset-0 w-full h-full object-cover"
                        src="/map-demo-light.png"
                        alt="map-demo"
                      />
                    )}
                    {/* Map Markers */}
                    <div className="absolute top-1/4 left-1/3 animate-pulse">
                      <div className="bg-red-500 w-4 h-4 rounded-full"></div>
                      <div className="bg-red-500/20 w-8 h-8 rounded-full absolute -top-2 -left-2 animate-ping"></div>
                    </div>
                    <div
                      className="absolute top-1/2 right-1/3 animate-pulse"
                      style={{ animationDelay: "0.5s" }}
                    >
                      <div className="bg-red-500 w-4 h-4 rounded-full"></div>
                      <div className="bg-red-500/20 w-8 h-8 rounded-full absolute -top-2 -left-2 animate-ping"></div>
                    </div>
                    <div
                      className="absolute bottom-1/4 left-1/2 animate-pulse"
                      style={{ animationDelay: "1s" }}
                    >
                      <div className="bg-orange-500 w-4 h-4 rounded-full"></div>
                      <div className="bg-orange-500/20 w-8 h-8 rounded-full absolute -top-2 -left-2 animate-ping"></div>
                    </div>

                    {/* Overlay Card */}
                    <div className="absolute bottom-4 right-4 dark:bg-slate-800/95 bg-accent/95 backdrop-blur-sm border dark:border-slate-700 border-slate-200 rounded-lg p-4 max-sm:left-1 sm:max-w-[50%] z-20">
                      <div className="flex items-start gap-3">
                        <div className="bg-red-500 p-2 rounded-lg">
                          <Zap className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold mb-1">
                            Downtown Area
                          </div>
                          <div className="text-sm text-slate-400">
                            Power outage affecting 200+ homes
                          </div>
                          <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                            <Users className="w-3 h-3" />
                            <span>24 confirmations</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          </div>
        </div>
      </section>
      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold">
              Why Choose{" "}
              <span className="bg-linear-to-r from-amber-400 via-orange-500 to-red-600 bg-clip-text text-transparent">
                PowerWatch
              </span>
            </h2>
            <p className="text-lg text-muted-foreground mt-2">
              Everything you need to stay informed during power interruptions
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.id}
                className="dark:bg-slate-800 backdrop-filter backdrop-blur-sm border dark:border-slate-700 rounded-xl p-8 hover:border-yellow-500/50 transition-all shadow-sm"
              >
                <div className="bg-yellow-500/10 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                  <feature.icon className={cn("w-7 h-7", feature.iconColor)} />
                </div>
                <h3
                  className={cn("text-2xl font-bold mb-4", feature.iconColor)}
                >
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section
        id="how-it-works"
        className="py-20 px-4 bg-accent dark:bg-slate-800/40"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-slate-400">
              Get started in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div key={step.id} className="relative">
                <div className="dark:bg-slate-800 border dark:border-slate-700 rounded-xl p-8 text-center shadow-sm">
                  <div className="bg-orange-500 w-16 h-16 rounded-tl-md rounded-br-md flex items-center justify-center text-slate-900 text-2xl font-bold mx-auto mb-6">
                    {step.id}
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                  <p className="text-slate-400">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-slate-400">
              Everything you need to know about PowerWatch
            </p>
          </div>
          <Accordion type="single" collapsible className="max-w-lg mx-auto">
            {faq.map((item) => (
              <AccordionItem key={item.value} value={item.value}>
                <AccordionTrigger className="text-lg sm:text-xl">
                  {item.trigger}
                </AccordionTrigger>
                <AccordionContent className="text-sm sm:text-lg">
                  {item.content}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
      <footer className="w-full dark:bg-slate-900/95 border-t backdrop-blur-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-center sm:flex-row items-center sm:justify-between h-16">
            <div className="flex items-center gap-2 ">
              <div className="text-sm text-slate-400">&copy; {year}</div>
              <Link to="/" className="flex items-center gap-2 ">
                <span className="text-sm font-bold bg-linear-to-r from-amber-400 via-orange-500 to-red-600 bg-clip-text text-transparent">
                  PowerWatch
                </span>
              </Link>
            </div>
            <div className="flex items-center">
              <div className="flex gap-4 max-sm:text-sm">
                <Link to="/">Privacy Policy</Link>
                <Link to="/">Terms of Service</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
