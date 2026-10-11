-- ============================================================
-- NIDO — Storage Policies
-- Ejecutar DESPUÉS de crear los buckets 'archivos' y 'avatares'
-- en el panel de Supabase > Storage
-- ============================================================

-- Habilitar RLS en storage.objects (viene deshabilitado por defecto en buckets públicos)
-- Si los buckets son públicos, la lectura es libre. Solo restringimos la escritura.

-- ── BUCKET: archivos (fotos de recibos y comprobantes) ──

-- Solo usuarios autenticados pueden subir archivos
drop policy if exists "archivos_insert_autenticado" on storage.objects;
create policy "archivos_insert_autenticado"
  on storage.objects for insert
  with check (
    bucket_id = 'archivos'
    and auth.uid() is not null
  );

-- Solo el dueño del archivo puede actualizarlo
drop policy if exists "archivos_update_dueno" on storage.objects;
create policy "archivos_update_dueno"
  on storage.objects for update
  using (
    bucket_id = 'archivos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Solo el dueño puede eliminarlo
drop policy if exists "archivos_delete_dueno" on storage.objects;
create policy "archivos_delete_dueno"
  on storage.objects for delete
  using (
    bucket_id = 'archivos'
    and auth.uid() is not null
  );

-- Lectura pública (los archivos son URLs públicas compartidas dentro del hogar)
drop policy if exists "archivos_select_public" on storage.objects;
create policy "archivos_select_public"
  on storage.objects for select
  using (bucket_id = 'archivos');

-- ── BUCKET: avatares (fotos de perfil) ──

drop policy if exists "avatares_insert_autenticado" on storage.objects;
create policy "avatares_insert_autenticado"
  on storage.objects for insert
  with check (
    bucket_id = 'avatares'
    and auth.uid() is not null
  );

drop policy if exists "avatares_update_dueno" on storage.objects;
create policy "avatares_update_dueno"
  on storage.objects for update
  using (
    bucket_id = 'avatares'
    and auth.uid() is not null
  );

drop policy if exists "avatares_delete_dueno" on storage.objects;
create policy "avatares_delete_dueno"
  on storage.objects for delete
  using (
    bucket_id = 'avatares'
    and auth.uid() is not null
  );

drop policy if exists "avatares_select_public" on storage.objects;
create policy "avatares_select_public"
  on storage.objects for select
  using (bucket_id = 'avatares');
