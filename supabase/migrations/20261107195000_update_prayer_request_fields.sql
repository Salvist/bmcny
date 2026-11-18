begin;

alter table public.prayer_requests
  rename column prayer_request to text;

alter table public.prayer_requests
  add column phone_number text,
  add column email text,
  add column updated_at timestamptz,
  add column status text not null default 'pending',
  add column notes text;

update public.prayer_requests
set email = case when position('@' in contact) > 0 then contact end,
    phone_number = case when position('@' in contact) = 0 then contact end,
    updated_at = created_at;

alter table public.prayer_requests
  drop column contact,
  alter column updated_at set default now(),
  alter column updated_at set not null,
  add constraint prayer_requests_contact_required check (
    coalesce(email ~ '[^[:space:]]', false) or coalesce(phone_number ~ '[^[:space:]]', false)
  ),
  add constraint prayer_requests_email_length check (email is null or (email ~ '[^[:space:]]' and char_length(email) <= 254)),
  add constraint prayer_requests_phone_length check (phone_number is null or (phone_number ~ '[^[:space:]]' and char_length(phone_number) <= 254)),
  add constraint prayer_requests_status_valid check (status in ('pending', 'ongoing', 'prayed', 'rejected')),
  add constraint prayer_requests_notes_length check (notes is null or char_length(notes) <= 5000);

create function public.set_prayer_request_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger prayer_requests_updated_at
before update on public.prayer_requests
for each row execute function public.set_prayer_request_updated_at();

-- Column grants keep visitors from supplying administrative fields.
revoke insert (name, text) on public.prayer_requests from anon, authenticated;
grant insert (name, phone_number, email, text) on public.prayer_requests to anon, authenticated;
grant update (status, notes) on public.prayer_requests to authenticated;

create policy "Admins can update prayer requests"
on public.prayer_requests for update to authenticated
using (
  exists (select 1 from public.admin_users
    where lower(admin_users.email) = lower((select auth.jwt() ->> 'email')))
)
with check (
  exists (select 1 from public.admin_users
    where lower(admin_users.email) = lower((select auth.jwt() ->> 'email')))
);

commit;
