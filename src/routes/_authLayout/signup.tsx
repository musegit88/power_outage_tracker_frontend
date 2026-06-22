import Signup from "@/components/signup";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authLayout/signup")({
  component: Signup,
});
