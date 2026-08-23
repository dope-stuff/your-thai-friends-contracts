import { z } from "zod";
import { id, timestamps, GeoPoint, MediaRef } from "../common";
import { ListingType, PriceUnit, ListingStatus, Currency } from "../enums";

/* ── Per-type variant detail shapes (stored in listing.details jsonb) ────────
   The discriminant is the parent `listing.type`, so we expose a lookup rather
   than a discriminated union. Validate in the service: detailsSchemaFor(type).

   **These describe what is actually stored and rendered.** They were rewritten
   2026-08-18 after drifting into fiction: the old `StayDetails` had no `rooms`
   at all (the field that drives room selection, per-room pricing and the cart
   line key), `LearnDetails.certification` was a string where every real course
   stores an object, `ExperienceDetails.includes` never existed under that name,
   and `bedrooms` / `beds` / `pickup` / a details-level `checkIn` and `maxGuests`
   appeared in no row anywhere. Nothing imported them, so nothing caught it.

   Two rules for keeping them honest:
   - Every field here must exist in real seeded data. If it is aspirational, it
     does not belong until something writes it.
   - When the generator or a seed starts writing a new key, add it HERE first.
     These are ordinary `z.object()`s, so a `.parse()` **strips** keys they do
     not declare — the schema going stale would silently drop data. They were
     rewritten against every row in a seeded database (69/69 parse clean: 9
     stays, 22 experiences, 34 courses, 4 transfers), and re-running that check
     after a generator change is the cheap way to keep it true.

   They are deliberately NOT `.loose()`. A loose object infers an index
   signature, which makes `d.hostnote` compile as `unknown` instead of failing —
   and the consumers of these types are render components that reach for fields
   by name, where a silent typo is the exact bug worth catching.

   The frontend renders straight off these types — see `stay-detail.tsx`,
   `experience-detail.tsx`, `learn-detail.tsx` and `experience-card.tsx` in the
   web repo, which import them rather than redeclaring their own. */

/** The friend's "perfect if you… / maybe not if…" fit guidance. */
export const ListingFit = z.object({
  perfect: z.string().optional(),
  notFor: z.string().optional(),
});
export type ListingFit = z.infer<typeof ListingFit>;

/** The host's voice on one listing. Identity (name, photo, profile link) comes
 *  from the linked Partner record — `name` / `avatarUrl` are a legacy fallback
 *  for listings whose partner relation was never set. */
export const HostNote = z.object({
  quote: z.string().optional(),
  role: z.string().optional(),
  name: z.string().optional(),
  avatarUrl: z.string().optional(),
});
export type HostNote = z.infer<typeof HostNote>;

/** "You'll love it if… / worth knowing…" — the honest corner. */
export const HonestNotes = z.object({
  love: z.array(z.string()).optional(),
  know: z.array(z.string()).optional(),
});
export type HonestNotes = z.infer<typeof HonestNotes>;

/** Who a listing suits, rendered as green/amber/grey cards. */
export const Persona = z.object({
  fit: z.enum(["great", "maybe", "skip"]),
  emoji: z.string().optional(),
  title: z.string(),
  blurb: z.string().optional(),
});
export type Persona = z.infer<typeof Persona>;

/** Editorial + presentation fields every listing type may carry. */
export const SharedDetails = z.object({
  opinion: z.string().optional(),
  fit: ListingFit.optional(),
  nearby: z.array(z.string()).optional(),
  includesGuide: z.boolean().optional(),

  /** Chips under the title. */
  tags: z.array(z.string()).optional(),
  /** Qualifier beside the price ("per room, per night · from"). */
  priceSub: z.string().optional(),
  /** One-line place description, richer than the `location` column. */
  locationLine: z.string().optional(),
  /** Photo URLs. Their hosts must be in the web repo's `next.config`
   *  `remotePatterns`, or `next/image` answers 400 for every one. */
  gallery: z.array(z.string()).optional(),
  /** YouTube / TikTok URLs played in the gallery lightbox. */
  videos: z.array(z.string()).optional(),
});
export type SharedDetails = z.infer<typeof SharedDetails>;

/** The three blocks that carry a listing's human voice. Every guest-facing type
 *  has them; `transport` does not (a transfer has no host note to give). */
export const EditorialDetails = SharedDetails.extend({
  hostNote: HostNote.optional(),
  honest: HonestNotes.optional(),
  personas: z.array(Persona).optional(),
});
export type EditorialDetails = z.infer<typeof EditorialDetails>;

