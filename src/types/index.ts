export type Scope = 'hogar' | 'personal';

export type Perfil = {
  id: string;
  nombre: string;
  avatar_url: string | null;
  hogar_id: string | null;
  push_token: string | null;
  created_at: string;
};

export type Hogar = {
  id: string;
  nombre: string;
  foto_url: string | null;
  created_at: string;
};

export type Categoria = {
  id: string;
  hogar_id: string;
  nombre: string;
  icono: string;
  color: string;
  es_sistema: boolean;
};

export type Gasto = {
  id: string;
  hogar_id: string;
  categoria_id: string | null;
  categoria_texto: string | null;
  pagado_por: string;
  monto: number;
  descripcion: string;
  fecha: string;
  observaciones: string | null;
  scope: Scope;
  created_at: string;
  // cuotas
  cuota_numero: number | null;
  cuota_total: number | null;
  cuotas_grupo_id: string | null;
  tarjeta: string | null;
  // joined
  categoria?: Categoria;
  perfil?: Perfil;
  archivos?: GastoArchivo[];
};

export type GastoArchivo = {
  id: string;
  gasto_id: string;
  url: string;
  tipo: 'foto' | 'ticket' | 'comprobante';
  created_at: string;
};

export type Factura = {
  id: string;
  hogar_id: string;
  nombre: string;
  monto: number | null;
  dia_vencimiento: number;
  responsable_id: string | null;
  creado_por: string | null;
  frecuencia: 'mensual' | 'anual';
  activa: boolean;
  scope: Scope;
  created_at: string;
  // joined
  responsable?: Perfil;
  pago_actual?: FacturaPago;
};

export type FacturaPago = {
  id: string;
  factura_id: string;
  hogar_id: string;
  mes: number;
  anio: number;
  monto: number | null;
  estado: 'pendiente' | 'pagada' | 'vencida';
  pagado_por: string | null;
  fecha_pago: string | null;
  created_at: string;
  // joined
  pagador?: Perfil;
};

export type Objetivo = {
  id: string;
  hogar_id: string;
  user_id: string | null;
  nombre: string;
  descripcion: string | null;
  monto_objetivo: number;
  monto_actual: number;
  fecha_objetivo: string | null;
  icono: string;
  completado: boolean;
  scope: Scope;
  created_at: string;
};

export type ObjetivoAporte = {
  id: string;
  objetivo_id: string;
  perfil_id: string;
  monto: number;
  nota: string | null;
  created_at: string;
  perfil?: Perfil;
};

export type Ingreso = {
  id: string;
  user_id: string;
  hogar_id: string;
  monto: number;
  descripcion: string | null;
  categoria: string | null;
  fecha: string;
  created_at: string;
};

export type ActividadTipo =
  | 'gasto_agregado'
  | 'factura_pagada'
  | 'factura_creada'
  | 'objetivo_creado'
  | 'objetivo_completado'
  | 'aporte_objetivo'
  | 'factura_vencida';

export type Actividad = {
  id: string;
  hogar_id: string;
  perfil_id: string | null;
  tipo: ActividadTipo;
  titulo: string;
  descripcion: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  perfil?: Perfil;
};

export type Balance = {
  totalMes: number;
  porcentajeA: number;
  porcentajeB: number;
  montoA: number;
  montoB: number;
  diferencia: number;
  deudor: string | null;
  acreedor: string | null;
  montoDebe: number;
};
