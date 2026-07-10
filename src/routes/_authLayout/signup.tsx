import { createFileRoute } from "@tanstack/react-router";
import Signup from "@/components/signup";

export const Route = createFileRoute("/_authLayout/signup")({
  validateSearch: (search: Record<string, unknown>) => ({
    // optional search params if provided redirect to that page
    redirect: search.redirect
      ? (search.redirect as string) === "/signup"
        ? "/signin"
        : (search.redirect as string)
      : undefined,
  }),
  component: Signup,
});
