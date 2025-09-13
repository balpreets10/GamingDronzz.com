create table public.services (
  id uuid not null default gen_random_uuid (),
  title text not null,
  slug text not null,
  short_description text not null,
  detailed_description text null,
  icon text null,
  category public.service_category not null,
  features text[] null default '{}'::text[],
  technologies text[] null default '{}'::text[],
  pricing_model text null,
  base_price numeric(10, 2) null,
  currency text null default 'USD'::text,
  duration_estimate text null,
  deliverables text[] null,
  requirements text[] null,
  published boolean null default true,
  featured boolean null default false,
  order_priority integer null default 0,
  seo_title text null,
  seo_description text null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  created_by uuid null,
  constraint services_pkey primary key (id),
  constraint services_slug_key unique (slug),
  constraint services_created_by_fkey foreign KEY (created_by) references auth.users (id)
) TABLESPACE pg_default;

create index IF not exists idx_services_category on public.services using btree (category) TABLESPACE pg_default;

create index IF not exists idx_services_featured on public.services using btree (featured) TABLESPACE pg_default
where
  (featured = true);

create index IF not exists idx_services_published on public.services using btree (published) TABLESPACE pg_default
where
  (published = true);

create trigger update_services_updated_at BEFORE
update on services for EACH row
execute FUNCTION update_updated_at_column ();