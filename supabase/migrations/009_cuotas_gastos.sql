-- Soporte para compras en cuotas y tarjeta asociada.
-- Todos los campos son nullable: gastos existentes no se afectan.

ALTER TABLE gastos
  ADD COLUMN IF NOT EXISTS cuota_numero     INTEGER,
  ADD COLUMN IF NOT EXISTS cuota_total      INTEGER,
  ADD COLUMN IF NOT EXISTS cuotas_grupo_id  UUID,
  ADD COLUMN IF NOT EXISTS tarjeta          TEXT;

-- Índice para agrupar y consultar cuotas de una misma compra
CREATE INDEX IF NOT EXISTS idx_gastos_cuotas_grupo
  ON gastos (cuotas_grupo_id)
  WHERE cuotas_grupo_id IS NOT NULL;
