create table public.testimonials (
  id uuid not null default gen_random_uuid (),
  name text not null,
  company text null,
  position text null,
  content text not null,
  rating integer null,
  avatar_url text null,
  project_id uuid null,
  service_id uuid null,
  published boolean null default true,
  featured boolean null default false,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint testimonials_pkey primary key (id),
  constraint testimonials_project_id_fkey foreign KEY (project_id) references projects (id),
  constraint testimonials_service_id_fkey foreign KEY (service_id) references services (id),
  constraint testimonials_rating_check check (
    (
      (rating >= 1)
      and (rating <= 5)
    )
  )
) TABLESPACE pg_default;