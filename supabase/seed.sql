-- TrainSlot MVP development seed
-- Replace UUIDs/emails as needed for local environments.

insert into public.coaches (
  id,
  slug,
  display_name,
  contact_email,
  timezone,
  min_notice_hours,
  cancellation_window_hours,
  max_future_days,
  default_buffer_minutes,
  is_active
)
values (
  '00000000-0000-0000-0000-000000000001',
  'jan-pt',
  'Jan PT',
  'jan@example.com',
  'Europe/Amsterdam',
  6,
  12,
  30,
  0,
  true
)
on conflict (id) do nothing;

insert into public.services (
  id,
  coach_id,
  name,
  duration_minutes,
  credits_cost,
  is_active
)
values (
  '10000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'PT sessie 60 min',
  60,
  1,
  true
)
on conflict (id) do nothing;

insert into public.availability_rules (coach_id, weekday, start_time, end_time, is_active)
values
  ('00000000-0000-0000-0000-000000000001', 0, '09:00', '17:00', true),
  ('00000000-0000-0000-0000-000000000001', 2, '09:00', '17:00', true),
  ('00000000-0000-0000-0000-000000000001', 4, '09:00', '17:00', true)
on conflict do nothing;
