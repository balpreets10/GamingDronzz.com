create table public.articles (
  id uuid not null default gen_random_uuid (),
  title text not null,
  slug text not null,
  excerpt text null,
  content text not null,
  featured_image text null,
  image_alt text null,
  tags text[] null default '{}'::text[],
  category text null,
  published boolean null default false,
  featured boolean null default false,
  view_count integer null default 0,
  reading_time_minutes integer null,
  seo_title text null,
  seo_description text null,
  published_at timestamp with time zone null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  author_id uuid not null,
  constraint articles_pkey primary key (id),
  constraint articles_slug_key unique (slug),
  constraint articles_author_id_fkey foreign KEY (author_id) references auth.users (id)
) TABLESPACE pg_default;

create index IF not exists idx_articles_published on public.articles using btree (published) TABLESPACE pg_default
where
  (published = true);

create index IF not exists idx_articles_featured on public.articles using btree (featured) TABLESPACE pg_default
where
  (featured = true);

create index IF not exists idx_articles_published_at on public.articles using btree (published_at desc) TABLESPACE pg_default;

create trigger update_articles_updated_at BEFORE
update on articles for EACH row
execute FUNCTION update_updated_at_column ();