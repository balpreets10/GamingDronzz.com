create table public.inquiries (
  id uuid not null default gen_random_uuid (),
  name text not null,
  email text not null,
  company text null,
  phone text null,
  subject text not null,
  message text not null,
  service_interest uuid null,
  project_budget text null,
  timeline text null,
  status text null default 'new'::text,
  priority integer null default 0,
  notes text null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  assigned_to uuid null,
  constraint inquiries_pkey primary key (id),
  constraint inquiries_assigned_to_fkey foreign KEY (assigned_to) references auth.users (id),
  constraint inquiries_service_interest_fkey foreign KEY (service_interest) references services (id)
) TABLESPACE pg_default;

create index IF not exists idx_inquiries_status on public.inquiries using btree (status) TABLESPACE pg_default;

create index IF not exists idx_inquiries_created_at on public.inquiries using btree (created_at desc) TABLESPACE pg_default;

create trigger update_inquiries_updated_at BEFORE
update on inquiries for EACH row
execute FUNCTION update_updated_at_column ();