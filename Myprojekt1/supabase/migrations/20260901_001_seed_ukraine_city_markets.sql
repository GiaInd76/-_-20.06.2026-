begin;

insert into public.cities (name, slug, country_code, is_active)
values
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
    ('kyiv', 'Житній ринок', 'zhytnii', 'вул. Верхній Вал, 16'),
    ('kyiv', 'Володимирський ринок', 'volodymyrskyi', 'вул. Антоновича, 115'),
    ('vinnytsia', 'Центральний ринок', 'tsentralnyi', 'просп. Коцюбинського, 13'),
    ('vinnytsia', 'Ринок «Урожай»', 'urozhai', 'вул. Пирогова, 49'),
    ('vinnytsia', 'Ринок «Привокзальний-1»', 'pryvokzalnyi-1', 'вул. Привокзальна, 1-А'),
    ('lviv', 'Краківський ринок', 'krakivskyi', 'вул. Базарна, 11'),
    ('lviv', 'Привокзальний ринок', 'pryvokzalnyi', 'вул. Городоцька, 125'),
    ('lviv', 'Ринок «Шувар»', 'shuvar', 'вул. Хуторівка, 4-Б'),
    ('ivano-frankivsk', 'Центральний ринок', 'tsentralnyi', 'вул. Дністровська, 5'),
    ('ivano-frankivsk', 'Східний ринок', 'skhidnyi', 'вул. Василя Стуса, 23')
) as seed(city_slug, name, slug, address)
on cities.slug = seed.city_slug
on conflict (city_id, slug) do update set
    name = excluded.name,
    address = excluded.address,
    is_active = true,
    updated_at = now();

notify pgrst, 'reload schema';
commit;
