# Step C — Next.js App Folder Structure (TrainSlot MVP)

Below is the recommended App Router structure for the MVP, optimized for:

- clear public vs dashboard boundaries
- server-first data access with Supabase
- modular booking, credits, and notification domains
- easy extension for future payments (Mollie)

## Proposed structure

```text
.
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   │   ├── page.tsx
│   │   │   ├── calendar/
│   │   │   │   └── page.tsx
│   │   │   ├── clients/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [clientId]/
│   │   │   │       └── page.tsx
│   │   │   ├── packages/
│   │   │   │   └── page.tsx
│   │   │   └── settings/
│   │   │       └── page.tsx
│   │   └── layout.tsx
│   ├── (public)/
│   │   ├── [slug]/
│   │   │   ├── page.tsx
│   │   │   ├── book/
│   │   │   │   └── page.tsx
│   │   │   └── success/
│   │   │       └── page.tsx
│   │   └── layout.tsx
│   ├── api/
│   │   ├── bookings/
│   │   │   ├── create/route.ts
│   │   │   └── cancel/route.ts
│   │   ├── availability/
│   │   │   └── route.ts
│   │   ├── cron/
│   │   │   └── reminders/route.ts
│   │   └── health/route.ts
│   ├── error.tsx
│   ├── global-error.tsx
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/                          # shadcn/ui
│   ├── shared/
│   │   ├── app-logo.tsx
│   │   ├── page-header.tsx
│   │   ├── empty-state.tsx
│   │   └── loading-state.tsx
│   ├── booking/
│   │   ├── booking-stepper.tsx
│   │   ├── service-picker.tsx
│   │   ├── slot-picker.tsx
│   │   ├── client-details-form.tsx
│   │   └── booking-summary.tsx
│   ├── dashboard/
│   │   ├── nav-sidebar.tsx
│   │   ├── nav-mobile.tsx
│   │   ├── stat-card.tsx
│   │   └── bookings-list.tsx
│   └── settings/
│       ├── coach-profile-form.tsx
│       ├── booking-rules-form.tsx
│       ├── availability-editor.tsx
│       └── services-form.tsx
├── lib/
│   ├── env.ts
│   ├── utils.ts
│   ├── constants.ts
│   ├── zod/
│   │   ├── booking.ts
│   │   ├── coach.ts
│   │   ├── service.ts
│   │   └── package.ts
│   ├── datetime/
│   │   ├── timezone.ts
│   │   ├── slots.ts
│   │   └── ics.ts
│   ├── rate-limit/
│   │   └── booking-rate-limit.ts
│   ├── observability/
│   │   ├── logger.ts
│   │   └── events.ts
│   └── security/
│       ├── tokens.ts
│       └── hash.ts
├── server/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── admin.ts
│   ├── repositories/
│   │   ├── coaches-repo.ts
│   │   ├── services-repo.ts
│   │   ├── clients-repo.ts
│   │   ├── bookings-repo.ts
│   │   ├── availability-repo.ts
│   │   └── wallets-repo.ts
│   ├── services/
│   │   ├── booking-service.ts
│   │   ├── availability-service.ts
│   │   ├── credits-service.ts
│   │   ├── cancellation-service.ts
│   │   ├── payment-service.ts         # interface + manual impl
│   │   └── reminder-service.ts
│   ├── email/
│   │   ├── provider.ts
│   │   ├── resend-provider.ts
│   │   └── templates/
│   │       ├── booking-confirmation.tsx
│   │       ├── coach-notification.tsx
│   │       └── reminder.tsx
│   ├── actions/
│   │   ├── settings-actions.ts
│   │   ├── services-actions.ts
│   │   ├── packages-actions.ts
│   │   └── bookings-actions.ts
│   └── auth/
│       ├── guard.ts
│       └── session.ts
├── supabase/
│   ├── migrations/
│   ├── seed.sql
│   └── README.md
├── tests/
│   ├── unit/
│   │   ├── availability.test.ts
│   │   └── credits.test.ts
│   └── fixtures/
│       └── booking-fixtures.ts
├── styles/
│   └── globals.css
├── public/
│   └── icons/
├── middleware.ts
├── next.config.mjs
├── tailwind.config.ts
├── components.json
├── package.json
└── README.md
```

## Architectural notes

1. `app/(public)` and `app/(dashboard)` route groups prevent accidental coupling between anonymous and authenticated UX.
2. `server/repositories` handles persistence; `server/services` owns domain logic (availability, booking, credits).
3. Public booking writes happen via `app/api/bookings/create/route.ts` using server-side Supabase admin context.
4. `payment-service.ts` provides an abstraction so manual tracking can later swap to Mollie without touching booking flow.
5. Unit tests live in `tests/unit` for deterministic booking logic (availability + credits).

## Sequence alignment with required chunks

- Chunk 1: `app/(auth)`, `app/(dashboard)/layout.tsx`, navigation components, auth guards.
- Chunk 2: settings/service forms + actions + repos.
- Chunk 3: availability editor + slot computation in `server/services/availability-service.ts`.
- Chunk 4: public pages + booking API + validation.
- Chunk 5: packages/wallet pages + credits service.
- Chunk 6: email providers/templates + cancellation endpoints + cron reminders.
- Chunk 7: tests + deployment docs.
