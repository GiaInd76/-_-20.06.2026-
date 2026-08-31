begin;

alter table public.shops
    add column if not exists moderation_status text;

update public.shops
set moderation_status = 'active'
where moderation_status is null;

alter table public.shops
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

insert into public.cities (name, slug, country_code, is_active)
values
    ('Одеса', 'odesa', 'UA', true),
    ('Київ', 'kyiv', 'UA', true),
    ('Вінниця', 'vinnytsia', 'UA', true),
    ('Львів', 'lviv', 'UA', true),
    ('Івано-Франківськ', 'ivano-frankivsk', 'UA', true)
on conflict (slug) do update set
    name = excluded.name,
    country_code = excluded.country_code,
    is_active = excluded.is_active,
    updated_at = now();

insert into public.markets (city_id, name, slug, address, description, is_active)
select cities.id, seed.name, seed.slug, seed.address, '', true
from public.cities
join (values
    ('kyiv', 'Бессарабський ринок', 'bessarabskyi', 'Бессарабська площа, 2'),
    ('vinnytsia', 'Центральний ринок', 'tsentralnyi', 'просп. Коцюбинського, 13'),
    ('lviv', 'Краківський ринок', 'krakivskyi', 'вул. Базарна, 11'),
    ('ivano-frankivsk', 'Центральний ринок', 'tsentralnyi', 'вул. Дністровська, 5')
) as seed(city_slug, name, slug, address)
on cities.slug = seed.city_slug
on conflict (city_id, slug) do update set
    name = excluded.name,
    address = excluded.address,
    is_active = true,
    updated_at = now();

drop policy if exists "public_read_shops" on public.shops;
create policy "public_read_shops"
on public.shops for select
to anon, authenticated
using (
    owner_id = (select auth.uid())
    or (
        moderation_status = 'active'
        and exists (
            select 1 from public.markets
            where markets.id = shops.market_id and markets.is_active
        )
    )
);

drop policy if exists "owner_insert_shop" on public.shops;
create policy "owner_insert_shop"
on public.shops for insert to authenticated
with check (
    owner_id = (select auth.uid())
    and moderation_status = 'pending'
    and exists (
        select 1 from public.markets
        where markets.id = shops.market_id and markets.is_active
    )
);

drop policy if exists "public_read_products" on public.products;
create policy "public_read_products"
on public.products for select
to anon, authenticated
using (
    exists (
        select 1 from public.shops
        join public.markets on markets.id = shops.market_id
        where shops.id = products.shop_id
          and markets.is_active
          and (shops.moderation_status = 'active' or shops.owner_id = (select auth.uid()))
    )
);

drop policy if exists "admin_update_shop" on public.shops;
create policy "admin_update_shop"
on public.shops for update
to authenticated
using (exists (
    select 1 from public.admin_users
    where admin_users.user_id = (select auth.uid())
))
with check (exists (
    select 1 from public.admin_users
    where admin_users.user_id = (select auth.uid())
));

notify pgrst, 'reload schema';
commit;
