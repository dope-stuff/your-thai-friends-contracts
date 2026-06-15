# Your Thai Friends — Architecture & Repo Spec

_Last updated: 2026-06-15_

A curated **travel marketplace** for Thailand (multi-partner). Editorial content (guides,
destinations, partner profiles) lives next to transactional state (cart, enquiries, bookings,
itineraries). **Strapi owns both.** Polyrepo with a shared contracts package to prevent type drift.

## Stack at a glance

| Concern | Choice |
|---|---|
| Public site + back office | Next.js + shadcn/ui |
| Backend (content + transactional) | Strapi v5 |
| DB | Postgres + **PostGIS** |
| Cache / session / rate-limit | Upstash Redis |
| Jobs / cron | Upstash QStash |
| Media storage | Cloudflare R2 (S3-compatible) + Cloudflare image transforms |
| Email | Brevo (provider inside Strapi) |
| Contact channel | WhatsApp `wa.me` deep link (no Business API yet) |
| Payments (later) | Beam Checkout — _confirm marketplace split/payouts first_ |
| i18n | TH + EN (next-intl) |
| Observability | Sentry + PostHog |

**Dropped:** Firebase (functions/websockets/Cloud Tasks), zerolang, second/comparison backend.
**No realtime in v1** — async (email / WhatsApp / polling) is sufficient.

## Dependency direction

```
your-thai-friends-contracts   (shared types + Zod — depends on nothing)
        ▲          ▲          ▲              ▲
        │          │          │              │
   your-thai-   your-thai-  your-thai-   your-thai-
   friends      friends-bo  friends-     friends-
   (web/PWA)    (admin)     backend      workers
                            (Strapi=hub)
```

- `contracts` depends on nothing; everything imports it.
- `backend` (Strapi) is the API hub. `web` and `bo` are clients.
- `workers` are QStash HTTP targets — start as routes _inside_ `backend`, split out only if heavy.

**Contracts distribution (polyrepo):** consume via tag-pinned git dependency early
(`"@ytf/contracts": "github:<org>/your-thai-friends-contracts#v0.1.0"`), graduate to a GitHub
Packages private registry once it stabilizes. Tag every contracts change with semver.

---

## Shared data model (lives in `your-thai-friends-contracts`)

Each entity = one Zod schema + inferred TS type. Enums shared across all surfaces.

**Enums:** `Role = traveller | host | admin` · `ListingType = stay | experience | learn` ·
`PriceUnit = per_night | per_trip | per_course | per_person` · `BookingStatus = pending |
confirmed | completed | cancelled` · `Visibility = public | unlisted | private` ·
`PartnerStatus = pending | active | suspended`.

| Entity | Key fields |
|---|---|
| **User** | id, email, name, role, avatar, `partnerId?` (for hosts) |
| **Partner** ("Local Friend") | id, name, slug, bio, location, geo, avatarMedia, coverMedia, whatsapp, status, ownerUserId |
| **Destination** | id, name, slug, region, geo (PostGIS point), description, heroMedia |
| **Listing** | id, partnerId, destinationId, type, title, slug, description, price, priceUnit, currency(THB), media[], geo, details, status |
| **Guide** | id, destinationId, title, blocks[], spots[], packingChecklist[], `unlocksOnBooking: true` |
| **Itinerary** | id, ownerUserId, title, visibility, shareSlug, stops[] |
| **ItineraryStop** | `listingId?` OR manual `{ name, mapsUrl, bookUrl }` |
| **Cart / Trip** | userId/sessionId, items[] (listingId), manualItems[] |
| **Booking / Enquiry** | id, **ref `YTF-####`**, userId?, contactEmail, contactPhone, listingId, partnerId, status, dates, guests, total, when(upcoming\|past) |
| **SavedItem** | userId, (listingId \| itineraryId) |
| **NewsletterSub** | email (→ Brevo list) |

> Lookup rule from the prototype: a booking is findable by **ref + (email OR phone)**.
> Guides are **gated** — content returns locked unless the user has a booking touching that destination.

---

## Repo: `your-thai-friends-contracts`

**Purpose:** single source of truth for domain types. No runtime, no I/O.

```
src/
  enums.ts
  entities/  user.ts partner.ts destination.ts listing.ts guide.ts
             itinerary.ts booking.ts saved.ts
  dto/       # request/response shapes per endpoint (optional, grows over time)
  index.ts   # re-exports everything
package.json # build with tsup; "exports" field; "types" field
tsconfig.json
```

- Pure TS + `zod`. Build to ESM+CJS+`.d.ts` with `tsup`.
- **Build this first.** Tag `v0.1.0` before scaffolding the others so they can install it.

---

## Repo: `your-thai-friends-backend` (Strapi v5 — the backend)

**Purpose:** content + transactional API + admin CMS UI. The hub.

