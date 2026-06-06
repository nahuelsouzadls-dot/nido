-- ============================================================
-- NIDO — Fix RLS: unirse a hogar falla para usuarios nuevos
--
-- Causa raíz: "hogar_select" usaba id = mi_hogar_id().
-- Para un usuario sin hogar, mi_hogar_id() retorna NULL.
-- En SQL, id = NULL es siempre FALSE → el lookup del código
-- de invitación retornaba 0 filas aunque el código fuera válido.
-- El frontend mostraba "No encontramos ese hogar" con código correcto.
--
-- Solución: usuarios SIN hogar (mi_hogar_id() IS NULL) pueden
-- buscar cualquier hogar por ID para poder unirse. Una vez que
-- tienen hogar, solo ven el suyo.
-- ============================================================

DROP POLICY IF EXISTS "hogar_select" ON hogares;

CREATE POLICY "hogar_select" ON hogares
  FOR SELECT USING (
    id = mi_hogar_id()
    OR (mi_hogar_id() IS NULL AND auth.uid() IS NOT NULL)
  );
