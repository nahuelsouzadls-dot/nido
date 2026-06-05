-- ============================================================
-- NIDO — Trigger: auto-crea fila en perfiles cuando se registra
-- un usuario nuevo en auth.users.
--
-- Soluciona el caso de confirmación de email: cuando Supabase
-- requiere confirmar el email, la app no tiene sesión en el
-- momento del signup y no puede hacer INSERT desde el cliente.
-- Este trigger corre en el servidor y siempre se ejecuta.
--
-- El nombre se toma de raw_user_meta_data->>'nombre' (pasado
-- en options.data al llamar a supabase.auth.signUp). Si no está,
-- usa la parte local del email como fallback.
-- ============================================================

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.perfiles (id, nombre)
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data->>'nombre'), ''),
      split_part(new.email, '@', 1)
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Crea el trigger (o lo reemplaza si ya existe)
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
