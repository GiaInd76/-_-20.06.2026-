-- Отображаемая цена хранит обычную или оптовую запись: 630, 630/650, 630-650.
alter table public.products
add column if not exists price_label text;
