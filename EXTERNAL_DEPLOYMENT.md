# External Full-Stack Deployment Handoff

> **Hosting model:** GitHub is the source repository and CI location. Deploy the live application to a server-capable Node host with a MySQL-compatible database. Do not use GitHub Pages for the current application because public assessments create and retrieve database-backed reports.

## Runtime contract

| Concern | Required configuration | Notes |
|---|---|---|
| Runtime | Node.js 22 and pnpm 10 | The repository scripts use pnpm and start `dist/index.js`. |
| Build | `pnpm install --frozen-lockfile && pnpm build` | Builds the Vite client and bundled Express server. |
| Start | `pnpm start` | The server reads the host-provided `PORT`; do not hard-code one. |
| Database | MySQL-compatible `DATABASE_URL` | Run the Drizzle migrations before serving traffic. |
| Session security | `JWT_SECRET` | Set a high-entropy production secret in the host’s secret manager. |
| Monitoring | HTTP check on `/` and an assessment smoke test | Confirm a submitted assessment returns an individualized `/report/:id` page. |

## Deployment sequence

1. Create a production MySQL-compatible database and add `DATABASE_URL` plus `JWT_SECRET` to the host’s encrypted environment settings. Use the environment inventory below as the complete reference; keep all values only in the host’s secret manager.
2. Install dependencies with `pnpm install --frozen-lockfile` and generate/apply migrations with `pnpm drizzle-kit generate && pnpm drizzle-kit migrate`.
3. Build with `pnpm build`, then start the service with `pnpm start`. The application must receive its listening port from `PORT`.
4. Submit a controlled assessment in the deployed environment and confirm its `/report/:id` URL loads after a fresh browser session.
5. Connect `dreamsscoreai.com` in the selected host’s domain settings. Only then update Namecheap DNS to the exact record values shown by that host.

## Media and identity portability

The current site uses project-managed `/manus-storage/` paths for the hero film, report preview, and carousel panels. Those paths are served by the current platform’s storage proxy. Before external cutover, migrate these assets to the selected host’s object storage or CDN, update their source URLs, and verify each image/video on the hosted domain.

The public assessment and report flow work without sign-in. If owner or end-user OAuth is enabled later, replace the current Manus OAuth integration with the selected host’s compatible identity provider and update callback URLs accordingly.

## Domain handoff for `dreamsscoreai.com`

The Namecheap records in the supplied screenshot are GitHub Pages records. For the selected **full-stack** host, remove or replace only the conflicting root (`@`) and `www` records after that host has issued its required record values. Keep unrelated email and verification records unchanged.

| Host prompt | Namecheap field | Action |
|---|---|---|
| Root-domain record supplied by host | `@` | Add or replace exactly as instructed: usually an A/ALIAS/ANAME record. |
| `www` record supplied by host | `www` | Add or replace with the exact CNAME target. |
| Domain verification TXT/CNAME | Host-provided label | Add exactly as supplied before enabling HTTPS. |

After DNS propagates, set `dreamsscoreai.com` as the primary domain, redirect `www.dreamsscoreai.com` to it (or the reverse), and enable the host’s managed HTTPS certificate.

## Environment inventory

| Variable | Required for initial public launch | Purpose |
|---|---|---|
| `NODE_ENV` | Yes | Set to `production`. |
| `DATABASE_URL` | Yes | MySQL-compatible connection string for report persistence. |
| `JWT_SECRET` | Yes | Session-cookie signing secret. |
| `VITE_BOOKING_URL` | Optional | Overrides the on-page review fallback. |
| `VITE_FUNDING_PROVIDER_URL` | Optional | Overrides funding-category review links. |
| `VITE_RETIREMENT_PROVIDER_URL` | Optional | Overrides retirement-category review links. |
| `VITE_APP_ID`, `OAUTH_SERVER_URL`, `VITE_OAUTH_PORTAL_URL`, `OWNER_OPEN_ID`, `OWNER_NAME` | Only if OAuth is retained | Current Manus OAuth integration values. Replace this flow before using another identity provider. |
| `BUILT_IN_FORGE_API_URL`, `BUILT_IN_FORGE_API_KEY`, `VITE_FRONTEND_FORGE_API_URL`, `VITE_FRONTEND_FORGE_API_KEY` | Only while `/manus-storage` remains | Current managed-media proxy values. Prefer migrating media before external launch. |
