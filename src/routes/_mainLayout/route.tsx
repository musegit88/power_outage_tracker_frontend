import MainLayout from "@/components/mainLayout";
import tokenService from "@/services/tokenService";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_mainLayout")({
  beforeLoad: ({ location }) => {
    if (!tokenService.isAuthenticated()) {
      throw redirect({
        to: "/signin",
        search: {
          // save current location for redirect after login
          redirect: location.href,
        },
      });
    }
  },
  component: MainLayout,
});
