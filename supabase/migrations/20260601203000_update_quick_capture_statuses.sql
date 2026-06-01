alter table public.quick_captures
drop constraint if exists quick_captures_status_check;

alter table public.quick_captures
add constraint quick_captures_status_check
check (status in (
  'pending',
  'parsed',
  'applied',
  'failed',
  'ignored',
  'needs_confirmation',
  'confirmed',
  'cancelled'
));
