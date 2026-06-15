import { z } from "zod";
import { id, timestamps } from "../common";

/** Footer newsletter signup — synced to a Brevo contact list. */
export const NewsletterSubSchema = z.object({
  id: id.optional(),
  email: z.string().email(),
  source: z.string().optional(),
  ...timestamps,
});
export type NewsletterSub = z.infer<typeof NewsletterSubSchema>;
