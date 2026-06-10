-- Soporte para compromisos de pago en cuotas modelados como facturas.
-- num_cuotas: cantidad total de cuotas (>1). NULL = factura regular infinita.
-- tarjeta:    tarjeta utilizada para la compra.
-- fecha_inicio: mes desde el cual la factura es activa (primera cuota).
--
-- Una factura con num_cuotas se oculta automáticamente en el cliente
-- cuando el mes actual supera fecha_inicio + num_cuotas meses.

ALTER TABLE facturas
  ADD COLUMN IF NOT EXISTS num_cuotas   INTEGER CHECK (num_cuotas > 1),
  ADD COLUMN IF NOT EXISTS tarjeta      TEXT,
  ADD COLUMN IF NOT EXISTS fecha_inicio DATE;
