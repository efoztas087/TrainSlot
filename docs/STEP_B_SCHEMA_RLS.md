# Step B — Supabase DB Schema + RLS

This step provides the MVP SQL migration for:

- Enums
- Core tables
- Indexes and constraints
- Public-safe views
- Row Level Security policies
- Booking concurrency lock helper table

Apply file:

- `supabase/migrations/0001_mvp_schema_and_rls.sql`

## Notes

- Public booking creation should **not** run from anon/authenticated clients directly; use server routes/actions with service role.
- Public read policies are minimal and only for active coach/service/availability records.
- Coach soft-delete is supported via `coaches.deleted_at` + `is_active=false`.
