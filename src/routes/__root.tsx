import { createRootRouteWithContext } from "@tanstack/react-router";
import type { User } from "@/types";
import RootLayout from "@/components/rootComponent";

interface RouterContext {
  auth: {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (
      name: string,
      email: string,
      phoneNumber: string,
      password: string,
      consents: {
        consentType: string;
        accepted: boolean;
      }[],
    ) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
  };
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
  errorComponent: () => <div>500 Internal Server Error</div>,
  notFoundComponent: () => <div>404 Not Found</div>,
});
