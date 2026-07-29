-- Админ-доступ для Привоз Онлайн.
-- Запускается после 006_repair_marketplace_schema.sql.
-- После запуска добавьте себя в admin_users через SQL ниже в конце файла.

create table if not exists public.admin_users (
    user_id uuid primary key references auth.users(id) on delete cascade,
    email text not null,
    created_at timestamptz default now()
);

alter table public.admin_users enable row level security;

do $$
begin
    if not exists (
        select 1 from pg_policies
        where schemaname = 'public'
          and tablename = 'admin_users'
          and policyname = 'Админ видит свою запись'
    ) then
        create policy "Админ видит свою запись"
        on public.admin_users for select
        to authenticated
        using (user_id = auth.uid());
    end if;

    if not exists (
        select 1 from pg_policies
        where schemaname = 'public'
          and tablename = 'shops'
          and policyname = 'Админ удаляет лавки'
    ) then
        create policy "Админ удаляет лавки"
        on public.shops for delete
        to authenticated
        using (
            exists (
                select 1
                from public.admin_users
                where admin_users.user_id = auth.uid()
            )
        );
    end if;

    if not exists (
        select 1 from pg_policies
        where schemaname = 'public'
          and tablename = 'products'
          and policyname = 'Админ удаляет товары'
    ) then
        create policy "Админ удаляет товары"
        on public.products for delete
        to authenticated
        using (
            exists (
                select 1
                from public.admin_users
                where admin_users.user_id = auth.uid()
            )
        );
    end if;
end $$;

notify pgrst, 'reload schema';

-- Чтобы назначить себя админом, замените email и запустите отдельно:
-- insert into public.admin_users (user_id, email)
-- select id, email from auth.users
-- where email = 'your-email@example.com'
-- on conflict (user_id) do nothing;
