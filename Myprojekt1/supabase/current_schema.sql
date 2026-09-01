-- Ринок Онлайн: актуальное состояние базы данных.
-- Версия: 2026-08-31.
--
-- Назначение:
--   1. Развернуть базу с нуля.
--   2. Привести существующую базу проекта к актуальному состоянию.
--
-- Файл можно запускать повторно. Он не удаляет пользовательские данные.

begin;

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- City -> Market -> Trading point (shops) -> Product
-- ---------------------------------------------------------------------------

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

create table if not exists public.shops (
    id uuid primary key default gen_random_uuid(),
    owner_id uuid not null references auth.users(id) on delete cascade,
    market_id uuid references public.markets(id) on delete restrict,
    name text not null,
    description text not null default '',
    category text not null default 'other',
    open_time time,
    close_time time,
    find_info text not null default '',
    phone text not null default '',
    telegram text not null default '',
    instagram text not null default '',
    viber text not null default '',
    cover_url text,
    featured_product_ids text[] not null default '{}',
    moderation_status text not null default 'pending',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.products (
    id uuid primary key default gen_random_uuid(),
    shop_id uuid not null references public.shops(id) on delete cascade,
    name text not null,
    department text not null default '',
    category text not null default 'other',
    price text not null default '',
    price_label text not null default '',
    unit text not null default 'kg',
    description text not null default '',
    image_url text,
    image_urls text[] not null default '{}',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    price_changed_at timestamptz
);

create table if not exists public.admin_users (
    user_id uuid primary key references auth.users(id) on delete cascade,
    email text not null,
    created_at timestamptz not null default now()
);

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

-- ---------------------------------------------------------------------------
-- Совместимость с ранними версиями проекта
-- ---------------------------------------------------------------------------

alter table public.shops
    add column if not exists market_id uuid,
    add column if not exists cover_url text,
    add column if not exists featured_product_ids text[] default '{}',
    add column if not exists updated_at timestamptz default now(),
    add column if not exists moderation_status text;

alter table public.products
    add column if not exists department text default '',
    add column if not exists price_label text default '',
    add column if not exists image_url text,
    add column if not exists image_urls text[] default '{}',
    add column if not exists updated_at timestamptz default now(),
    add column if not exists price_changed_at timestamptz;

-- Раньше price мог быть numeric с проверкой price >= 0.
do $$
declare
    constraint_item record;
begin
    for constraint_item in
        select conname
        from pg_constraint
        where conrelid = 'public.products'::regclass
          and contype = 'c'
          and pg_get_constraintdef(oid) ilike '%price%'
    loop
        execute format(
            'alter table public.products drop constraint if exists %I',
            constraint_item.conname
        );
    end loop;
end
$$;

alter table public.products
    alter column price type text using price::text;

update public.shops
set featured_product_ids = '{}'
where featured_product_ids is null;

update public.shops set moderation_status = 'active' where moderation_status is null;

update public.products
set
    price = coalesce(price, ''),
    department = coalesce(department, ''),
    price_label = coalesce(nullif(price_label, ''), price, ''),
    image_urls = case
        when image_urls is not null and cardinality(image_urls) > 0 then image_urls
        when image_url is not null then array[image_url]
        else '{}'
    end,
    updated_at = coalesce(updated_at, created_at, now());

alter table public.shops
    alter column featured_product_ids set default '{}',
    alter column featured_product_ids set not null,
    alter column updated_at set default now(),
    alter column updated_at set not null,
    alter column moderation_status set default 'pending',
    alter column moderation_status set not null;

alter table public.shops drop constraint if exists shops_moderation_status_check;
alter table public.shops add constraint shops_moderation_status_check
    check (moderation_status in ('draft', 'pending', 'active', 'blocked'));

alter table public.shops drop constraint if exists shops_input_lengths_check;
alter table public.shops add constraint shops_input_lengths_check check (
    char_length(btrim(name)) between 2 and 120
    and char_length(description) <= 1000
    and char_length(find_info) <= 500
    and char_length(phone) <= 50
    and char_length(telegram) <= 200
    and char_length(instagram) <= 200
    and char_length(viber) <= 200
) not valid;

create or replace function public.protect_shop_moderation_status()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
    if new.moderation_status is distinct from old.moderation_status
       and not exists (select 1 from public.admin_users where user_id = auth.uid()) then
        raise exception 'admin-required';
    end if;
    return new;
end;
$$;

drop trigger if exists shops_protect_moderation_status on public.shops;
create trigger shops_protect_moderation_status
before update of moderation_status on public.shops
for each row execute function public.protect_shop_moderation_status();

alter table public.products
    alter column department set default '',
    alter column department set not null,
    alter column price set default '',
    alter column price set not null,
    alter column price_label set default '',
    alter column price_label set not null,
    alter column image_urls set default '{}',
    alter column image_urls set not null,
    alter column updated_at set default now(),
    alter column updated_at set not null;

-- ---------------------------------------------------------------------------
-- Стартовые города и рынки. Интерфейс читает их только из базы.
-- ---------------------------------------------------------------------------

insert into public.cities (name, slug, country_code)
values ('Одеса', 'odesa', 'UA')
on conflict (slug) do update
set
    name = excluded.name,
    country_code = excluded.country_code,
    is_active = true,
    updated_at = now();

insert into public.cities (name, slug, country_code)
values
    ('Київ', 'kyiv', 'UA'),
    ('Вінниця', 'vinnytsia', 'UA'),
    ('Львів', 'lviv', 'UA'),
    ('Івано-Франківськ', 'ivano-frankivsk', 'UA')
on conflict (slug) do update set
    name = excluded.name,
    country_code = excluded.country_code,
    is_active = true,
    updated_at = now();

insert into public.markets (city_id, name, slug, address, description)
select
    cities.id,
    seed.name,
    seed.slug,
    seed.address,
    seed.description
from public.cities
cross join (
    values
        ('Ринок Привоз', 'privoz', 'вул. Привозна, 14', 'Стартовий ринок платформи Ринок Онлайн'),
        ('Новий ринок', 'novyi-rynok', 'вул. Торгова, 26', ''),
        ('Старокінний ринок', 'starokonnyi-rynok', 'вул. Розкидайлівська, 31', ''),
        ('Промтоварний ринок «7-й кілометр»', '7-kilometr', '', ''),
        ('Північний ринок', 'severnyi-rynok', 'просп. Добровольського, 114', ''),
        ('Київський ринок', 'kievskii-rynok', 'вул. Академіка Глушка, 16', ''),
        ('Малинівський ринок', 'malinovskii-rynok', 'вул. Маршала Бабаджаняна, 40-В', ''),
        ('Авторинок «Успіх»', 'avtorynok-uspeh', 'просп. Небесної Сотні, 2-А', '')
) as seed(name, slug, address, description)
where cities.slug = 'odesa'
on conflict (city_id, slug) do update
set
    name = excluded.name,
    address = excluded.address,
    description = excluded.description,
    is_active = true,
    updated_at = now();

insert into public.markets (city_id, name, slug, address, description)
select cities.id, seed.name, seed.slug, seed.address, ''
from public.cities
join (values
    ('kyiv', 'Бессарабський ринок', 'bessarabskyi', 'Бессарабська площа, 2'),
    ('kyiv', 'Житній ринок', 'zhytnii', 'вул. Верхній Вал, 16'),
    ('kyiv', 'Володимирський ринок', 'volodymyrskyi', 'вул. Антоновича, 115'),
    ('vinnytsia', 'Центральний ринок', 'tsentralnyi', 'просп. Коцюбинського, 13'),
    ('vinnytsia', 'Ринок «Урожай»', 'urozhai', 'вул. Пирогова, 49'),
    ('vinnytsia', 'Ринок «Привокзальний-1»', 'pryvokzalnyi-1', 'вул. Привокзальна, 1-А'),
    ('lviv', 'Краківський ринок', 'krakivskyi', 'вул. Базарна, 11'),
    ('lviv', 'Привокзальний ринок', 'pryvokzalnyi', 'вул. Городоцька, 125'),
    ('lviv', 'Ринок «Шувар»', 'shuvar', 'вул. Хуторівка, 4-Б'),
    ('ivano-frankivsk', 'Центральний ринок', 'tsentralnyi', 'вул. Дністровська, 5'),
    ('ivano-frankivsk', 'Східний ринок', 'skhidnyi', 'вул. Василя Стуса, 23')
) as seed(city_slug, name, slug, address)
on cities.slug = seed.city_slug
on conflict (city_id, slug) do update set
    name = excluded.name,
    address = excluded.address,
    is_active = true,
    updated_at = now();

-- Старые торговые точки относятся к Привозу, если рынок ещё не был указан.
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

do $$
begin
    if not exists (
        select 1
        from pg_constraint
        where conrelid = 'public.shops'::regclass
          and conname = 'shops_market_id_fkey'
    ) then
        alter table public.shops
            add constraint shops_market_id_fkey
            foreign key (market_id)
            references public.markets(id)
            on delete restrict;
    end if;

    if not exists (
        select 1
        from pg_constraint
        where conrelid = 'public.products'::regclass
          and conname = 'products_shop_id_fkey'
    ) then
        alter table public.products
            add constraint products_shop_id_fkey
            foreign key (shop_id)
            references public.shops(id)
            on delete cascade;
    end if;
end
$$;

-- ---------------------------------------------------------------------------
-- Автоматические даты
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

create or replace function public.track_product_activity()
returns trigger
language plpgsql
set search_path = public
as $$
begin
    new.updated_at = now();

    if old.price is distinct from new.price
       or old.price_label is distinct from new.price_label then
        new.price_changed_at = now();
    end if;

    return new;
end;
$$;

drop trigger if exists cities_set_updated_at on public.cities;
create trigger cities_set_updated_at
before update on public.cities
for each row execute function public.set_updated_at();

drop trigger if exists markets_set_updated_at on public.markets;
create trigger markets_set_updated_at
before update on public.markets
for each row execute function public.set_updated_at();

drop trigger if exists shops_set_updated_at on public.shops;
create trigger shops_set_updated_at
before update on public.shops
for each row execute function public.set_updated_at();

drop trigger if exists products_track_activity on public.products;
create trigger products_track_activity
before update on public.products
for each row execute function public.track_product_activity();

-- ---------------------------------------------------------------------------
-- Индексы для каталога и админки
-- ---------------------------------------------------------------------------

create unique index if not exists shops_one_shop_per_owner
    on public.shops (owner_id);

create index if not exists cities_slug_idx
    on public.cities (slug);
create index if not exists markets_city_id_idx
    on public.markets (city_id);
create index if not exists markets_city_slug_idx
    on public.markets (city_id, slug);
create index if not exists shops_market_id_idx
    on public.shops (market_id);
create index if not exists shops_market_category_idx
    on public.shops (market_id, category);
create index if not exists shops_category_created_idx
    on public.shops (category, created_at desc);
create index if not exists products_shop_updated_idx
    on public.products (shop_id, updated_at desc);
create index if not exists products_category_updated_idx
    on public.products (category, updated_at desc);
create index if not exists products_department_idx
    on public.products (department);
create index if not exists products_price_changed_idx
    on public.products (price_changed_at desc)
    where price_changed_at is not null;
create index if not exists visit_events_created_at_idx
    on public.visit_events (created_at desc);
create index if not exists visit_events_market_created_idx
    on public.visit_events (market_id, created_at desc);
create index if not exists visit_events_page_created_idx
    on public.visit_events (page_type, created_at desc);
create index if not exists visit_events_seller_created_idx
    on public.visit_events (seller_id, created_at desc);

-- ---------------------------------------------------------------------------
-- RLS: покупатель читает каталог, продавец меняет только свою точку и товары.
-- ---------------------------------------------------------------------------

alter table public.cities enable row level security;
alter table public.markets enable row level security;
alter table public.shops enable row level security;
alter table public.products enable row level security;
alter table public.admin_users enable row level security;
alter table public.visit_events enable row level security;

-- Удаляем накопленные политики приложения и создаём один канонический набор.
do $$
declare
    policy_item record;
begin
    for policy_item in
        select schemaname, tablename, policyname
        from pg_policies
        where schemaname = 'public'
          and tablename in (
              'cities',
              'markets',
              'shops',
              'products',
              'admin_users',
              'visit_events'
          )
    loop
        execute format(
            'drop policy if exists %I on %I.%I',
            policy_item.policyname,
            policy_item.schemaname,
            policy_item.tablename
        );
    end loop;
end
$$;

create policy "public_read_active_cities"
on public.cities for select
to anon, authenticated
using (is_active);

create policy "public_read_active_markets"
on public.markets for select
to anon, authenticated
using (
    is_active
    and exists (
        select 1
        from public.cities
        where cities.id = markets.city_id
          and cities.is_active
    )
);

create policy "public_read_shops"
on public.shops for select
to anon, authenticated
using (
    owner_id = (select auth.uid())
    or (
        moderation_status = 'active'
        and exists (
            select 1
            from public.markets
            where markets.id = shops.market_id
              and markets.is_active
        )
    )
);

create policy "admin_read_all_shops"
on public.shops for select
to authenticated
using (
    exists (
        select 1
        from public.admin_users
        where admin_users.user_id = (select auth.uid())
    )
);

create policy "owner_insert_shop"
on public.shops for insert
to authenticated
with check (
    owner_id = (select auth.uid())
    and moderation_status = 'pending'
    and exists (
        select 1
        from public.markets
        where markets.id = shops.market_id
          and markets.is_active
    )
);

create policy "owner_update_shop"
on public.shops for update
to authenticated
using (owner_id = (select auth.uid()))
with check (
    owner_id = (select auth.uid())
    and exists (
        select 1
        from public.markets
        where markets.id = shops.market_id
          and markets.is_active
    )
);

create policy "owner_delete_shop"
on public.shops for delete
to authenticated
using (owner_id = (select auth.uid()));

create policy "admin_delete_shop"
on public.shops for delete
to authenticated
using (
    exists (
        select 1
        from public.admin_users
        where admin_users.user_id = (select auth.uid())
    )
);

create policy "admin_update_shop"
on public.shops for update
to authenticated
using (
    exists (
        select 1 from public.admin_users
        where admin_users.user_id = (select auth.uid())
    )
)
with check (
    exists (
        select 1 from public.admin_users
        where admin_users.user_id = (select auth.uid())
    )
);

create policy "public_read_products"
on public.products for select
to anon, authenticated
using (
    exists (
        select 1
        from public.shops
        join public.markets on markets.id = shops.market_id
        where shops.id = products.shop_id
          and markets.is_active
          and (shops.moderation_status = 'active' or shops.owner_id = (select auth.uid()))
    )
);

create policy "admin_read_all_products"
on public.products for select
to authenticated
using (
    exists (
        select 1
        from public.admin_users
        where admin_users.user_id = (select auth.uid())
    )
);

create policy "owner_insert_product"
on public.products for insert
to authenticated
with check (
    exists (
        select 1
        from public.shops
        where shops.id = products.shop_id
          and shops.owner_id = (select auth.uid())
    )
);

create policy "owner_update_product"
on public.products for update
to authenticated
using (
    exists (
        select 1
        from public.shops
        where shops.id = products.shop_id
          and shops.owner_id = (select auth.uid())
    )
)
with check (
    exists (
        select 1
        from public.shops
        where shops.id = products.shop_id
          and shops.owner_id = (select auth.uid())
    )
);

create policy "owner_delete_product"
on public.products for delete
to authenticated
using (
    exists (
        select 1
        from public.shops
        where shops.id = products.shop_id
          and shops.owner_id = (select auth.uid())
    )
);

create policy "admin_delete_product"
on public.products for delete
to authenticated
using (
    exists (
        select 1
        from public.admin_users
        where admin_users.user_id = (select auth.uid())
    )
);

create policy "admin_read_own_record"
on public.admin_users for select
to authenticated
using (user_id = (select auth.uid()));

create policy "public_insert_visit"
on public.visit_events for insert
to anon, authenticated
with check (
    char_length(path) <= 500
    and char_length(page_type) <= 64
    and char_length(category) <= 100
    and char_length(session_id) between 8 and 128
    and char_length(user_agent) <= 500
    and (
        market_id is null
        or exists (
            select 1
            from public.markets
            where markets.id = visit_events.market_id
              and markets.is_active
        )
    )
    and (
        seller_id is null
        or exists (
            select 1
            from public.shops
            where shops.id = visit_events.seller_id
              and (
                  visit_events.market_id is null
                  or shops.market_id = visit_events.market_id
              )
        )
    )
);

create policy "admin_read_visits"
on public.visit_events for select
to authenticated
using (
    exists (
        select 1
        from public.admin_users
        where admin_users.user_id = (select auth.uid())
    )
);

-- ---------------------------------------------------------------------------
-- Storage: публичное чтение, запись только в папку текущего пользователя.
-- ---------------------------------------------------------------------------

insert into storage.buckets (
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
)
values (
    'product-images',
    'product-images',
    true,
    2097152,
    array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
    public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

do $$
declare
    policy_item record;
begin
    for policy_item in
        select policyname
        from pg_policies
        where schemaname = 'storage'
          and tablename = 'objects'
          and policyname in (
              'Public product images are readable',
              'Sellers can upload product images',
              'Sellers can update own product images',
              'Sellers can delete own product images',
              'Фотографии товаров доступны всем',
              'Продавец загружает свои фотографии',
              'Продавец изменяет свои фотографии',
              'Продавец удаляет свои фотографии',
              'public_read_product_images',
              'owner_insert_product_images',
              'owner_update_product_images',
              'owner_delete_product_images'
          )
    loop
        execute format(
            'drop policy if exists %I on storage.objects',
            policy_item.policyname
        );
    end loop;
end
$$;

create policy "public_read_product_images"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'product-images');

create policy "owner_insert_product_images"
on storage.objects for insert
to authenticated
with check (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and (storage.foldername(name))[2] in ('covers', 'products')
);

create policy "owner_update_product_images"
on storage.objects for update
to authenticated
using (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and (storage.foldername(name))[2] in ('covers', 'products')
)
with check (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and (storage.foldername(name))[2] in ('covers', 'products')
);

create policy "owner_delete_product_images"
on storage.objects for delete
to authenticated
using (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
);

-- ---------------------------------------------------------------------------
-- API-доступ. RLS остаётся окончательной проверкой каждой строки.
-- ---------------------------------------------------------------------------

revoke all on public.cities, public.markets, public.shops, public.products
    from anon, authenticated;
revoke all on public.admin_users, public.visit_events
    from anon, authenticated;

grant usage on schema public to anon, authenticated;
grant select on public.cities, public.markets, public.shops, public.products
    to anon, authenticated;
grant insert, update, delete on public.shops, public.products
    to authenticated;
grant select on public.admin_users
    to authenticated;
grant insert (
    market_id,
    path,
    page_type,
    seller_id,
    category,
    session_id,
    user_agent
) on public.visit_events to anon, authenticated;
grant select on public.visit_events
    to authenticated;

create or replace view public.trading_points
with (security_invoker = true)
as
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
    shops.moderation_status,
    shops.created_at,
    shops.updated_at
from public.shops;

comment on table public.shops is
    'Compatibility name used by the frontend. Business entity: trading point.';
comment on view public.trading_points is
    'Read-only naming layer for trading points.';

grant select on public.trading_points to anon, authenticated;

notify pgrst, 'reload schema';

commit;
