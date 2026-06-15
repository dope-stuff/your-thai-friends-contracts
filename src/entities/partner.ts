import { z } from "zod";
import { id, timestamps, GeoPoint, MediaRef, Socials } from "../common";
import { PartnerStatus } from "../enums";

/** A "Local Friend" — the host who owns inventory. */
export const PartnerSchema = z.object({
  id,
  name: z.string().min(1),
  slug: z.string().min(1),
  bio: z.string().optional(),
  location: z.string().optional(),
  geo: GeoPoint.optional(),
  avatar: MediaRef.optional(),
  cover: MediaRef.optional(),
  socials: Socials.optional(),
  status: PartnerStatus,
  /** The host User who owns this partner record. */
  ownerUserId: id.optional(),
  ...timestamps,
});
export type Partner = z.infer<typeof PartnerSchema>;