```
config/
  database.ts        # Postgres + PostGIS
  plugins.ts         # upload -> R2 (S3 provider), email -> Brevo
  server.ts
  middlewares.ts
src/
  api/
    partner/  listing/  destination/  guide/  itinerary/  booking/  cart/
      content-types/   # schema.json per entity (mirror contracts)
      controllers/     # THIN — validate + delegate
      services/        # transactional logic w/ DB transactions
      routes/          # + route-level policies
  extensions/
    users-permissions/ # roles (traveller/host/admin), Google OAuth provider
  policies/
    is-partner-owner.ts   # <-- data scoping: host sees only own rows
    is-admin.ts
  middlewares/
  workers/             # QStash target handlers (phase 1 home for ytf-workers)
  index.ts             # bootstrap: seed roles, register policies
```

**Critical rules:**
- **Partner data-scoping is a security boundary.** Enforce in `is-partner-owner` route policy
  (host can only read/write listings & bookings where `partnerId` = their partner). Never rely on
  role flag alone.
- Booking flow (`cart → enquiry → booking`) and itinerary visibility = **services wrapped in DB
  transactions**, controllers stay thin.
- R2 upload provider + Brevo email provider configured in `config/plugins.ts` (user has working
  examples for both — drop them in here).
- Booking `ref` generated server-side (`YTF-` + sequence/short id), unique constraint.

**Env:** `DATABASE_URL` `R2_ACCESS_KEY_ID` `R2_SECRET_ACCESS_KEY` `R2_BUCKET` `R2_ENDPOINT`
`BREVO_API_KEY` `BREVO_SENDER` `QSTASH_TOKEN` `QSTASH_CURRENT_SIGNING_KEY`
`QSTASH_NEXT_SIGNING_KEY` `GOOGLE_CLIENT_ID/SECRET` `APP_KEYS` `JWT_SECRET` `REDIS_URL`.

---

## Repo: `your-thai-friends-bo` (Next.js — back office + partner portal)

**Purpose:** admin workspace + role-gated partner portal in one app.

```
app/
  (auth)/login
  (admin)/            # admin role
    listings/  bookings/  partners/  guides/  destinations/  reports/
  (partner)/          # host role — scoped to own partner
    listings/  bookings/  profile/
lib/
  api.ts              # typed fetch client using @ytf/contracts
  auth.ts             # Strapi JWT / Google OAuth
components/ui/        # shadcn
```

- One app, two role surfaces (`admin` vs `partner`) gated by the JWT role. Reuse components.
- Reports = bookings/revenue per partner, enquiry funnel.
- **Env:** `NEXT_PUBLIC_API_URL` (Strapi), auth secrets.

---

## Repo: `your-thai-friends` (Next.js — public PWA)

**Purpose:** the customer site. SSR/ISR for SEO; PWA + mobile-first. Recreate the design handoff
in `your-thai-friends/project/` pixel-for-pixel (see its README).

```
app/
  (marketing)/        # home, about, our friends
  destinations/[slug]/
  listings/[slug]/    # Stay / Experience / Learn detail
  guides/[slug]/      # gated content
  itinerary/builder/  itinerary/[shareSlug]/
  trip/               # cart / "Your Trip"
  bookings/find/      # ref + email/phone lookup
lib/api.ts            # @ytf/contracts
components/ui/        # shadcn
public/               # manifest.json, service worker, icons
```

- Migrate the prototype's localStorage state (cart, saved, bookings) to real API calls; keep
  localStorage only as guest/offline fallback for the cart.
- WhatsApp = `wa.me/<number>?text=...` deep links (no backend).
- next-intl (TH/EN), next-pwa (or app-router SW), Sentry + PostHog.
- **Env:** `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_WA_NUMBER`, maps key, analytics keys.

---

## Repo: `your-thai-friends-workers` (QStash targets)

**Purpose:** scheduled/delayed/queued jobs. **Phase 1: empty repo** — jobs live in
`backend/src/workers` as route handlers. **Phase 2 (only if a job is heavy/long-running):**
move here as a standalone service or Cloud Function, still triggered by QStash.

```
src/
  jobs/
    send-packing-checklist.ts   # delayed: trip start − 7 days
    send-enquiry-emails.ts       # on booking enquiry → Brevo
    expire-stale-enquiries.ts    # cron nightly
  qstash.ts                      # QStash signature verification
  server.ts
```

- Every endpoint verifies the QStash signature before acting.
- Job dispatch pattern: Strapi service publishes to QStash with `notBefore`/`cron` → QStash POSTs
  the worker endpoint → worker does the work (email via Brevo, status update via Strapi API).

---

## Conventions (all repos)

- Node 22, TypeScript strict, pnpm, ESLint + Prettier, conventional commits.
- `.env.example` committed; real `.env` never committed. Centralize secrets (Vercel env / Doppler) later.
- Each repo owns its CI (GitHub Actions): typecheck + lint + build on PR.
- Deploy: web + bo on Vercel; Strapi + Postgres on a container host (Railway/Fly/Render) or Cloud Run.

## Build order

1. `contracts` → define entities/enums, tag `v0.1.0`.
2. `backend` → content-types mirroring contracts, R2 + Brevo providers, roles + scoping policies, seed.
3. `web` + `bo` → install contracts, build against Strapi API.
4. `workers` → wire first QStash job (packing checklist) once bookings exist.

## Open items before money flow

- Confirm **Beam supports marketplace split / partner payouts** (docs don't mention it). If not,
  plan collect-and-settle or a separate payouts path.
