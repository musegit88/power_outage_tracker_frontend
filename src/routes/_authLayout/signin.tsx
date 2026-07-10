import { createFileRoute } from "@tanstack/react-router";
import Signin from "@/components/signin";

export const Route = createFileRoute("/_authLayout/signin")({
  validateSearch: (search: Record<string, unknown>) => ({
    // optional search params if provided redirect to that page
    redirect: search.redirect
      ? (search.redirect as string) === "/signin"
        ? "/"
        : (search.redirect as string) === "/signup"
          ? "/"
          : (search.redirect as string)
      : undefined,
  }),
  component: Signin,
});
