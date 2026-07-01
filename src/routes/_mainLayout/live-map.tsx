import z from "zod";

import LiveMap from "@/components/liveMap";
import { createFileRoute } from "@tanstack/react-router";

const liveMapSearchSchema = z.object({
  limit: z.number().optional().default(50),
  offset: z.number().optional().default(0),
  status: z
    .enum(["ALL", "ACTIVE", "RESOLVED", "INVESTIGATING"])
    .optional()
    .default("ALL"),
});

export const Route = createFileRoute("/_mainLayout/live-map")({
  validateSearch: liveMapSearchSchema,
  component: LiveMap,
});
