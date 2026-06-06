export type CategoriaDefault = {
  nombre: string;
  icono: string;
  color: string;
};

export const CATEGORIAS_DEFAULT: CategoriaDefault[] = [
  { nombre: 'Supermercado', icono: 'cart-outline',           color: '#5A7A48' },
  { nombre: 'Hogar',        icono: 'home-outline',           color: '#6B2D3E' },
  { nombre: 'Servicios',    icono: 'lightning-bolt',         color: '#8B3A20' },
  { nombre: 'Transporte',   icono: 'car-outline',            color: '#4A6B8A' },
  { nombre: 'Mascotas',     icono: 'paw-outline',            color: '#8A6B4A' },
  { nombre: 'Salidas',      icono: 'silverware-fork-knife',  color: '#8B2D5A' },
  { nombre: 'Salud',        icono: 'medical-bag',            color: '#2D6B5A' },
  { nombre: 'Otros',        icono: 'dots-horizontal',        color: '#6E6E73' },
];
