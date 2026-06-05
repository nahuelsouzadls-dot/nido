export type CategoriaDefault = {
  nombre: string;
  icono: string;
  color: string;
};

export const CATEGORIAS_DEFAULT: CategoriaDefault[] = [
  { nombre: 'Supermercado', icono: '🛒', color: '#34C759' },
  { nombre: 'Hogar', icono: '🏠', color: '#5E5CE6' },
  { nombre: 'Servicios', icono: '💡', color: '#FFB84D' },
  { nombre: 'Transporte', icono: '🚗', color: '#32ADE6' },
  { nombre: 'Mascotas', icono: '🐾', color: '#FF9F0A' },
  { nombre: 'Salidas', icono: '🍽️', color: '#FF375F' },
  { nombre: 'Salud', icono: '💊', color: '#30D158' },
  { nombre: 'Otros', icono: '📦', color: '#8E8E93' },
];