/** One room type on a stay. */
export const StayRoom = z.object({
  name: z.string(),
  size: z.string().optional(),
  bed: z.string().optional(),
  /** Display string ("2 guests · 2 bedrooms") — never parsed. The enforced
   *  number is `maxGuests`. */
  guests: z.string().optional(),
  /** Cap for THIS room type, where a property's rooms differ: the Kohkorya raft
   *  has a family room for four and twins for two, and one listing-level number
   *  describes neither. Enforced by `BookingBox` and by `capacityFor` in the
   *  backend's booking controller. Falls back to the listing's `maxGuests`. */
  maxGuests: z.number().int().positive().optional(),
  meta: z.array(z.string()).optional(),
  blurb: z.string().optional(),
  /** **Priced rooms are individually bookable** — each gets its own dated "Add
   *  to trip" and a cart line keyed `listing::roomType`. A room with no price
   *  renders as described-but-not-bookable, which is how a room is listed
   *  without being sold. */
  price: z.number().nonnegative().optional(),
  image: z.string().optional(),
});
export type StayRoom = z.infer<typeof StayRoom>;

export const StayDetails = EditorialDetails.extend({
  aboutTitle: z.string().optional(),
  about: z.array(z.string()).optional(),
  rooms: z.array(StayRoom).optional(),
  amenities: z.array(z.string()).optional(),
  booking: z
    .looseObject({
      note: z.string().optional(),
      checkIn: z.string().optional(),
      checkOut: z.string().optional(),
      rooms: z.string().optional(),
    })
    .optional(),
  /** Guests per room for a **repeating** room type (a hotel floor of identical
   *  doubles): the booking box computes `rooms = ceil(guests / roomMax)` and
   *  bills that many. Leave it OFF where a room is a flat price whatever the
   *  occupancy — a whole villa, or the raft family room that sleeps four and is
   *  still one room — or a family of four is charged for two of them. */
  roomMax: z.number().int().positive().optional(),
  /** Minimum nights for a dated booking (e.g. a 2-night-minimum villa). */
  minNights: z.number().int().positive().optional(),
});
export type StayDetails = z.infer<typeof StayDetails>;

/** One stop on an experience's timeline. Named apart from the trip planner's
 *  `ItineraryStop` (`entities/itinerary.ts`), which is a saved trip's stop —
 *  a different concept that happens to share the word. */
export const ExperienceItineraryStop = z.object({
  time: z.string().optional(),
  title: z.string(),
  blurb: z.string().optional(),
});
export type ExperienceItineraryStop = z.infer<typeof ExperienceItineraryStop>;

export const ExperienceDetails = EditorialDetails.extend({
  overviewTitle: z.string().optional(),
  overview: z.array(z.string()).optional(),
  itinerary: z.array(ExperienceItineraryStop).optional(),
  included: z.array(z.string()).optional(),
  notIncluded: z.array(z.string()).optional(),
  bring: z.array(z.string()).optional(),
  leave: z.array(z.string()).optional(),
  booking: z
    .looseObject({
      note: z.string().optional(),
      departs: z.string().optional(),
      groupSize: z.string().optional(),
      /** Hotel pickup is derived by matching this and `included` against
       *  /hotel pick[- ]?up/i — there is no boolean for it. */
      meetingPoint: z.string().optional(),
      duration: z.string().optional(),
    })
    .optional(),

  // Card-only fields, rendered by `experience-card.tsx` rather than the detail page.
  bullets: z.array(z.string()).optional(),
  departFrom: z.string().optional(),
  groupLabel: z.string().optional(),

  // Written by `scripts/build-seed-data.mjs` from the ytf-files CSVs, and read
  // by nothing in the web repo today. Declared because they ARE in the data:
  // a schema that omits them makes the next person think the rows are clean.
  // Comma-joined strings, NOT arrays — the generator flattens the CSV's ` | `
  // lists for these two while keeping every other list an array. Verified
  // against all 22 imported rows; do not "tidy" them into arrays without
  // changing the generator and reseeding.
  places: z.string().optional(),
  languages: z.string().optional(),
  /** Child/zone price breakdown, on the four rows whose CSV had tiers. */
  priceTiersText: z.string().optional(),
});
export type ExperienceDetails = z.infer<typeof ExperienceDetails>;

/** One expandable day/module in a course syllabus. */
export const CurriculumDay = z.object({
  num: z.string(),
  title: z.string(),
  subtitle: z.string().optional(),
  duration: z.string().optional(),
  durationTone: z.literal("leaf").optional(),
  steps: z
    .array(z.object({ lead: z.string().optional(), text: z.string() }))
    .optional(),
});
export type CurriculumDay = z.infer<typeof CurriculumDay>;

