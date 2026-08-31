# База данных «Ринок Онлайн»

В этой папке есть один актуальный файл состояния:

- `current_schema.sql` — полная схема проекта, политики безопасности, индексы,
  Storage и стартовые рынки. Файл можно повторно запускать в Supabase SQL Editor:
  он не удаляет пользовательские данные.

## Как работать дальше

1. Новое изменение базы сначала оформляется отдельным файлом в `migrations/`.
2. Имя: `YYYYMMDD_NNN_короткое_название.sql`.
3. Запущенная миграция больше не редактируется и не запускается второй раз без
   явной необходимости.
4. После проверки то же изменение переносится в `current_schema.sql`, чтобы
   новая чистая база всегда создавалась одним файлом.

Пример имени:

`20260803_001_add_support_messages.sql`

## Регистрация и защита от ботов

После публикации основного домена в Supabase Dashboard необходимо:

1. В `Authentication → URL Configuration` указать основной HTTPS-домен как
   Site URL и разрешить callback `https://ВАШ-ДОМЕН/auth.html`.
2. Создать Cloudflare Turnstile widget для основного и тестового доменов.
3. В `Authentication → Bot and Abuse Protection` включить Turnstile и сохранить
   секретный ключ только в Dashboard.
4. Публичный Site Key записать в `content` элемента
   `<meta name="turnstile-site-key">` в `src/auth.html`.
5. Не включать CAPTCHA в Dashboard до публикации Site Key во frontend, иначе
   вход, регистрация и восстановление пароля будут отклоняться Supabase.

Для текущего изменения применить в SQL Editor только миграцию
`migrations/20260831_registration_moderation.sql`, предварительно сохранив
резервную копию и проверив существующие строки `shops`.

## Администратор

Назначение администратора — это данные, а не часть схемы. После регистрации
нужного аккаунта выполните отдельно в SQL Editor:

```sql
insert into public.admin_users (user_id, email)
select id, email
from auth.users
where lower(email) = lower('your-email@example.com')
on conflict (user_id) do update
set email = excluded.email;
```

## Архив

`legacy/` содержит старые скрипты только для истории. Их больше не нужно
запускать. Они заменены файлом `current_schema.sql`.
