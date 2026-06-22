import AuthLayout from "@/components/authLayout";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authLayout")({
  component: AuthLayout,
});
