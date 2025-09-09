create table public.projects (
  id uuid not null default gen_random_uuid (),
  title text not null,
  slug text not null,
  description text not null,
  detailed_description text null,
  image_url text null,
  image_alt text null,
  technologies text[] null default '{}'::text[],
  category text not null,
  status text not null,
  client_name text null,
  client_id uuid null,
  year integer not null,
  featured boolean null default false,
  published boolean null default true,
  external_link text null,
  case_study_url text null,
  github_url text null,
  demo_url text null,
  screenshots text[] null default '{}'::text[],
  team_size integer null,
  duration_months integer null,
  budget_range text null,
  challenges text[] null,
  achievements text[] null,
  testimonial text null,
  testimonial_author text null,
  seo_title text null,
  seo_description text null,
  view_count integer null default 0,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  roles text[] null default '{}'::text[],
  images text[] null default '{}'::text[],
  links jsonb null default '{}'::jsonb,
  stats jsonb null default '{}'::jsonb,
  features text[] null default '{}'::text[],
  constraint projects_pkey primary key (id),
  constraint projects_slug_key unique (slug)
) TABLESPACE pg_default;

create index IF not exists idx_projects_featured on public.projects using btree (featured) TABLESPACE pg_default
where
  (featured = true);

create index IF not exists idx_projects_published on public.projects using btree (published) TABLESPACE pg_default
where
  (published = true);

create index IF not exists idx_projects_year on public.projects using btree (year desc) TABLESPACE pg_default;

create index IF not exists idx_projects_created_at on public.projects using btree (created_at desc) TABLESPACE pg_default;

create index IF not exists idx_projects_roles on public.projects using gin (roles) TABLESPACE pg_default;

create index IF not exists idx_projects_features on public.projects using gin (features) TABLESPACE pg_default;

create index IF not exists idx_projects_links on public.projects using gin (links) TABLESPACE pg_default;

create index IF not exists idx_projects_stats on public.projects using gin (stats) TABLESPACE pg_default;

create index IF not exists idx_projects_category on public.projects using btree (category) TABLESPACE pg_default;

create index IF not exists idx_projects_status on public.projects using btree (status) TABLESPACE pg_default;

create trigger update_projects_updated_at BEFORE
update on projects for EACH row
execute FUNCTION update_updated_at_column ();