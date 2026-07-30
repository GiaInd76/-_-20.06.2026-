begin;

-- Ринки зберігаються у базі; інтерфейс лише читає активні записи.
insert into public.cities (name, slug, country_code)
values ('Одеса', 'odesa', 'UA')
on conflict (slug) do update
set
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
    ''
from public.cities
cross join (
    values
        ('Ринок Привоз', 'privoz', 'вул. Привозна, 14'),
        ('Новий ринок', 'novyi-rynok', 'вул. Торгова, 26'),
        ('Старокінний ринок', 'starokonnyi-rynok', 'вул. Розкидайлівська, 31'),
        ('Промтоварний ринок «7-й кілометр»', '7-kilometr', ''),
        ('Північний ринок', 'severnyi-rynok', 'просп. Добровольського, 114'),
        ('Київський ринок', 'kievskii-rynok', 'вул. Академіка Глушка, 16'),
        ('Малинівський ринок', 'malinovskii-rynok', 'вул. Маршала Бабаджаняна, 40-В'),
        ('Авторинок «Успіх»', 'avtorynok-uspeh', 'просп. Небесної Сотні, 2-А')
) as seed(name, slug, address)
where cities.slug = 'odesa'
on conflict (city_id, slug) do update
set
    name = excluded.name,
    address = excluded.address,
    is_active = true,
    updated_at = now();

notify pgrst, 'reload schema';

commit;
