import z from "zod";

export const createOutageSchema = z.object({
  userId: z.string(),
  locationName: z
    .string()
    .min(4, "Location name must be at least 4 characters")
    .max(100, "Location name must be at most 100 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description must be at most 500 characters"),
  coordinates: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  }),
  affectedHomesEstimated: z.number(),
  whatHappened: z.enum([
    "NO_POWER",
    "PARTIAL_POWER",
    "LOW_VOLTAGE",
    "FLICKERING",
    "HAZARDOUS_SITUATION",
    "OTHER",
  ]),
  severity: z.enum(["MINOR", "MODERATE", "SEVERE"]),
});
