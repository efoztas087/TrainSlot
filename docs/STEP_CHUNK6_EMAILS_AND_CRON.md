# Chunk 6: Emails, Cancellation, and Reminders

## Implemented
- Email provider abstraction with console fallback and Resend implementation.
- Booking confirmation emails for client and coach after booking creation.
- Secure cancellation endpoint using hashed token links.
- Cancellation policy logic:
  - late cancellation -> `LATE_CANCEL`, no auto refund
  - on-time cancellation -> `CANCELLED`, auto refund if credits were deducted
- Cron endpoint for 24h reminders with idempotency guard via `audit_events`.

## Environment variables
- `RESEND_API_KEY` (optional in local; console fallback if missing)
- `RESEND_FROM_EMAIL` (optional)
- `NEXT_PUBLIC_APP_URL` (used for cancel links)
- `CRON_SECRET` (recommended, used by `/api/cron/reminders`)
- `SUPABASE_SERVICE_ROLE_KEY` (required for server-side privileged operations)

## Vercel Cron
Configure a cron job to call:
- `POST /api/cron/reminders`
- Header: `Authorization: Bearer $CRON_SECRET`
