import { createRootRoute } from "@tanstack/react-router";
import RootLayout from "@/components/rootComponent";

export const Route = createRootRoute({
  component: RootLayout,
  errorComponent: () => <div>500 Internal Server Error</div>,
  notFoundComponent: () => <div>404 Not Found</div>,
});
