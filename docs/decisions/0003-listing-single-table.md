# 0003 — Single listing table with promoted filter columns + jsonb details

- Status: accepted
- Date: 2026-06-15

## Context

One partner can offer Stay / Experience / Learn, and each vertical has different attributes. We
need search + filter, and we display each type separately. Options considered: (a) one table +
jsonb details, (b) separate collection per vertical, (c) one table with all nullable columns.

## Decision

**One `listing` table.** The deciding factor is references: `booking`, `cart`, `saved`, and
`itinerary-stop` all point at a listing. Separate per-vertical tables would force a polymorphic
reference (targetType + targetId) across all four — the pattern ADR 0002 forbids.

To keep search/filter fast (Strapi filters columns, not deep jsonb), **promote filtered fields to
real nullable columns** (`durationHours`, `maxGuests`, `level`, plus shared `price`, `status`,
`type`, `partner`, `destination`, `vibeSlugs`). The non-filtered long tail goes in a `details`
jsonb, validated per `type` via `detailsSchemaFor(type)`.

## Consequences

- All listing references stay a single clean FK.
- Frontend shows verticals separately via `?type=...`; filters hit indexed columns.
- Upgrade path if a vertical needs strict structure: base table + per-type 1:1 detail tables,
  without breaking references.
