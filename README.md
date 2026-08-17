# DREAMS Score Online

**DREAMS Score Online** is a React, Express, tRPC, and MySQL application that creates estimate-based business opportunity reports across the six DREAMS pillars. The public site includes a guided assessment, persisted individualized reports, an interactive opportunity carousel, and responsive navigation.

## Local development

```bash
pnpm install
pnpm dev
```

Run the quality suite before publishing changes:

```bash
pnpm test
pnpm check
pnpm build
```

## External hosting

This is a **server-backed application**, not a GitHub Pages site. GitHub stores the source and runs CI; deploy the Node application to a host that supports a long-running Node process and a MySQL-compatible database. See [EXTERNAL_DEPLOYMENT.md](./EXTERNAL_DEPLOYMENT.md) for the required settings, database migration procedure, media migration requirement, and `dreamsscoreai.com` DNS handoff.

## Repository safety

Set real values only in the chosen host’s secret manager, using the environment inventory in [EXTERNAL_DEPLOYMENT.md](./EXTERNAL_DEPLOYMENT.md). Never commit runtime values, database URLs, tokens, or generated `.manus` artifacts.
