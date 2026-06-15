# 0002 — Strapi owns everything; jsonb over components

- Status: accepted
- Date: 2026-06-15

## Context

Strapi is the single backend (content + transactional). Strapi **components** and **dynamic
zones** persist data across generic `components_*` join tables keyed by component/field/order —
painful to query in raw SQL or extract when splitting a function out later. We also want to be
deliberate about relations.

## Decision

Storage rule:
- **Flat columns** for stable, validated, frequently-filtered fields.
- **`jsonb` columns** for variant/flexible data we don't join on (listing `details`, guide
  `spots`/`checklist`, partner `socials`/`geo`, cart contents, `vibeSlugs`). Validate every jsonb
  shape in the service layer with `@ytf/contracts` Zod.
- **FK relations** (manyToOne/oneToOne) only for entities with their own identity/lifecycle.
- **Never** components, dynamic zones, or polymorphic relations.
  - `saved` uses two nullable FKs + `kind` instead of polymorphic.
  - taxonomy uses jsonb tag arrays instead of manyToMany.

## Consequences

- Every entity is a real table with real columns + jsonb — clean `pg_dump`, clean SQL, clean
  service extraction.
- Variant validation lives in app code (flexible) rather than the DB.
- Partner is denormalized onto `booking` so the partner portal queries bookings without a join.
