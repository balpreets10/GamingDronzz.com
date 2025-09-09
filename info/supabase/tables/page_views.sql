create table public.page_views (
  id uuid not null default gen_random_uuid (),
  page_path text not null,
  page_title text null,
  referrer text null,
  user_agent text null,
  ip_address inet null,
  session_id text null,
  user_id uuid null,
  created_at timestamp with time zone null default now(),
  constraint page_views_pkey primary key (id),
  constraint page_views_user_id_fkey foreign KEY (user_id) references auth.users (id)
) TABLESPACE pg_default;

create index IF not exists idx_page_views_created_at on public.page_views using btree (created_at desc) TABLESPACE pg_default;

create index IF not exists idx_page_views_page_path on public.page_views using btree (page_path) TABLESPACE pg_default;