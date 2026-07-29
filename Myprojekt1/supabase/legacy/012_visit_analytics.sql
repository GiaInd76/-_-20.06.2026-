-- Счетчик посещений для админ-кабинета.
-- Таблица хранит легкие события просмотра страниц без персональных данных.

create table if not exists public.visit_events (
    id uuid primary key default gen_random_uuid(),
    market_id uuid references public.markets(id) on delete set null,
    path text not null default '',
    page_type text not null default '',
    seller_id uuid references public.shops(id) on delete set null,
    category text not null default '',
    session_id text not null,
    user_agent text not null default '',
    created_at timestamptz not null default now()
);

create index if not exists visit_events_created_at_idx
on public.visit_events (created_at desc);

create index if not exists visit_events_market_created_idx
on public.visit_events (market_id, created_at desc);

create index if not exists visit_events_page_created_idx
on public.visit_events (page_type, created_at desc);

create index if not exists visit_events_seller_created_idx
on public.visit_events (seller_id, created_at desc);

alter table public.visit_events enable row level security;

drop policy if exists "Посещения можно записывать всем" on public.visit_events;
create policy "Посещения можно записывать всем"
on public.visit_events for insert
with check (true);

drop policy if exists "Админы читают посещения" on public.visit_events;
create policy "Админы читают посещения"
on public.visit_events for select
to authenticated
using (
    exists (
        select 1
        from public.admin_users
        where admin_users.user_id = auth.uid()
    )
);

notify pgrst, 'reload schema';
