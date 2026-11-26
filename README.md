# CafeBrew

Online store for a cafe — customers browse drinks, pastries, and merchandise, manage a cart, place orders, and pay online. Admins manage the catalog and order status.

## Stack

- **Monorepo:** pnpm workspaces (`apps/*`, `packages/*`)
- **Server** (`apps/server`): Node.js ESM, Express 5, Mongoose 9 (MongoDB), JWT auth (access 15m / refresh 7d), zod validation, Xendit payments, Supabase storage for product images
- **Client** (`apps/client`): Vite, React 19, Tailwind CSS 4, react-router-dom, axios, react-hook-form
- **Shared** (`packages/shared`): zod schemas, frozen enums, JSDoc typedefs, route constants — imported as `@shared/core`

## Requirements

- Node.js 20 (see `.nvmrc`)
- pnpm 9
- MongoDB running locally on `localhost:27017`

## Setup

```bash
pnpm install

# Server env — copy the example and fill in secrets
cp apps/server/.env.example apps/server/.env

# Client env (optional — defaults to same-origin /api proxy)
cp apps/client/.env.example apps/client/.env
```

Seed dev data (admin/customer users, categories, products — refuses `NODE_ENV=production`):

```bash
pnpm seed
```

## Commands

| Task | Command |
|---|---|
| Dev server | `pnpm dev:server` (port 3000) |
| Dev client | `pnpm dev:client` (port 5173) |
| Seed database | `pnpm seed` |
| Server tests | `pnpm test:server` |
| Lint | `pnpm lint` |
| Check (lint + client build) | `pnpm check` |
| Client build | `pnpm build:client` |

## Structure

```
apps/
  server/src/     # routes → controllers → services → models
  client/src/     # React app (@ → src, @shared/* → packages/shared/src/*)
packages/
  shared/src/     # zod schemas, enums, route constants, JSDoc types
```

## API surface

All under `/api`:

- `POST /api/auth/register|login|refresh|logout`, `GET /api/auth/me`
- `GET|POST|PATCH|DELETE /api/cart*` (authenticated)
- `GET /api/categories`, `GET /api/products` (+ admin CRUD)
- `POST /api/orders` (place), admin order list/status/cancel
- `POST /api/payments/invoice`, `POST /api/payments/webhook` (Xendit callback)
- `POST /api/upload` (product image → Supabase storage)
- `GET /api/health`

## Notes

- Prices are integer PHP centavos internally; Xendit invoices are sent in pesos (`order.total / 100`).
- Conventions and project memory live in `CONVENTIONS.md` and `.devin/` (local-only, git-ignored).
