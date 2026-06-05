import { format, formatDistanceToNow, isToday, isYesterday, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export function formatMonto(monto: number): string {
  return `$${monto.toLocaleString('es-UY', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function formatFechaRelativa(fecha: string): string {
  const date = parseISO(fecha);
  if (isToday(date)) return 'Hoy';
  if (isYesterday(date)) return 'Ayer';
  return format(date, "d 'de' MMMM", { locale: es });
}

export function formatFechaCorta(fecha: string): string {
  return format(parseISO(fecha), 'dd/MM', { locale: es });
}

export function formatTiempoRelativo(fecha: string): string {
  return formatDistanceToNow(parseISO(fecha), { addSuffix: true, locale: es });
}

export function formatMes(mes: number, anio: number): string {
  const date = new Date(anio, mes - 1, 1);
  return format(date, 'MMMM yyyy', { locale: es });
}

export function capFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function iniciales(nombre: string): string {
  return nombre
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
