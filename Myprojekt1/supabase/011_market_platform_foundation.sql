-- Фундамент платформы "Ринок Онлайн".
-- City -> Market -> Trading point -> Products.
-- Важно: таблица shops пока остается рабочей таблицей торговых точек,
-- чтобы не ломать текущий фронтенд. Семантически shops = trading_points.

create table if not exists public.cities (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    slug text not null unique,
    country_code text not null default 'UA',
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.markets (
    id uuid primary key default gen_random_uuid(),
    city_id uuid not null references public.cities(id) on delete restrict,
    name text not null,
    slug text not null,
    address text not null default '',
    description text not null default '',
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (city_id, slug)
);

insert into public.cities (name, slug, country_code)
values ('Одеса', 'odesa', 'UA')
on conflict (slug) do update
set name = excluded.name,
    country_code = excluded.country_code,
    is_active = true,
    updated_at = now();

insert into public.markets (city_id, name, slug, address, description)
select
    cities.id,
    market_seed.name,
    market_seed.slug,
    market_seed.address,
    market_seed.description
from public.cities
cross join (
    values
        ('Ринок Привоз', 'privoz', 'ул. Привозная, 14', 'Стартовый рынок платформы Ринок Онлайн'),
        ('Новый рынок', 'novyi-rynok', 'ул. Торговая, 26', ''),
        ('Староконный рынок', 'starokonnyi-rynok', 'ул. Раскидайловская, 31', ''),
        ('Промтоварный рынок «7-й километр»', '7-kilometr', '', ''),
        ('Северный рынок', 'severnyi-rynok', 'просп. Добровольского, 114', ''),
        ('Киевский рынок', 'kievskii-rynok', 'ул. Академика Глушко, 16', ''),
        ('Малиновский рынок', 'malinovskii-rynok', 'ул. Маршала Бабаджаняна, 40-В', ''),
        ('Авторынок «Успех»', 'avtorynok-uspeh', 'просп. Небесной Сотни, 2-А', '')
) as market_seed(name, slug, address, description)
where cities.slug = 'odesa'
on conflict (city_id, slug) do update
set name = excluded.name,
    address = excluded.address,
    description = excluded.description,
    is_active = true,
    updated_at = now();

alter table public.shops
    add column if not exists market_id uuid references public.markets(id) on delete restrict;

update public.shops
set market_id = (
    select markets.id
    from public.markets
    join public.cities on cities.id = markets.city_id
    where cities.slug = 'odesa'
      and markets.slug = 'privoz'
    limit 1
)
where market_id is null;

alter table public.shops
    alter column market_id set not null;

create index if not exists cities_slug_idx on public.cities (slug);
create index if not exists markets_city_id_idx on public.markets (city_id);
create index if not exists markets_city_slug_idx on public.markets (city_id, slug);
create index if not exists shops_market_id_idx on public.shops (market_id);
create index if not exists shops_market_category_idx on public.shops (market_id, category);
create index if not exists products_shop_id_idx on public.products (shop_id);
create index if not exists products_category_updated_idx on public.products (category, updated_at desc);

alter table public.cities enable row level security;
alter table public.markets enable row level security;

drop policy if exists "Города доступны всем" on public.cities;
create policy "Города доступны всем"
on public.cities for select
using (is_active = true);

drop policy if exists "Рынки доступны всем" on public.markets;
create policy "Рынки доступны всем"
on public.markets for select
using (is_active = true);

create or replace view public.trading_points as
select
    shops.id,
    shops.market_id,
    shops.owner_id,
    shops.name,
    shops.description,
    shops.category,
    shops.open_time,
    shops.close_time,
    shops.find_info,
    shops.phone,
    shops.telegram,
    shops.instagram,
    shops.viber,
    shops.cover_url,
    shops.featured_product_ids,
    shops.created_at
from public.shops;

comment on table public.shops is 'Compatibility table. Business entity: trading point.';
comment on view public.trading_points is 'Read view for the future Trading Point naming layer.';

notify pgrst, 'reload schema';
