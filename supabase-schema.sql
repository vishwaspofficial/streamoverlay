create table if not exists public.overlay_state (
  id text primary key default 'main',
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

insert into public.overlay_state (id, state)
values ('main', '{}'::jsonb)
on conflict (id) do nothing;

alter table public.overlay_state enable row level security;

create policy "Anyone can read overlay state"
on public.overlay_state for select
using (true);

create policy "Anyone can update overlay state"
on public.overlay_state for update
using (true)
with check (true);

alter publication supabase_realtime add table public.overlay_state;
