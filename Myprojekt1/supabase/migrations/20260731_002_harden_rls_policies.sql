-- Усиление RLS после аудита 2026-07-31.
-- Не удаляет пользовательские данные и допускает повторный запуск.

begin;

alter table public.cities enable row level security;
alter table public.markets enable row level security;
alter table public.shops enable row level security;
alter table public.products enable row level security;
alter table public.admin_users enable row level security;
alter table public.visit_events enable row level security;

-- Разрешающие RLS-политики складываются через OR. Удаляем старый набор,
-- чтобы забытая широкая политика не обходила новые ограничения.
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

drop policy if exists "public_read_active_markets" on public.markets;
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

drop policy if exists "public_read_shops" on public.shops;
create policy "public_read_shops"
on public.shops for select
to anon, authenticated
using (
    owner_id = (select auth.uid())
    or exists (
        select 1
        from public.markets
        where markets.id = shops.market_id
          and markets.is_active
    )
);

drop policy if exists "admin_read_all_shops" on public.shops;
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

drop policy if exists "owner_insert_shop" on public.shops;
create policy "owner_insert_shop"
on public.shops for insert
to authenticated
with check (
    owner_id = (select auth.uid())
    and exists (
        select 1
        from public.markets
        where markets.id = shops.market_id
          and markets.is_active
    )
);

drop policy if exists "owner_update_shop" on public.shops;
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

drop policy if exists "owner_delete_shop" on public.shops;
create policy "owner_delete_shop"
on public.shops for delete
to authenticated
using (owner_id = (select auth.uid()));

drop policy if exists "admin_delete_shop" on public.shops;
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

drop policy if exists "public_read_products" on public.products;
create policy "public_read_products"
on public.products for select
to anon, authenticated
using (
    exists (
        select 1
        from public.shops
        where shops.id = products.shop_id
    )
);

drop policy if exists "admin_read_all_products" on public.products;
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

drop policy if exists "owner_insert_product" on public.products;
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

drop policy if exists "owner_update_product" on public.products;
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

drop policy if exists "owner_delete_product" on public.products;
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

drop policy if exists "admin_delete_product" on public.products;
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

drop policy if exists "admin_read_own_record" on public.admin_users;
create policy "admin_read_own_record"
on public.admin_users for select
to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "public_insert_visit" on public.visit_events;
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

drop policy if exists "admin_read_visits" on public.visit_events;
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
    and (
        (storage.foldername(name))[2] = 'covers'
        or (
            (storage.foldername(name))[2] = 'products'
            and exists (
                select 1
                from public.shops
                where shops.id::text = (storage.foldername(name))[3]
                  and shops.owner_id = (select auth.uid())
            )
        )
    )
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
    and (
        (storage.foldername(name))[2] = 'covers'
        or (
            (storage.foldername(name))[2] = 'products'
            and exists (
                select 1
                from public.shops
                where shops.id::text = (storage.foldername(name))[3]
                  and shops.owner_id = (select auth.uid())
            )
        )
    )
);

create policy "owner_delete_product_images"
on storage.objects for delete
to authenticated
using (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and (storage.foldername(name))[2] in ('covers', 'products')
);

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

notify pgrst, 'reload schema';

commit;
