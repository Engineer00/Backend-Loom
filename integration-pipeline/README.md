# Integration Pipeline – Webhook → Async Jobs → Postgres → Dashboard

This is a small, from-scratch demo designed to **show systems architecture + hands-on implementation** in one project:

- **Auth**: NextAuth Credentials (login page)
- **DB**: Postgres + Prisma schema (users, events, jobs, processed outputs)
- **Integrations**: signed webhook ingestion (HMAC) + integration table (OAuth placeholder)
- **Reliability**: async worker with locking + retries/backoff + idempotent outputs
- **UI**: dashboard to inspect events, jobs, and processed items

---

## Architecture (high level)

1) A third party sends a webhook → `POST /api/webhooks/inbound`
2) API verifies signature and writes a `WebhookEvent`
3) API enqueues a `Job` in Postgres
4) Worker polls/locks due jobs, processes them, writes `ProcessedItem`
5) Dashboard pages show the full pipeline state

---

## Quickstart (local)

### 0) Prereqs

- Node.js (npm)
- Docker Desktop (for local Postgres) — make sure it’s running

### 1) Start Postgres

```bash
npm run db:up
```

Note: `docker-compose.yml` maps Postgres to **localhost:5540** to avoid conflicts with any existing local Postgres on 5432.

### 2) Run migrations + seed a user

```bash
npm run prisma:migrate -- --name init
npm run seed
```

Demo credentials:
- email: `rep@example.com`
- password: `password123`

### 3) Start the worker (job processor)

```bash
npm run worker
```

### 4) Start the web app

```bash
npm run dev
```

Open:
- `http://localhost:3000/login`
- `http://localhost:3000/dashboard`

### 5) Send a signed webhook (creates an event + job)

```bash
npm run webhook:send
```

Then refresh the dashboard pages:
- `/dashboard/events`
- `/dashboard/jobs`
- `/dashboard/processed`

---

## Environment variables

See `.env.example`. For convenience this repo includes a local `.env` with dev-only values.

- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `WEBHOOK_SIGNING_SECRET`

---

## Where things live

- `app/api/webhooks/inbound/route.ts`: webhook signature verification + enqueue job
- `worker/worker.ts`: job processor (locking, retries/backoff, idempotent output)
- `prisma/schema.prisma`: DB schema
- `app/dashboard/*`: UI for inspecting state

