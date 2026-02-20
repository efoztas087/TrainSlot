# TrainSlot MVP

TrainSlot is a lean SaaS for personal trainers in NL to replace WhatsApp scheduling chaos with:

- public booking links
- slot availability logic
- credits/strippenkaart tracking
- email confirmations + reminders
- coach dashboard for sessions, clients, packages, and settings

## Tech stack

- Next.js 14 App Router + TypeScript
- Tailwind CSS (shadcn-style primitives)
- Supabase (Postgres + Auth + RLS)
- Resend (email)
- Vercel deployment + Vercel Cron
- date-fns + date-fns-tz

## Quick start

1. Install dependencies

```bash
npm install
```

2. Configure env vars

```bash
cp .env.example .env.local
```

3. Run DB migration in Supabase SQL editor or CLI

- `supabase/migrations/0001_mvp_schema_and_rls.sql`

4. (Optional) Seed local/dev data

- `supabase/seed.sql`

5. Start app

```bash
npm run dev
```

## Tests

Run unit tests:

```bash
npm test
```

Current unit coverage includes:
- availability slot filtering and overlap behavior
- credits deduction/payment status behavior

## Required environment variables

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `CRON_SECRET` (for `/api/cron/reminders` protection)

Optional:
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`

If `RESEND_API_KEY` is missing, the app falls back to console logging email payloads.

## Deploy to Vercel

1. Create a Vercel project from this repo.
2. Add all env vars above in Vercel project settings.
3. Deploy.
4. Ensure Supabase URL + keys point to production project.

## Vercel Cron reminders

This project includes a cron configuration (`vercel.json`) for 24h reminders.

Cron endpoint:
- `POST /api/cron/reminders`
- `Authorization: Bearer $CRON_SECRET`

The reminder service is idempotent via `audit_events` entries (`REMINDER_SENT_24H`).

## GDPR & privacy notes

- Store minimal client info (name/email/phone optional).
- Keep notes lightweight and avoid medical details.
- Public writes happen via server API only.
- Cancellation links use hashed tokens.

