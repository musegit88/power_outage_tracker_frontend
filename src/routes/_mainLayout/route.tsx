import MainLayout from "@/components/mainLayout";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_mainLayout")({
  component: MainLayout,
});
