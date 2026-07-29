-- Ремонт схемы Привоз Онлайн для синхронизации фронтенда с Supabase.
-- Файл можно запускать повторно: команды добавляют только то, чего ещё нет.

alter table public.shops
    add column if not exists cover_url text,
    add column if not exists featured_product_ids text[] default '{}';

do $$
declare
    constraint_name text;
begin
    for constraint_name in
        select conname
        from pg_constraint
        where conrelid = 'public.products'::regclass
          and contype = 'c'
          and pg_get_constraintdef(oid) ilike '%price%'
    loop
        execute format('alter table public.products drop constraint if exists %I', constraint_name);
    end loop;
end $$;

alter table public.products
    alter column price type text using price::text,
    add column if not exists department text default '',
    add column if not exists price_label text default '',
    add column if not exists image_url text,
    add column if not exists image_urls text[] default '{}',
    add column if not exists updated_at timestamptz default now(),
    add column if not exists price_changed_at timestamptz;

update public.products
set price_label = price
where coalesce(price_label, '') = '';

update public.products
set image_urls = array[image_url]
where image_url is not null
  and (image_urls is null or array_length(image_urls, 1) is null);

alter table public.shops enable row level security;
alter table public.products enable row level security;

create unique index if not exists shops_one_shop_per_owner
    on public.shops(owner_id);

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
begin
    if not exists (
        select 1 from pg_policies
        where schemaname = 'public'
          and tablename = 'shops'
          and policyname = 'Лавки доступны всем'
    ) then
        create policy "Лавки доступны всем"
        on public.shops for select
        using (true);
    end if;

    if not exists (
        select 1 from pg_policies
        where schemaname = 'public'
          and tablename = 'shops'
          and policyname = 'Продавец создаёт свою лавку'
    ) then
        create policy "Продавец создаёт свою лавку"
        on public.shops for insert
        to authenticated
        with check (owner_id = auth.uid());
    end if;

    if not exists (
        select 1 from pg_policies
        where schemaname = 'public'
          and tablename = 'shops'
          and policyname = 'Продавец изменяет свою лавку'
    ) then
        create policy "Продавец изменяет свою лавку"
        on public.shops for update
        to authenticated
        using (owner_id = auth.uid())
        with check (owner_id = auth.uid());
    end if;

    if not exists (
        select 1 from pg_policies
        where schemaname = 'public'
          and tablename = 'shops'
          and policyname = 'Продавец удаляет свою лавку'
    ) then
        create policy "Продавец удаляет свою лавку"
        on public.shops for delete
        to authenticated
        using (owner_id = auth.uid());
    end if;

    if not exists (
        select 1 from pg_policies
        where schemaname = 'public'
          and tablename = 'products'
          and policyname = 'Товары доступны всем'
    ) then
        create policy "Товары доступны всем"
        on public.products for select
        using (true);
    end if;

    if not exists (
        select 1 from pg_policies
        where schemaname = 'public'
          and tablename = 'products'
          and policyname = 'Продавец создаёт товары своей лавки'
    ) then
        create policy "Продавец создаёт товары своей лавки"
        on public.products for insert
        to authenticated
        with check (
            exists (
                select 1
                from public.shops
                where shops.id = products.shop_id
                  and shops.owner_id = auth.uid()
            )
        );
    end if;

    if not exists (
        select 1 from pg_policies
        where schemaname = 'public'
          and tablename = 'products'
          and policyname = 'Продавец изменяет товары своей лавки'
    ) then
        create policy "Продавец изменяет товары своей лавки"
        on public.products for update
        to authenticated
        using (
            exists (
                select 1
                from public.shops
                where shops.id = products.shop_id
                  and shops.owner_id = auth.uid()
            )
        )
        with check (
            exists (
                select 1
                from public.shops
                where shops.id = products.shop_id
                  and shops.owner_id = auth.uid()
            )
        );
    end if;

    if not exists (
        select 1 from pg_policies
        where schemaname = 'public'
          and tablename = 'products'
          and policyname = 'Продавец удаляет товары своей лавки'
    ) then
        create policy "Продавец удаляет товары своей лавки"
        on public.products for delete
        to authenticated
        using (
            exists (
                select 1
                from public.shops
                where shops.id = products.shop_id
                  and shops.owner_id = auth.uid()
            )
        );
    end if;

    if not exists (
        select 1 from pg_policies
        where schemaname = 'storage'
          and tablename = 'objects'
          and policyname = 'Фотографии товаров доступны всем'
    ) then
        create policy "Фотографии товаров доступны всем"
        on storage.objects for select
        using (bucket_id = 'product-images');
    end if;

    if not exists (
        select 1 from pg_policies
        where schemaname = 'storage'
          and tablename = 'objects'
          and policyname = 'Продавец загружает свои фотографии'
    ) then
        create policy "Продавец загружает свои фотографии"
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
          and policyname = 'Продавец изменяет свои фотографии'
    ) then
        create policy "Продавец изменяет свои фотографии"
        on storage.objects for update
        to authenticated
        using (
            bucket_id = 'product-images'
            and (storage.foldername(name))[1] = auth.uid()::text
        )
        with check (
            bucket_id = 'product-images'
            and (storage.foldername(name))[1] = auth.uid()::text
        );
    end if;

    if not exists (
        select 1 from pg_policies
        where schemaname = 'storage'
          and tablename = 'objects'
          and policyname = 'Продавец удаляет свои фотографии'
    ) then
        create policy "Продавец удаляет свои фотографии"
        on storage.objects for delete
        to authenticated
        using (
            bucket_id = 'product-images'
            and (storage.foldername(name))[1] = auth.uid()::text
        );
    end if;
end $$;

notify pgrst, 'reload schema';
