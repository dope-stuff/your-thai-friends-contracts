import { z } from "zod";
import { id, timestamps } from "../common";
import { Role } from "../enums";

export const UserSchema = z.object({
  id,
  email: z.string().email(),
  name: z.string().min(1),
  role: Role,
  avatarUrl: z.string().url().optional(),
  /** Set for `host` users — links them to the partner they manage. */
  partnerId: id.optional(),
  ...timestamps,
});
export type User = z.infer<typeof UserSchema>;
