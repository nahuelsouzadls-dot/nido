-- ============================================================
-- NIDO — Esquema completo de base de datos
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- Habilitar extensión para UUID
create extension if not exists "uuid-ossp";

-- ============================================================
-- TABLAS
-- ============================================================

-- Hogares
create table if not exists hogares (
  id         uuid primary key default uuid_generate_v4(),
  nombre     text not null,
  foto_url   text,
  created_at timestamptz default now()
);

-- Perfiles (extiende auth.users)
create table if not exists perfiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  nombre     text not null,
  avatar_url text,
  hogar_id   uuid references hogares(id) on delete set null,
  push_token text,
  created_at timestamptz default now()
);

-- Categorías
create table if not exists categorias (
  id         uuid primary key default uuid_generate_v4(),
  hogar_id   uuid not null references hogares(id) on delete cascade,
  nombre     text not null,
  icono      text not null,
  color      text,
  es_sistema boolean default false,
  created_at timestamptz default now()
);

-- Gastos
create table if not exists gastos (
  id            uuid primary key default uuid_generate_v4(),
  hogar_id      uuid not null references hogares(id) on delete cascade,
  categoria_id  uuid references categorias(id) on delete set null,
  pagado_por    uuid not null references perfiles(id) on delete restrict,
  monto         numeric(10,2) not null check (monto > 0),
  descripcion   text not null,
  fecha         date not null default current_date,
  observaciones text,
  created_at    timestamptz default now()
);

-- Archivos adjuntos a gastos
create table if not exists gastos_archivos (
  id         uuid primary key default uuid_generate_v4(),
  gasto_id   uuid not null references gastos(id) on delete cascade,
  url        text not null,
  tipo       text not null default 'foto',
  created_at timestamptz default now()
);

-- Facturas recurrentes
create table if not exists facturas (
  id               uuid primary key default uuid_generate_v4(),
  hogar_id         uuid not null references hogares(id) on delete cascade,
  nombre           text not null,
  monto            numeric(10,2),
  dia_vencimiento  integer not null check (dia_vencimiento between 1 and 31),
  responsable_id   uuid references perfiles(id) on delete set null,
  frecuencia       text not null default 'mensual' check (frecuencia in ('mensual', 'anual')),
  activa           boolean not null default true,
  created_at       timestamptz default now()
);

-- Pagos de facturas por mes
create table if not exists facturas_pagos (
  id          uuid primary key default uuid_generate_v4(),
  factura_id  uuid not null references facturas(id) on delete cascade,
  hogar_id    uuid not null references hogares(id) on delete cascade,
  mes         integer not null check (mes between 1 and 12),
  anio        integer not null,
  monto       numeric(10,2),
  estado      text not null default 'pendiente' check (estado in ('pendiente', 'pagada', 'vencida')),
  pagado_por  uuid references perfiles(id) on delete set null,
  fecha_pago  timestamptz,
  created_at  timestamptz default now(),
  unique (factura_id, mes, anio)
);

-- Objetivos compartidos
create table if not exists objetivos (
  id              uuid primary key default uuid_generate_v4(),
  hogar_id        uuid not null references hogares(id) on delete cascade,
  nombre          text not null,
  descripcion     text,
  monto_objetivo  numeric(10,2) not null check (monto_objetivo > 0),
  monto_actual    numeric(10,2) not null default 0,
  fecha_objetivo  date,
  icono           text not null default '🎯',
  completado      boolean not null default false,
  created_at      timestamptz default now()
);

-- Aportes a objetivos
create table if not exists objetivos_aportes (
  id          uuid primary key default uuid_generate_v4(),
  objetivo_id uuid not null references objetivos(id) on delete cascade,
  perfil_id   uuid not null references perfiles(id) on delete restrict,
  monto       numeric(10,2) not null check (monto > 0),
  nota        text,
  created_at  timestamptz default now()
);

-- Feed de actividad
create table if not exists actividad (
  id          uuid primary key default uuid_generate_v4(),
  hogar_id    uuid not null references hogares(id) on delete cascade,
  perfil_id   uuid references perfiles(id) on delete set null,
  tipo        text not null,
  titulo      text not null,
  descripcion text,
  metadata    jsonb,
  created_at  timestamptz default now()
);

