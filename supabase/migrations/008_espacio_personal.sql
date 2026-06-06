-- Migración 008: Espacio Personal
-- Agrega soporte de scope (hogar | personal) a gastos, facturas y objetivos,
-- crea la tabla ingresos y establece las políticas RLS correspondientes.

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
-- 5. RLS: ingresos (solo el dueño puede ver y modificar los suyos)
-- ────────────────────────────────────────────────────────────────────────────

ALTER TABLE ingresos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ingresos: solo el dueño"
  ON ingresos FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────────────────────
-- 6. RLS: gastos personales (solo el creador los ve)
-- Las políticas hogar existentes cubren scope='hogar'.
-- Esta cubre scope='personal' adicionalmente (OR entre políticas).
-- ────────────────────────────────────────────────────────────────────────────

CREATE POLICY "gastos personales: solo creador"
  ON gastos FOR ALL
  USING (scope = 'personal' AND auth.uid() = pagado_por)
  WITH CHECK (scope = 'personal' AND auth.uid() = pagado_por);

-- ────────────────────────────────────────────────────────────────────────────
-- 7. RLS: facturas personales
-- ────────────────────────────────────────────────────────────────────────────

CREATE POLICY "facturas personales: solo creador"
  ON facturas FOR ALL
  USING (scope = 'personal' AND auth.uid() = creado_por)
  WITH CHECK (scope = 'personal' AND auth.uid() = creado_por);

-- ────────────────────────────────────────────────────────────────────────────
-- 8. RLS: objetivos personales
-- ────────────────────────────────────────────────────────────────────────────

CREATE POLICY "objetivos personales: solo creador"
  ON objetivos FOR ALL
  USING (scope = 'personal' AND auth.uid() = user_id)
  WITH CHECK (scope = 'personal' AND auth.uid() = user_id);
