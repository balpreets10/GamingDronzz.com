create table public.media_files (
  id uuid not null default gen_random_uuid (),
  filename text not null,
  original_filename text not null,
  file_path text not null,
  file_size integer null,
  mime_type text null,
  width integer null,
  height integer null,
  alt_text text null,
  description text null,
  uploaded_by uuid not null,
  created_at timestamp with time zone null default now(),
  constraint media_files_pkey primary key (id),
  constraint media_files_uploaded_by_fkey foreign KEY (uploaded_by) references auth.users (id)
) TABLESPACE pg_default;