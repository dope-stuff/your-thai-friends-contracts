import { z } from "zod";
import { id, timestamps, GeoPoint, MediaRef, Socials } from "../common";
import { PartnerStatus } from "../enums";

/** A "Local Friend" — the host who owns inventory. Vertical-agnostic: one
 *  partner can offer stay + experience + learn listings. */
export const PartnerSchema = z.object({
  id,
  name: z.string().min(1),
  slug: z.string().min(1),
  bio: z.string().optional(),
  /** Short role line, e.g. "Raft-house host, born and raised on the River Kwai". */
  role: z.string().optional(),
  location: z.string().optional(),
  /** Home destination — drives the per-destination "people" section. */
  destinationId: id.optional(),
  geo: GeoPoint.optional(),
  avatar: MediaRef.optional(),
  cover: MediaRef.optional(),
  socials: Socials.optional(),
  /**
   * Marketplace commission, 0..1 (e.g. 0.15) — what YTF takes from this partner.
   *
   * **Private in Strapi — server-side and admin surfaces only.** Read it through
   * the document service, never over the REST content API: naming it in `fields`,
   * `filters`, `sort` or `populate` makes Strapi reject the whole query with
   * `Invalid key commissionRate`. Optional here because it is absent from every
   * non-admin response rather than because it may be unset.
   */
  commissionRate: z.number().min(0).max(1).optional(),
  partnerStatus: PartnerStatus,
  /** The host User who owns this partner record. */
  ownerUserId: id.optional(),
  locale: z.string().optional(),
  ...timestamps,
});
export type Partner = z.infer<typeof PartnerSchema>;
