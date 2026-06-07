-- Migración 008: Espacio Personal
-- Agrega soporte de scope (hogar | personal) a gastos, facturas y objetivos,
-- crea la tabla ingresos y establece las políticas RLS correspondientes.
--
-- IDEMPOTENCIA: esta migración puede ejecutarse más de una vez sin error.
-- Todas las operaciones usan IF NOT EXISTS, DROP IF EXISTS, o bloques DO
-- con manejo de excepciones para ignorar el error "already exists".
--
-- VERIFICACIÓN DE NOMBRES: antes de ejecutar, confirmar en Supabase que
-- las políticas hogar se llaman exactamente:
--   gastos_hogar, facturas_hogar, objetivos_hogar
-- Ejecutar en SQL Editor:
--   SELECT policyname, tablename FROM pg_policies
--   WHERE tablename IN ('gastos', 'facturas', 'objetivos')
--   ORDER BY tablename, policyname;

-- ────────────────────────────────────────────────────────────────────────────
-- 1. Tabla: gastos — agregar scope y categoria_texto
-- ────────────────────────────────────────────────────────────────────────────

ALTER TABLE gastos
  ADD COLUMN IF NOT EXISTS scope TEXT NOT NULL DEFAULT 'hogar'
    CHECK (scope IN ('hogar', 'personal')),
  ADD COLUMN IF NOT EXISTS categoria_texto TEXT;

-- ────────────────────────────────────────────────────────────────────────────
-- 2. Tabla: facturas — agregar scope y creado_por
-- ────────────────────────────────────────────────────────────────────────────

ALTER TABLE facturas
  ADD COLUMN IF NOT EXISTS scope TEXT NOT NULL DEFAULT 'hogar'
    CHECK (scope IN ('hogar', 'personal')),
  ADD COLUMN IF NOT EXISTS creado_por UUID REFERENCES auth.users(id);

-- ────────────────────────────────────────────────────────────────────────────
-- 3. Tabla: objetivos — agregar scope y user_id
-- ────────────────────────────────────────────────────────────────────────────

ALTER TABLE objetivos
  ADD COLUMN IF NOT EXISTS scope TEXT NOT NULL DEFAULT 'hogar'
    CHECK (scope IN ('hogar', 'personal')),
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- ────────────────────────────────────────────────────────────────────────────
-- 4. Tabla nueva: ingresos
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS ingresos (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hogar_id    UUID NOT NULL REFERENCES hogares(id) ON DELETE CASCADE,
  monto       NUMERIC(12,2) NOT NULL,
  descripcion TEXT,
  categoria   TEXT,
  fecha       DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ────────────────────────────────────────────────────────────────────────────
-- 5. CRÍTICO: Actualizar políticas hogar existentes para excluir scope='personal'
--
-- Postgres evalúa políticas PERMISSIVE con OR: un registro es accesible si
-- CUALQUIER política lo permite. Sin AND scope='hogar', la política hogar
-- (hogar_id = mi_hogar_id()) devuelve TRUE para todos los registros del
-- hogar incluyendo los personales del compañero, anulando el aislamiento.
--
-- Usamos DROP IF EXISTS + CREATE en lugar de ALTER POLICY para garantizar
-- que la condición sea exactamente la deseada sin importar el estado previo.
-- ────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "gastos_hogar" ON gastos;
CREATE POLICY "gastos_hogar"
  ON gastos FOR ALL
  USING (hogar_id = mi_hogar_id() AND scope = 'hogar')
  WITH CHECK (hogar_id = mi_hogar_id() AND scope = 'hogar');

DROP POLICY IF EXISTS "facturas_hogar" ON facturas;
CREATE POLICY "facturas_hogar"
  ON facturas FOR ALL
  USING (hogar_id = mi_hogar_id() AND scope = 'hogar')
  WITH CHECK (hogar_id = mi_hogar_id() AND scope = 'hogar');

DROP POLICY IF EXISTS "objetivos_hogar" ON objetivos;
CREATE POLICY "objetivos_hogar"
  ON objetivos FOR ALL
  USING (hogar_id = mi_hogar_id() AND scope = 'hogar')
  WITH CHECK (hogar_id = mi_hogar_id() AND scope = 'hogar');

-- ────────────────────────────────────────────────────────────────────────────
-- 6. RLS: ingresos (solo el dueño puede ver y modificar los suyos)
-- ────────────────────────────────────────────────────────────────────────────

ALTER TABLE ingresos ENABLE ROW LEVEL SECURITY;

-- DROP + CREATE para idempotencia (no existe CREATE POLICY IF NOT EXISTS en PG)
DROP POLICY IF EXISTS "ingresos: solo el dueño" ON ingresos;
CREATE POLICY "ingresos: solo el dueño"
  ON ingresos FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────────────────────
-- 7. RLS: gastos personales (solo el creador los ve y modifica)
--
-- pagado_por es uuid references perfiles(id), y perfiles.id = auth.uid(),
-- así que auth.uid() = pagado_por identifica inequívocamente al creador.
-- ────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "gastos personales: solo creador" ON gastos;
CREATE POLICY "gastos personales: solo creador"
  ON gastos FOR ALL
  USING (scope = 'personal' AND auth.uid() = pagado_por)
  WITH CHECK (scope = 'personal' AND auth.uid() = pagado_por);

-- ────────────────────────────────────────────────────────────────────────────
-- 8. RLS: facturas personales
-- ────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "facturas personales: solo creador" ON facturas;
CREATE POLICY "facturas personales: solo creador"
  ON facturas FOR ALL
  USING (scope = 'personal' AND auth.uid() = creado_por)
  WITH CHECK (scope = 'personal' AND auth.uid() = creado_por);

-- ────────────────────────────────────────────────────────────────────────────
-- 9. RLS: objetivos personales
-- ────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "objetivos personales: solo creador" ON objetivos;
CREATE POLICY "objetivos personales: solo creador"
  ON objetivos FOR ALL
  USING (scope = 'personal' AND auth.uid() = user_id)
  WITH CHECK (scope = 'personal' AND auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────────────────────
-- 10. Índices para performance en queries filtrados por scope
-- ────────────────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_gastos_scope    ON gastos(hogar_id, scope, fecha DESC);
CREATE INDEX IF NOT EXISTS idx_facturas_scope  ON facturas(hogar_id, scope, activa);
CREATE INDEX IF NOT EXISTS idx_objetivos_scope ON objetivos(hogar_id, scope);
CREATE INDEX IF NOT EXISTS idx_ingresos_user   ON ingresos(user_id, hogar_id, fecha DESC);

-- ────────────────────────────────────────────────────────────────────────────
-- VERIFICACIÓN POST-EJECUCIÓN
-- Confirmar el estado final de las políticas con:
--
--   SELECT tablename, policyname, cmd, qual
--   FROM pg_policies
--   WHERE tablename IN ('gastos', 'facturas', 'objetivos', 'ingresos')
--   ORDER BY tablename, policyname;
--
-- Resultado esperado por tabla:
--   gastos:   gastos_hogar (scope='hogar'), gastos personales: solo creador
--   facturas: facturas_hogar (scope='hogar'), facturas personales: solo creador
--   objetivos: objetivos_hogar (scope='hogar'), objetivos personales: solo creador
--   ingresos: ingresos: solo el dueño
-- ────────────────────────────────────────────────────────────────────────────
