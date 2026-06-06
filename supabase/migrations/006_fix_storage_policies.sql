-- ============================================================
-- NIDO — Fix storage policies: permisos demasiado amplios
--
-- Problema original: "avatares_update_dueno", "avatares_delete_dueno"
-- y "archivos_delete_dueno" solo verificaban auth.uid() IS NOT NULL,
-- lo que permitía a CUALQUIER usuario autenticado modificar o eliminar
-- archivos de cualquier otro usuario.
--
-- Fix avatares: el filename es "avatar_{user_id}.jpg" → solo el dueño
-- puede modificar/eliminar su propio archivo (verificable sin joins).
--
-- Fix archivos: los paths no encodean el hogar ni el usuario (patrón:
-- "gastos/gasto_{id}_{timestamp}.jpg"), así que no podemos verificar
-- ownership exacto sin reestructurar los paths. Mínimo viable: requerir
-- que el usuario pertenezca a algún hogar (mi_hogar_id() IS NOT NULL),
-- lo que impide que cuentas recién creadas sin hogar eliminen archivos.
-- ============================================================

-- ── AVATARES ──

DROP POLICY IF EXISTS "avatares_update_dueno" ON storage.objects;
DROP POLICY IF EXISTS "avatares_delete_dueno" ON storage.objects;

CREATE POLICY "avatares_update_dueno" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatares'
    AND name = 'avatar_' || auth.uid()::text || '.jpg'
  );

CREATE POLICY "avatares_delete_dueno" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatares'
    AND name = 'avatar_' || auth.uid()::text || '.jpg'
  );

-- ── ARCHIVOS (comprobantes de gastos) ──

DROP POLICY IF EXISTS "archivos_delete_dueno" ON storage.objects;

CREATE POLICY "archivos_delete_hogar" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'archivos'
    AND mi_hogar_id() IS NOT NULL
  );
