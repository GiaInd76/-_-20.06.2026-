-- Индексы для быстрых фильтров каталога.
-- Запускать после 009_public_read_policies.sql.
-- Файл можно запускать повторно.

create index if not exists shops_category_created_idx
    on public.shops(category, created_at desc);

create index if not exists products_category_updated_idx
    on public.products(category, updated_at desc);

create index if not exists products_shop_updated_idx
    on public.products(shop_id, updated_at desc);

create index if not exists products_department_idx
    on public.products(department);

create index if not exists products_price_changed_idx
    on public.products(price_changed_at desc)
    where price_changed_at is not null;

notify pgrst, 'reload schema';
