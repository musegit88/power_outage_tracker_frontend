import Report from "@/components/report";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_mainLayout/report")({
  component: Report,
});
