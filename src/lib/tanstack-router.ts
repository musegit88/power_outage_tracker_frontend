import { routeTree } from "@/routeTree.gen";
import { createRouter } from "@tanstack/react-router";

// Create a new router instance
export const router = createRouter({
  routeTree,
  context: {
    // auth will be passed down from App component
    auth: undefined!,
  },
});
