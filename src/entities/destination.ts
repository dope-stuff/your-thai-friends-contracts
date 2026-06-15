import { z } from "zod";
import { id, timestamps, GeoPoint, MediaRef } from "../common";

export const DestinationSchema = z.object({
  id,
  name: z.string().min(1),
  slug: z.string().min(1),
  region: z.string().optional(),
  geo: GeoPoint.optional(),
  description: z.string().optional(),
  hero: MediaRef.optional(),
  ...timestamps,
});
export type Destination = z.infer<typeof DestinationSchema>;
