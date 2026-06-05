-- ============================================================
-- NIDO — Fix RLS: hogares INSERT bloqueado para usuarios nuevos
-- El policy "for all using" aplicaba la condición también al INSERT.
-- mi_hogar_id() = null para usuarios sin hogar → INSERT rechazado.
-- Solución: separar el policy en operaciones específicas.
-- ============================================================

drop policy if exists "hogar_propio" on hogares;

-- SELECT y UPDATE/DELETE: solo el hogar propio
create policy "hogar_select" on hogares
  for select using (id = mi_hogar_id());

create policy "hogar_update" on hogares
  for update using (id = mi_hogar_id());

create policy "hogar_delete" on hogares
  for delete using (id = mi_hogar_id());

-- INSERT: cualquier usuario autenticado puede crear un hogar
-- (se une a él inmediatamente después en onboarding)
create policy "hogar_insert" on hogares
  for insert with check (auth.uid() is not null);