export const LearnDetails = EditorialDetails.extend({
  /** Short badge over the title ("SSI Certification"). */
  certBadge: z.string().optional(),
  /** Course length as prose ("2 days") — rendered on the card, not the page.
   *  Distinct from the promoted `durationHours` column, which is numeric and
   *  filterable; a course is sold in days, not hours. */
  durationLabel: z.string().optional(),
  aboutTitle: z.string().optional(),
  about: z.array(z.string()).optional(),
  curriculum: z.array(CurriculumDay).optional(),
  skills: z.array(z.string()).optional(),
  certification: z
    .looseObject({
      title: z.string(),
      description: z.string().optional(),
      chips: z.array(z.string()).optional(),
    })
    .optional(),
  /** Everything the course fee covers, in plain language. */
  included: z.array(z.string()).optional(),
  /** The stay a course's included or discounted nights resolve to. `slug` is a
   *  listing slug, so the card links straight through to it. */
  stayWith: z
    .looseObject({
      slug: z.string(),
      title: z.string(),
      note: z.string().optional(),
    })
    .optional(),
  instructor: z
    .looseObject({
      name: z.string(),
      role: z.string().optional(),
      avatarUrl: z.string().optional(),
      bio: z.array(z.string()).optional(),
      stats: z
        .array(z.object({ value: z.string(), label: z.string() }))
        .optional(),
    })
    .optional(),
  faq: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
  booking: z
    .looseObject({
      note: z.string().optional(),
      starts: z.string().optional(),
      groupSize: z.string().optional(),
      location: z.string().optional(),
      duration: z.string().optional(),
    })
    .optional(),
});
export type LearnDetails = z.infer<typeof LearnDetails>;

/** Bus+ferry transfer bundles. These are hidden from browse by construction and
 *  surface only as "Add to trip" on a vibe's "Getting there" cards, so they
 *  carry no host note, personas or honest corner — there is no detail page to
 *  render them on. */
export const TransportDetails = SharedDetails.extend({
  about: z.array(z.string()).optional(),
  transfer: z
    .looseObject({
      /** Internal context (e.g. Boonsiri) — not a public brand promise. */
      operator: z.string().optional(),
      from: z.string().optional(),
      oneWay: z.boolean().optional(),
    })
    .optional(),
});
export type TransportDetails = z.infer<typeof TransportDetails>;

/** One tier of a journey — the same idea as `StayRoom`, and it rides the same
 *  rail: the chosen tier's name is stored in `booking.roomType`, the cart line
 *  is keyed `listing::roomType`, and `roomPriceFor` resolves the price
 *  server-side. It is NOT stored under `details.rooms`, because a 7-day journey
 *  is not a room; the booking controller's lookups read `rooms ?? tiers`. */
export const JourneyTier = z.object({
  /** Shown to the guest and stored verbatim in `booking.roomType`. */
  name: z.string(),
  /** Priced ⇒ bookable, exactly as rooms work. */
  price: z.number().nonnegative().optional(),
  /** Calendar days and nights this tier covers ("4 days, 3 nights"). `days`
   *  also scopes the day grid: a tier shows `JourneyDay`s up to this number. */
  days: z.number().int().positive().optional(),
  nights: z.number().int().nonnegative().optional(),
  /** Max travellers on ONE booking of this tier. This is a party-size cap, not
   *  the departure's seat cap — that is `groupMax`. Read by `capacityFor`. */
  maxGuests: z.number().int().positive().optional(),
  blurb: z.string().optional(),
});
export type JourneyTier = z.infer<typeof JourneyTier>;

/** One line in a day's morning/afternoon/evening cell. `tiers` scopes the line
 *  to named tiers; absent means every tier. This exists because the split day
 *  reads differently per tier — one tier checks out and transfers to the pier
 *  while the other has a free day — and that is one cell in the source grid. */
export const JourneyDayItem = z.object({
  text: z.string(),
  tiers: z.array(z.string()).optional(),
});
export type JourneyDayItem = z.infer<typeof JourneyDayItem>;

/** One day of the journey. `tiers` scopes the WHOLE day (the days only the
 *  longer tier gets); per-line scoping lives on `JourneyDayItem`. */
export const JourneyDay = z.object({
  day: z.number().int().positive(),
  theme: z.string(),
  tiers: z.array(z.string()).optional(),
  morning: z.array(JourneyDayItem).optional(),
  afternoon: z.array(JourneyDayItem).optional(),
  evening: z.array(JourneyDayItem).optional(),
});
export type JourneyDay = z.infer<typeof JourneyDay>;

/** A themed group of what the journey gives you ("Island Highlights", "Fully
 *  taken care of"), rendered above the day grid. */
export const JourneyPillar = z.object({
  title: z.string(),
  blurb: z.string().optional(),
  items: z.array(z.string()).optional(),
});
export type JourneyPillar = z.infer<typeof JourneyPillar>;

