-- ============================================================
-- NIDO — Función atómica para aportes a objetivos
--
-- Problema: el código JS hacía SELECT → compute → UPDATE en pasos
-- separados. Si dos usuarios aportaban simultáneamente, el segundo
-- UPDATE sobreescribía el resultado del primero, perdiendo un aporte.
--
-- Solución: una función SQL que inserta el aporte y actualiza
-- monto_actual en la misma transacción, usando aritmética directa
-- en el UPDATE (monto_actual + p_monto) en lugar de calcular en JS.
-- ============================================================

CREATE OR REPLACE FUNCTION aportar_objetivo(
  p_objetivo_id UUID,
  p_perfil_id   UUID,
  p_monto       NUMERIC,
  p_nota        TEXT DEFAULT NULL
)
RETURNS objetivos
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_objetivo objetivos;
BEGIN
  INSERT INTO objetivos_aportes (objetivo_id, perfil_id, monto, nota)
  VALUES (p_objetivo_id, p_perfil_id, p_monto, p_nota);

  UPDATE objetivos
  SET
    monto_actual = monto_actual + p_monto,
    completado   = (monto_actual + p_monto >= monto_objetivo)
  WHERE id = p_objetivo_id
  RETURNING * INTO v_objetivo;

  RETURN v_objetivo;
END;
$$;
