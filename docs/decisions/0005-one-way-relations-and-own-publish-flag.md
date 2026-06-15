# 0005 — Prefer one-way relations; own publish flag instead of Strapi draft/publish

- Status: accepted
- Date: 2026-06-15

## Context

Two-way (bidirectional) Strapi relations add a reverse field + populate side on the other model.
We prefer one-way unless the reverse is genuinely useful. Separately, the product has its own back
office, so Strapi's draft/publish UI (a two-version-per-document system) would go unused while
complicating the API and raw SQL.

## Decision

**Relations:** default to **one-way** (`manyToOne`/`oneToOne` with no `inversedBy`/`mappedBy`).
`listing.partner` and `listing.destination` are one-way (query `listing.find({ partner|destination })`
instead of populating a reverse array). **Keep two-way only where the reverse is a real aggregate:**
`itinerary` ↔ `itinerary-stop` (ordered child stops populated in one query).

**Publishing:** turn `draftAndPublish` **off** on all content types. Use explicit fields the back
office controls — `listing.status`, `partner.status`, and `isPublished` on `destination`/`guide`/
`vibe`. The frontend filters on these.

## Consequences

- Fewer reverse-relation side effects; simpler populate trees.
- One row per entity (no draft/published twins) → cleaner SQL, simpler reads (no `status` param).
- Frontend must filter unpublished content explicitly.
