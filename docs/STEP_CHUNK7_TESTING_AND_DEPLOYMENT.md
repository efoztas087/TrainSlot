# Chunk 7: Testing and Deployment Instructions

## What this chunk adds

- Local setup and deployment runbook in `README.md`
- `.env.example` with required runtime variables
- `supabase/seed.sql` for local/dev starter data
- `vercel.json` cron schedule for reminder automation

## Verification commands

```bash
npm test
npm run typecheck
```

## Production checklist

1. Apply migration to production Supabase:
   - `supabase/migrations/0001_mvp_schema_and_rls.sql`
2. Configure env vars in Vercel.
3. Confirm `/api/cron/reminders` receives `Authorization: Bearer $CRON_SECRET`.
4. Validate booking creation, cancellation link, and reminder emails in staging.
5. Verify RLS with coach A/B isolation test.
