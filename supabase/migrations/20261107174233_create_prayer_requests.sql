create table public.prayer_requests (
  id uuid primary key default gen_random_uuid(),
  name text,
  contact text not null,
  prayer_request text not null,
  created_at timestamptz not null default now(),
  constraint prayer_requests_name_length check (
    name is null or (name ~ '[^[:space:]]' and char_length(name) <= 120)
  ),
  constraint prayer_requests_contact_length check (
    contact ~ '[^[:space:]]' and char_length(contact) <= 254
  ),
  constraint prayer_requests_text_length check (
    prayer_request ~ '[^[:space:]]' and char_length(prayer_request) <= 5000
  )
);

create index prayer_requests_inbox_order_idx
on public.prayer_requests (created_at desc, id desc);

alter table public.prayer_requests enable row level security;

-- Override default table grants: requests are append-only to API clients.
revoke all on public.prayer_requests from public, anon, authenticated;
grant insert (name, contact, prayer_request)
on public.prayer_requests to anon, authenticated;
grant select on public.prayer_requests to authenticated;

create policy "Visitors can submit prayer requests"
on public.prayer_requests
for insert
to anon, authenticated
with check (true);

create policy "Admins can read prayer requests"
on public.prayer_requests
for select
to authenticated
using (
  exists (
    select 1
    from public.admin_users
    where lower(admin_users.email) = lower((select auth.jwt() ->> 'email'))
  )
);
