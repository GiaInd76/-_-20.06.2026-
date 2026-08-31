begin;

alter table public.products enable row level security;

drop policy if exists "owner_insert_product" on public.products;
drop policy if exists "owner_update_product" on public.products;
drop policy if exists "owner_delete_product" on public.products;

create policy "owner_insert_product"
on public.products for insert
to authenticated
with check (
    exists (
        select 1 from public.shops
        where shops.id = products.shop_id
          and shops.owner_id = (select auth.uid())
    )
);

create policy "owner_update_product"
on public.products for update
to authenticated
using (
    exists (
        select 1 from public.shops
        where shops.id = products.shop_id
          and shops.owner_id = (select auth.uid())
    )
)
with check (
    exists (
        select 1 from public.shops
        where shops.id = products.shop_id
          and shops.owner_id = (select auth.uid())
    )
);

create policy "owner_delete_product"
on public.products for delete
to authenticated
using (
    exists (
        select 1 from public.shops
        where shops.id = products.shop_id
          and shops.owner_id = (select auth.uid())
    )
);

drop policy if exists "owner_insert_product_images" on storage.objects;
drop policy if exists "owner_update_product_images" on storage.objects;
drop policy if exists "owner_delete_product_images" on storage.objects;

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

grant insert, update, delete on public.products to authenticated;

notify pgrst, 'reload schema';
commit;
