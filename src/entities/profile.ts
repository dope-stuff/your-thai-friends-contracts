import { z } from "zod";
import { id, timestamps, MediaRef } from "../common";

/**
 * App-specific user data, kept OUT of the auth (users-permissions) user table.
 * Linked one-way (profile → user) so the user content type is never modified.
 */
export const ProfileSchema = z.object({
  id,
  /** FK to the users-permissions user. */
  userId: id,
  displayName: z.string().optional(),
  phone: z.string().optional(),
  avatar: MediaRef.optional(),
  /** Preferred UI locale, e.g. "en" / "th". */
  preferredLocale: z.string().optional(),
  marketingOptIn: z.boolean().default(false),
  ...timestamps,
});
export type Profile = z.infer<typeof ProfileSchema>;
