-- Даты нужны для блока последних предложений на главной странице.
alter table public.products
add column if not exists updated_at timestamptz default now(),
add column if not exists price_changed_at timestamptz;

create or replace function public.track_product_activity()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();

  if old.price is distinct from new.price
     or old.price_label is distinct from new.price_label then
    new.price_changed_at = now();
  end if;

  return new;
end;
$$;

drop trigger if exists products_track_activity on public.products;

create trigger products_track_activity
before update on public.products
for each row execute function public.track_product_activity();
