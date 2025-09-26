This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


# Multi-Tenant SaaS Notes App

## Chosen multi-tenant approach
**Shared schema**: Every `User` and `Note` has `tenantId` referencing `Tenant`. This ensures:
- strict isolation via `WHERE tenantId = currentTenantId`
- easy seeding for test tenants (Acme, Globex)
- low infrastructure complexity (single DB)

## Endpoints (paths available at root thanks to vercel.json rewrites)
- `GET /health` → `{ "status": "ok" }`
- `POST /auth/login` → login, returns `{ token, user, tenant }`
- `GET /notes` → list notes (tenant-scoped)
- `POST /notes` → create note (enforces Free plan limit)
- `GET /notes/:id` → get one note (tenant-scoped)
- `PUT /notes/:id` → update note
- `DELETE /notes/:id` → delete note
- `GET /tenants/:slug` → tenant info (requires auth)
- `POST /tenants/:slug/invite` → invite user (Admin only)
- `POST /tenants/:slug/upgrade` → upgrade to Pro (Admin only)

## Test accounts
All passwords: `password`
- admin@acme.test (Admin, tenant: Acme)
- user@acme.test (Member, tenant: Acme)
- admin@globex.test (Admin, tenant: Globex)
- user@globex.test (Member, tenant: Globex)

## Subscription rules
- Free plan: up to 3 notes per tenant
- Pro plan: unlimited notes
- `POST /tenants/:slug/upgrade` lifts limit immediately.

## Deployment
1. Push to GitHub.
2. Import project in Vercel.
3. Set environment variables: `DATABASE_URL`, `JWT_SECRET`.
4. Deploy.