-- ============================================================
-- ÍNDICES
-- ============================================================

create index if not exists idx_gastos_hogar_fecha    on gastos(hogar_id, fecha desc);
create index if not exists idx_facturas_hogar        on facturas(hogar_id, activa);
create index if not exists idx_facturas_pagos_mes    on facturas_pagos(hogar_id, mes, anio);
create index if not exists idx_objetivos_hogar       on objetivos(hogar_id);
create index if not exists idx_actividad_hogar_fecha on actividad(hogar_id, created_at desc);
create index if not exists idx_perfiles_hogar        on perfiles(hogar_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table hogares          enable row level security;
alter table perfiles         enable row level security;
alter table categorias       enable row level security;
alter table gastos           enable row level security;
alter table gastos_archivos  enable row level security;
alter table facturas         enable row level security;
alter table facturas_pagos   enable row level security;
alter table objetivos        enable row level security;
alter table objetivos_aportes enable row level security;
alter table actividad        enable row level security;

-- ============================================================
-- FUNCIÓN HELPER: obtiene el hogar_id del usuario actual
-- ============================================================

create or replace function mi_hogar_id()
returns uuid
language sql
stable
security definer
as $$
  select hogar_id from perfiles where id = auth.uid()
$$;

-- ============================================================
-- POLÍTICAS RLS
-- Los usuarios solo ven y modifican datos de su hogar
-- ============================================================

-- Hogares: solo ven el suyo
drop policy if exists "hogar_propio" on hogares;
create policy "hogar_propio" on hogares
  for all using (id = mi_hogar_id());

-- Perfiles: ven los de su hogar
drop policy if exists "perfiles_hogar" on perfiles;
create policy "perfiles_hogar" on perfiles
  for select using (hogar_id = mi_hogar_id() or id = auth.uid());

drop policy if exists "perfil_propio_update" on perfiles;
create policy "perfil_propio_update" on perfiles
  for update using (id = auth.uid());

drop policy if exists "perfil_insert" on perfiles;
create policy "perfil_insert" on perfiles
  for insert with check (id = auth.uid());

-- Categorías
drop policy if exists "categorias_hogar" on categorias;
create policy "categorias_hogar" on categorias
  for all using (hogar_id = mi_hogar_id());

-- Gastos
drop policy if exists "gastos_hogar" on gastos;
create policy "gastos_hogar" on gastos
  for all using (hogar_id = mi_hogar_id());

-- Archivos de gastos
drop policy if exists "gastos_archivos_hogar" on gastos_archivos;
create policy "gastos_archivos_hogar" on gastos_archivos
  for all using (
    exists (
      select 1 from gastos g
      where g.id = gasto_id and g.hogar_id = mi_hogar_id()
    )
  );

-- Facturas
drop policy if exists "facturas_hogar" on facturas;
create policy "facturas_hogar" on facturas
  for all using (hogar_id = mi_hogar_id());

-- Pagos de facturas
drop policy if exists "facturas_pagos_hogar" on facturas_pagos;
create policy "facturas_pagos_hogar" on facturas_pagos
  for all using (hogar_id = mi_hogar_id());

-- Objetivos
drop policy if exists "objetivos_hogar" on objetivos;
create policy "objetivos_hogar" on objetivos
  for all using (hogar_id = mi_hogar_id());

-- Aportes a objetivos
drop policy if exists "objetivos_aportes_hogar" on objetivos_aportes;
create policy "objetivos_aportes_hogar" on objetivos_aportes
  for all using (
    exists (
      select 1 from objetivos o
      where o.id = objetivo_id and o.hogar_id = mi_hogar_id()
    )
  );

-- Actividad
drop policy if exists "actividad_hogar" on actividad;
create policy "actividad_hogar" on actividad
  for all using (hogar_id = mi_hogar_id());

-- ============================================================
-- REALTIME — Habilitar publicaciones para tiempo real
-- ============================================================

alter publication supabase_realtime add table actividad;
alter publication supabase_realtime add table gastos;
alter publication supabase_realtime add table facturas_pagos;
alter publication supabase_realtime add table objetivos;
