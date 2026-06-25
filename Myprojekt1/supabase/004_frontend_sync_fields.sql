-- Поля, которые нужны текущему интерфейсу Привоз Онлайн.
-- Можно запускать повторно: команды аккуратно добавляют только недостающее.

alter table public.shops
    add column if not exists cover_url text,
    add column if not exists featured_product_ids text[];

alter table public.products
    alter column price type text using price::text,
    add column if not exists department text,
    add column if not exists price_label text,
    add column if not exists image_url text,
    add column if not exists image_urls text[],
    add column if not exists updated_at timestamptz default now(),
    add column if not exists price_changed_at timestamptz;

alter table public.shops enable row level security;
alter table public.products enable row level security;

-- Базовые права: покупатели читают, вошедший продавец меняет только свою лавку.
do $$
begin
    if not exists (
        select 1 from pg_policies
        where schemaname = 'public'
            and tablename = 'shops'
            and policyname = 'Public shops are readable'
    ) then
        create policy "Public shops are readable"
        on public.shops for select
        using (true);
    end if;

    if not exists (
        select 1 from pg_policies
        where schemaname = 'public'
            and tablename = 'shops'
            and policyname = 'Shop owner can create shop'
    ) then
        create policy "Shop owner can create shop"
        on public.shops for insert
        to authenticated
        with check (owner_id = auth.uid());
    end if;

    if not exists (
        select 1 from pg_policies
        where schemaname = 'public'
            and tablename = 'shops'
            and policyname = 'Shop owner can update shop'
    ) then
        create policy "Shop owner can update shop"
        on public.shops for update
        to authenticated
        using (owner_id = auth.uid())
        with check (owner_id = auth.uid());
    end if;

    if not exists (
        select 1 from pg_policies
        where schemaname = 'public'
            and tablename = 'shops'
            and policyname = 'Shop owner can delete shop'
    ) then
        create policy "Shop owner can delete shop"
        on public.shops for delete
        to authenticated
        using (owner_id = auth.uid());
    end if;

    if not exists (
        select 1 from pg_policies
        where schemaname = 'public'
            and tablename = 'products'
            and policyname = 'Public products are readable'
    ) then
        create policy "Public products are readable"
        on public.products for select
        using (true);
    end if;

    if not exists (
        select 1 from pg_policies
        where schemaname = 'public'
            and tablename = 'products'
            and policyname = 'Shop owner can create products'
    ) then
        create policy "Shop owner can create products"
        on public.products for insert
        to authenticated
        with check (
            exists (
                select 1 from public.shops
                where shops.id = products.shop_id
                    and shops.owner_id = auth.uid()
            )
        );
    end if;

    if not exists (
        select 1 from pg_policies
        where schemaname = 'public'
            and tablename = 'products'
            and policyname = 'Shop owner can update products'
    ) then
        create policy "Shop owner can update products"
        on public.products for update
        to authenticated
        using (
            exists (
                select 1 from public.shops
                where shops.id = products.shop_id
                    and shops.owner_id = auth.uid()
            )
        )
        with check (
            exists (
                select 1 from public.shops
                where shops.id = products.shop_id
                    and shops.owner_id = auth.uid()
            )
        );
    end if;

    if not exists (
        select 1 from pg_policies
        where schemaname = 'public'
            and tablename = 'products'
            and policyname = 'Shop owner can delete products'
    ) then
        create policy "Shop owner can delete products"
        on public.products for delete
        to authenticated
        using (
            exists (
                select 1 from public.shops
                where shops.id = products.shop_id
                    and shops.owner_id = auth.uid()
            )
        );
    end if;
end $$;

-- Хранилище фотографий: чтение публичное, запись только для вошедших продавцов.
do $$
begin
    if not exists (
        select 1 from pg_policies
        where schemaname = 'storage'
            and tablename = 'objects'
            and policyname = 'Public product images are readable'
    ) then
        create policy "Public product images are readable"
        on storage.objects for select
        using (bucket_id = 'product-images');
    end if;

    if not exists (
        select 1 from pg_policies
        where schemaname = 'storage'
            and tablename = 'objects'
            and policyname = 'Sellers can upload product images'
    ) then
        create policy "Sellers can upload product images"
        on storage.objects for insert
        to authenticated
        with check (
            bucket_id = 'product-images'
            and (storage.foldername(name))[1] = auth.uid()::text
        );
    end if;

    if not exists (
        select 1 from pg_policies
        where schemaname = 'storage'
            and tablename = 'objects'
            and policyname = 'Sellers can update own product images'
    ) then
        create policy "Sellers can update own product images"
        on storage.objects for update
        to authenticated
        using (
            bucket_id = 'product-images'
            and (storage.foldername(name))[1] = auth.uid()::text
        );
    end if;

    if not exists (
        select 1 from pg_policies
        where schemaname = 'storage'
            and tablename = 'objects'
            and policyname = 'Sellers can delete own product images'
    ) then
        create policy "Sellers can delete own product images"
        on storage.objects for delete
        to authenticated
        using (
            bucket_id = 'product-images'
            and (storage.foldername(name))[1] = auth.uid()::text
        );
    end if;
end $$;
