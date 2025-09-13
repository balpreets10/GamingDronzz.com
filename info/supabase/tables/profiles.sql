create table public.profiles (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  email text not null,
  full_name text null,
  avatar_url text null,
  role text not null default 'user'::text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  is_verified boolean null default false,
  is_active boolean null default true,
  last_login_at timestamp with time zone null,
  login_count integer null default 0,
  constraint profiles_pkey primary key (id),
  constraint profiles_user_id_key unique (user_id),
  constraint profiles_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE,
  constraint profiles_role_check check ((role = any (array['user'::text, 'admin'::text])))
) TABLESPACE pg_default;

create index IF not exists profiles_user_id_idx on public.profiles using btree (user_id) TABLESPACE pg_default;

create index IF not exists profiles_role_idx on public.profiles using btree (role) TABLESPACE pg_default;

create index IF not exists profiles_email_idx on public.profiles using btree (email) TABLESPACE pg_default;

create trigger update_profiles_updated_at BEFORE
update on profiles for EACH row
execute FUNCTION update_updated_at_column ();