/** The one activity a guest picks between. **Decided on the island, not at
 *  booking** — nothing here is a booking field, and no option carries a price.
 *  The enquiry note is where a guest states an initial preference. */
export const JourneyChoice = z.object({
  title: z.string(),
  /** Which day the choice falls on, so the page can mark it in the grid. */
  day: z.number().int().positive().optional(),
  note: z.string().optional(),
  options: z.array(
    z.object({ name: z.string(), blurb: z.string().optional() })
  ),
});
export type JourneyChoice = z.infer<typeof JourneyChoice>;

/** ⚠️ **The one details schema written BEFORE its data exists.** Every other
 *  shape in this file was rewritten against seeded rows, under the rule that a
 *  field must exist in real data to belong here. A brand-new listing type has
 *  no rows to check, and the file's other rule applies instead: the schema goes
 *  in first, then the seed writes against it. **Re-run the parse check once the
 *  first journey is seeded** — these are strict, not loose, so a key the seed
 *  writes and this omits is silently STRIPPED on parse. */
export const JourneyDetails = EditorialDetails.extend({
  overviewTitle: z.string().optional(),
  overview: z.array(z.string()).optional(),
  tiers: z.array(JourneyTier).optional(),
  days: z.array(JourneyDay).optional(),
  pillars: z.array(JourneyPillar).optional(),
  choice: JourneyChoice.optional(),
  /** Fixed departure dates, ISO `YYYY-MM-DD`, as a plain list. Deliberately
   *  NOT per-departure records: nothing counts seats across bookings anywhere
   *  in the system, so a departure has no per-date state to hold yet. Capacity
   *  is held by hand at confirm time. Promote to records when a journey needs
   *  one date sold out, cancelled, or priced apart from the others. */
  departures: z.array(z.string()).optional(),
  /** Seat cap for a whole departure — distinct from `listing.maxGuests`, which
   *  is the per-booking party size, and from `JourneyTier.maxGuests`. Nothing
   *  enforces this; it is displayed, and counted by hand when we confirm. */
  groupMax: z.number().int().positive().optional(),
  /** Where we collect guests, at no extra charge. The guest's pick is stored in
   *  `booking.pickupLocation`, which already exists and stays editable after
   *  booking — useful here, since guests choose once their flight is booked. */
  origins: z.array(z.string()).optional(),
  /** What the price covers, and what it doesn't. `notIncluded` is not optional
   *  editorially even though it is here: a journey's inclusions are conditional
   *  (one dinner depends on the activity chosen), and leaving that unsaid is
   *  what makes a guest feel short-changed at the table. */
  included: z.array(z.string()).optional(),
  notIncluded: z.array(z.string()).optional(),
  bring: z.array(z.string()).optional(),
  faq: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
  booking: z
    .looseObject({
      note: z.string().optional(),
      groupSize: z.string().optional(),
      meetingPoint: z.string().optional(),
    })
    .optional(),
});
export type JourneyDetails = z.infer<typeof JourneyDetails>;

export const ListingDetailsByType = {
  stay: StayDetails,
  experience: ExperienceDetails,
  learn: LearnDetails,
  transport: TransportDetails,
  journey: JourneyDetails,
} as const;

/** Pick the details schema for a listing type — use in the write path. */
export function detailsSchemaFor(type: z.infer<typeof ListingType>) {
  return ListingDetailsByType[type];
}

export const ListingSchema = z.object({
  id,
  partnerId: id,
  destinationId: id,
  type: ListingType,
  title: z.string().min(1),
  slug: z.string().min(1),
  /** Short card/list summary (promoted column). */
  summary: z.string().optional(),
  description: z.string().optional(),
  price: z.number().nonnegative(),
  priceUnit: PriceUnit,
  currency: Currency.default("THB"),
  media: z.array(MediaRef).default([]),
  location: z.string().optional(),
  geo: GeoPoint.optional(),

  // Promoted, cross-type FILTER columns (nullable — only some types use each).
  // Keep filters out of jsonb: Strapi's query engine filters columns, not deep json.
  durationHours: z.number().positive().optional(),
  maxGuests: z.number().int().positive().optional(),
  level: z.string().optional(),

  /** Taxonomy tags, GIN-indexed jsonb. Queried by containment, no join table. */
  vibeSlugs: z.array(z.string()).default([]),

  /** Non-filtered, type-specific long tail. Validate via detailsSchemaFor(type). */
  details: z.record(z.string(), z.unknown()).optional(),

  // Own publish flag. NOT named `status` — Strapi v5 reserves `status` for the
  // draft/published document param, so a field named `status` can't be filtered
  // via the REST/document API (same fix as partnerStatus).
  listingStatus: ListingStatus,
  locale: z.string().optional(),
  ...timestamps,
});
export type Listing = z.infer<typeof ListingSchema>;
