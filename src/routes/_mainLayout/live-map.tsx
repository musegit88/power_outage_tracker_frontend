import LiveMap from "@/components/liveMap";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_mainLayout/live-map")({
  component: LiveMap,
});
