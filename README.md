# @ytf/contracts

Shared domain types and [Zod](https://zod.dev) schemas for **Your Thai Friends**. The single
source of truth imported by `your-thai-friends` (web), `your-thai-friends-bo` (back office),
`your-thai-friends-backend` (Strapi), and `your-thai-friends-workers`.

> No runtime, no I/O — just schemas + inferred types. The canonical system spec lives
> alongside this package: [ARCHITECTURE.md](./ARCHITECTURE.md).

## Usage

Each consumer installs this as a tag-pinned git dependency (graduate to a private registry later):

```jsonc
// package.json
"dependencies": {
  "@ytf/contracts": "github:<org>/your-thai-friends-contracts#v0.1.0"
}
```

```ts
import { ListingSchema, type Listing, BookingStatus } from "@ytf/contracts";

const listing: Listing = ListingSchema.parse(apiResponse);
```

## Develop

```bash
pnpm install
pnpm build        # dual ESM+CJS + .d.ts via tsup
pnpm typecheck
```

**Every change must bump the version and be git-tagged** (`v0.1.1`, …) so consumers can pin it.

## Layout

```
src/
  enums.ts        # Role, ListingType, PriceUnit, BookingStatus, Visibility, ...
  common.ts       # id, timestamps, GeoPoint, MediaRef, Socials
  entities/       # one schema + type per domain entity
  dto/            # request/response shapes (booking lookup, enquiry create, ...)
  index.ts        # re-exports everything
```
