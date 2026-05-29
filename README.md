# Eco Bright Admin v1

Eco Bright Admin v1 is an Nx monorepo with a Next.js App Router admin app, shared Prisma database package, and shared Zod validators.

## Stack

- Nx monorepo
- Next.js App Router
- Prisma + Neon PostgreSQL
- Auth.js with Credentials Provider
- Prisma Adapter with database sessions
- Tailwind CSS
- shadcn-style local UI components
- Zod
- bcryptjs

## Structure

```text
apps/
  admin/
    app/
    components/
    actions/
    lib/

packages/
  db/
    prisma/schema.prisma
    prisma/seed.ts
    src/client.ts
    src/index.ts

  validators/
    src/auth.ts
    src/user.ts
    src/category.ts
    src/product.ts
    src/stock.ts
```

## Requirements

- Node.js 20+
- pnpm 10+
- Neon or PostgreSQL database

## Environment

Create a root `.env` file:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DB?sslmode=require"
AUTH_SECRET="replace-with-a-long-random-secret"
AUTH_TRUST_HOST=true
AUTH_URL="http://localhost:3000"
NEXTAUTH_URL="http://localhost:3000"
```

Prisma CLI reads `.env` from the repo root. The Nx `admin` target also runs Next.js from the repo root so the same env file is used for local development.

## Install

```bash
pnpm install
```

## Prisma

Generate the Prisma client:

```bash
pnpm prisma generate
```

Run migrations in development:

```bash
pnpm prisma migrate dev
```

Seed the first admin user:

```bash
pnpm prisma db seed
```

Default local/dev admin credential:

- Email: `admin@ecobright.local`
- Password: `Admin@123456`

This credential is only for local/dev. Change or remove it in production.

## Run

Start the admin app:

```bash
pnpm nx dev admin
```

Build the admin app:

```bash
pnpm nx build admin
```

## Modules

- Login + database session
- Dashboard
- Category CRUD
- Product CRUD
- Stock movement
- User management
- First admin seed

## Notes

- Product stock is only changed on the server through stock movements.
- Negative stock is blocked.
- `previousStock` and `newStock` are stored on every stock movement.
- Password hashes are never exposed to the UI.
- `/users` is restricted to `ADMIN`.
