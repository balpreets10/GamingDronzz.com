create view public.user_roles_view as
select
  id as user_id,
  role,
  role = 'admin'::text as is_admin,
  email
from
  profiles;