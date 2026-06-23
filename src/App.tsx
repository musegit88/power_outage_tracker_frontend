import { createRouter, RouterProvider } from "@tanstack/react-router";

import { routeTree } from "./routeTree.gen";
import { useAuth } from "./hooks/useAuth";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

// Create a new router instance
const router = createRouter({
  routeTree,
  context: {
    // auth will be passed down from App component
    auth: undefined!,
  },
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function App() {
  const auth = useAuth();

  return (
    <ThemeProvider>
      <TooltipProvider>
        <Toaster position="top-right" richColors closeButton />
        <RouterProvider router={router} context={{ auth }} />
      </TooltipProvider>
    </ThemeProvider>
  );
}

export default App;
