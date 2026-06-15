import { z } from "zod";

/** Strapi v5 documentId / generic entity id. */
export const id = z.string().min(1);
export type Id = z.infer<typeof id>;

/** Spread into entity schemas for createdAt/updatedAt. */
export const timestamps = {
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
};

/** Lat/lng, mirrors a PostGIS point. */
export const GeoPoint = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});
export type GeoPoint = z.infer<typeof GeoPoint>;

/** Slim reference to an uploaded asset (R2-backed via Strapi upload). */
export const MediaRef = z.object({
  id: id.optional(),
  url: z.string().url(),
  alt: z.string().optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
});
export type MediaRef = z.infer<typeof MediaRef>;

/** Social / contact links. WhatsApp is a `wa.me` deep link for now. */
export const Socials = z.object({
  whatsapp: z.string().optional(),
  tiktok: z.string().url().optional(),
  instagram: z.string().url().optional(),
  facebook: z.string().url().optional(),
  youtube: z.string().url().optional(),
  pinterest: z.string().url().optional(),
  website: z.string().url().optional(),
});
export type Socials = z.infer<typeof Socials>;
