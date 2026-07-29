-- Публичное чтение каталога.
-- Запускать после 008_security_email_owner.sql.
-- Файл можно запускать повторно.

do $$
begin
    if not exists (
        select 1 from pg_policies
        where schemaname = 'public'
          and tablename = 'shops'
          and policyname = 'Anyone can read shops'
    ) then
        create policy "Anyone can read shops"
        on public.shops for select
        to anon, authenticated
        using (true);
    end if;

    if not exists (
        select 1 from pg_policies
        where schemaname = 'public'
          and tablename = 'products'
          and policyname = 'Anyone can read products'
    ) then
        create policy "Anyone can read products"
        on public.products for select
        to anon, authenticated
        using (true);
    end if;
end $$;

notify pgrst, 'reload schema';
