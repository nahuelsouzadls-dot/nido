import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text as RNText, Alert, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { formatMonto } from '@/utils/format';
import type { Factura } from '@/types';

type Props = {
  factura: Factura;
  onPagar: () => void;
  onEditar?: () => void;
  onEliminar?: () => void;
  accentColor?: string;
};

function getVencimientoLabel(dia: number): string {
  const hoy = new Date().getDate();
  const diff = dia - hoy;
  if (diff === 0) return 'Vence hoy';
  if (diff === 1) return 'Vence mañana';
  if (diff < 0) return `Venció el día ${dia}`;
  return `Vence el día ${dia}`;
}

export function FacturaCard({ factura, onPagar, onEditar, onEliminar, accentColor }: Props) {
  const colors = useColors();
  const accent = accentColor ?? colors.primary;
  const esPagada = factura.pago_actual?.estado === 'pagada';
  const esVencida = factura.pago_actual?.estado === 'vencida';
  const tieneMenu = !!(onEditar || onEliminar);

  const handlePagar = () => {
    if (esPagada) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPagar();
  };

  const showMenu = () => {
    const opciones: { text: string; style?: 'default' | 'cancel' | 'destructive'; onPress?: () => void }[] = [];
    if (onEditar) opciones.push({ text: 'Editar', onPress: onEditar });
    if (onEliminar) opciones.push({ text: 'Eliminar', style: 'destructive', onPress: onEliminar });
    opciones.push({ text: 'Cancelar', style: 'cancel' });

    if (Platform.OS === 'web') {
      // En web mostramos las acciones disponibles vía window.confirm / navegación directa
      if (onEditar && onEliminar) {
        const accion = window.confirm(`${factura.nombre}\n\nPresioná OK para editar o Cancelar para ver más opciones.`);
        if (accion) { onEditar(); return; }
        if (window.confirm('¿Eliminar esta factura? Esta acción no se puede deshacer.')) onEliminar();
      } else if (onEditar) {
        onEditar();
      } else if (onEliminar) {
        if (window.confirm(`¿Eliminar "${factura.nombre}"? Esta acción no se puede deshacer.`)) onEliminar();
      }
      return;
    }

    Alert.alert(factura.nombre, undefined, opciones);
  };

  const cardBg = esPagada ? colors.cardSage : colors.card;
  const cardBorder = esPagada ? 'rgba(90,122,72,0.2)' : colors.borderSubtle;

  return (
    <View style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
      <View style={styles.top}>
        <View style={{ flex: 1, gap: 2 }}>
          <RNText style={[styles.nombre, { color: colors.textPrimary }]}>{factura.nombre}</RNText>
          {!esPagada && (
            <RNText style={[styles.vencimiento, { color: esVencida ? colors.primaryUrgent : colors.textSecondary }]}>
              {getVencimientoLabel(factura.dia_vencimiento)}
            </RNText>
          )}
          {factura.responsable ? (
            <RNText style={[styles.responsable, { color: colors.textSecondary }]}>
              Compartida con {factura.responsable.nombre.split(' ')[0]}
            </RNText>
          ) : null}
        </View>

        <View style={[styles.badge, { backgroundColor: esPagada ? 'rgba(90,122,72,0.12)' : `${accent}1A` }]}>
          <RNText style={[styles.badgeText, { color: esPagada ? colors.sageDark : accent }]}>
            {esPagada ? 'Pagada' : 'Pendiente'}
          </RNText>
        </View>

        {tieneMenu && (
          <TouchableOpacity
            onPress={showMenu}
            style={styles.menuBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.6}
          >
            <MaterialCommunityIcons name="dots-horizontal" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.bottom}>
        <View>
          {factura.monto ? (
            <RNText style={[styles.monto, { color: esPagada ? colors.sageDark : colors.textPrimary }]}>
              {formatMonto(factura.monto)}
            </RNText>
          ) : (
            <RNText style={[styles.montoVariable, { color: colors.textSecondary }]}>
              Monto variable
            </RNText>
          )}
        </View>

        {!esPagada ? (
          <TouchableOpacity
            style={[styles.botonPagar, { backgroundColor: accent }]}
            onPress={handlePagar}
            activeOpacity={0.8}
          >
            <RNText style={styles.botonLabel}>Pagar</RNText>
          </TouchableOpacity>
        ) : (
          <View style={[styles.pagadoChip, { backgroundColor: 'rgba(90,122,72,0.12)' }]}>
            <MaterialCommunityIcons name="check" size={12} color={colors.sageDark} />
            <RNText style={[styles.pagadoText, { color: colors.sageDark }]}>Listo</RNText>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 0.5,
    padding: 14,
    gap: 12,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  nombre: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 13,
  },
  vencimiento: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 9,
  },
  responsable: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 9,
  },
  badge: {
    borderRadius: 20,
    paddingHorizontal: 7,
    paddingVertical: 2,
    flexShrink: 0,
  },
  badgeText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 8,
  },
  menuBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 2,
  },
  bottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  monto: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 15,
    letterSpacing: -0.3,
  },
  montoVariable: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 11,
  },
  botonPagar: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 13,
  },
  botonLabel: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 12,
    color: '#fff',
  },
  pagadoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 13,
  },
  pagadoText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 11,
  },
});
