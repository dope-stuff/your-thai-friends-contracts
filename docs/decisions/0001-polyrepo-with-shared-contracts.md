# 0001 — Polyrepo with a shared contracts package

- Status: accepted
- Date: 2026-06-15

## Context

Public web, back office, Strapi backend, and workers all share the same domain types
(Partner, Listing, Booking, …). Fully separate repos drift; a single monorepo was an option.

## Decision

Keep separate repos (`your-thai-friends`, `-bo`, `-backend`, `-workers`) but add one shared
`your-thai-friends-contracts` package (TS types + Zod) that everything imports. Consume it as a
tag-pinned git dependency early; graduate to a private registry later. Every change bumps the
version and is git-tagged.

## Consequences

- One source of truth for domain shapes; no hand-synced types.
- Contracts also carries the canonical `ARCHITECTURE.md` and this ADR log.
- A version bump + tag is required on every contract change (slight overhead, worth it).
