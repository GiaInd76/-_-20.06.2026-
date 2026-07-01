-- Безопасность регистрации и владения лавкой.
-- Запускать после 006_repair_marketplace_schema.sql и 007_admin_access.sql.
-- Файл можно запускать повторно.
--
-- Подтверждение почты включается не SQL-кодом, а в Supabase Dashboard:
-- Authentication -> Sign In / Providers -> Email -> Confirm email = ON.
-- Authentication -> URL Configuration:
-- Site URL: https://privoz-online.vercel.app
-- Redirect URLs:
--   https://privoz-online.vercel.app/**
--   http://localhost:5500/**

alter table public.shops enable row level security;
alter table public.products enable row level security;
alter table public.admin_users enable row level security;

create unique index if not exists shops_one_shop_per_owner
    on public.shops(owner_id);

create index if not exists shops_owner_id_idx
    on public.shops(owner_id);

create index if not exists products_shop_id_idx
    on public.products(shop_id);

create index if not exists products_updated_at_idx
    on public.products(updated_at desc);

do $$
begin
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
            on delete cascade
            not valid;
    end if;
end $$;

do $$
begin
    if not exists (
        select 1 from pg_policies
        where schemaname = 'public'
          and tablename = 'shops'
          and policyname = 'Owner can select own shop for cabinet checks'
    ) then
        create policy "Owner can select own shop for cabinet checks"
        on public.shops for select
        to authenticated
        using (owner_id = auth.uid());
    end if;

    if not exists (
        select 1 from pg_policies
        where schemaname = 'public'
          and tablename = 'shops'
          and policyname = 'Owner writes only own shop'
    ) then
        create policy "Owner writes only own shop"
        on public.shops for all
        to authenticated
        using (owner_id = auth.uid())
        with check (owner_id = auth.uid());
    end if;

    if not exists (
        select 1 from pg_policies
        where schemaname = 'public'
          and tablename = 'products'
          and policyname = 'Owner writes only products from own shop'
    ) then
        create policy "Owner writes only products from own shop"
        on public.products for all
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
end $$;

notify pgrst, 'reload schema';
