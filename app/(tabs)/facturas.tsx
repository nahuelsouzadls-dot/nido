import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Text as RNText,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useSpace } from '@/context/SpaceContext';
import { FacturaCard } from '@/components/FacturaCard';
import { FAB } from '@/components/FAB';
import { ContextSelectorBar } from '@/components/ui/ContextSelectorBar';
import { PrivacyBadge } from '@/components/ui/PrivacyBadge';
import { useFacturas } from '@/hooks/useFacturas';
import { formatMes } from '@/utils/format';

type Filtro = 'todas' | 'pendientes' | 'pagadas';

export default function FacturasScreen() {
  const router = useRouter();
  const colors = useColors();
  const { activeContext } = useSpace();
  const isPersonal = activeContext === 'personal';
  const hoy = new Date();
  const mes = hoy.getMonth() + 1;
  const anio = hoy.getFullYear();

  const { facturas, pagar, eliminar, recargar, todasPagadas } = useFacturas(mes, anio, { scope: activeContext });
  const [filtro, setFiltro] = useState<Filtro>('todas');
  const [refreshing, setRefreshing] = useState(false);

  const refresh = async () => {
    setRefreshing(true);
    await recargar();
    setRefreshing(false);
  };

  const facturasVisibles = facturas.filter((f) => {
    if (filtro === 'pagadas') return f.pago_actual?.estado === 'pagada';
    if (filtro === 'pendientes') return f.pago_actual?.estado !== 'pagada';
    return true;
  });

  const handlePagar = (facturaId: string, monto?: number | null) => {
    pagar(facturaId, monto ?? undefined).catch(() => {
      Alert.alert('Error al pagar', 'No se pudo registrar el pago. Intentá de nuevo.');
    });
  };

  const handleEliminar = (id: string, nombre: string) => {
    Alert.alert(`Eliminar ${nombre}`, '¿Estás seguro? Se eliminará la factura permanentemente.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => eliminar(id) },
    ]);
  };

  const FILTROS: { key: Filtro; label: string }[] = [
    { key: 'todas', label: 'Todas' },
    { key: 'pendientes', label: 'Pendientes' },
    { key: 'pagadas', label: 'Pagadas' },
  ];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <RNText style={[styles.labelCaps, { color: colors.textSecondary }]}>
            {formatMes(mes, anio).toUpperCase()}
          </RNText>
          <RNText style={[styles.title, { color: colors.textPrimary }]}>
            {isPersonal ? 'Mis facturas' : 'Facturas'}
          </RNText>
        </View>
        {todasPagadas ? (
          <View style={[styles.allDoneBadge, { backgroundColor: colors.sageLight }]}>
            <MaterialCommunityIcons name="check" size={12} color={colors.sage} />
            <RNText style={[styles.allDoneText, { color: colors.sageDark }]}>Todo al día</RNText>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/modal/factura')}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="plus" size={18} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      {/* Context selector */}
      <View style={{ paddingHorizontal: 16 }}>
        <ContextSelectorBar />
      </View>

      {/* Filter pills */}
      <View style={styles.filtros}>
        {FILTROS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[
              styles.filtro,
              filtro === f.key
                ? { backgroundColor: '#1E0A10' }
                : { backgroundColor: 'rgba(30,10,16,0.07)' },
            ]}
            onPress={() => setFiltro(f.key)}
            activeOpacity={0.8}
          >
            <RNText style={[
              styles.filtroText,
              { color: filtro === f.key ? '#F5F0F2' : colors.textSecondary },
            ]}>
              {f.label}
            </RNText>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />}
      >
        {facturasVisibles.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIcon, {
              backgroundColor: isPersonal ? colors.personalLight : 'rgba(107,45,62,0.08)',
            }]}>
              <MaterialCommunityIcons
                name="file-document-outline"
                size={26}
                color={isPersonal ? colors.personal : colors.primary}
              />
            </View>
            <RNText style={[styles.emptyTitle, { color: colors.textPrimary }]}>
              {filtro === 'todas'
                ? (isPersonal ? 'Sin facturas personales' : 'Sin facturas todavía')
                : `Sin facturas ${filtro}`}
            </RNText>
            {filtro === 'todas' && (
              <RNText style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                {isPersonal ? 'Plan celular, gimnasio, suscripciones...' : 'Registrá tu primera factura recurrente'}
              </RNText>
            )}
            {filtro === 'todas' && (
              <TouchableOpacity
                style={[styles.emptyBtn, { backgroundColor: isPersonal ? colors.personal : colors.primary }]}
                onPress={() => router.push('/modal/factura')}
                activeOpacity={0.8}
              >
                <RNText style={styles.emptyBtnText}>
                  {isPersonal ? 'Agregar primera factura personal' : 'Agregar primera factura'}
                </RNText>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          facturasVisibles.map((factura) => (
            <FacturaCard
              key={factura.id}
              factura={factura}
              accentColor={isPersonal ? colors.personal : undefined}
              onPagar={() => handlePagar(factura.id, factura.monto)}
              onPress={() =>
                Alert.alert(factura.nombre, undefined, [
                  { text: 'Eliminar', style: 'destructive', onPress: () => handleEliminar(factura.id, factura.nombre) },
                  { text: 'Cerrar', style: 'cancel' },
                ])
              }
            />
          ))
        )}
        {isPersonal && <PrivacyBadge />}
      </ScrollView>

      {/* Payment modal for Android */}
      <FAB />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  labelCaps: { fontFamily: 'Manrope_700Bold', fontSize: 8, letterSpacing: 0.8 },
  title: { fontFamily: 'Manrope_800ExtraBold', fontSize: 20, letterSpacing: -0.4, marginTop: 2 },
  allDoneBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  allDoneText: { fontFamily: 'Manrope_700Bold', fontSize: 10 },
  addBtn: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  filtros: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, paddingBottom: 12 },
  filtro: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  filtroText: { fontFamily: 'Manrope_700Bold', fontSize: 10 },
  scroll: { flex: 1 },
  content: { padding: 16, gap: 10, paddingBottom: 120 },

  // Empty state
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 12 },
  emptyIcon: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  emptyTitle: { fontFamily: 'Manrope_800ExtraBold', fontSize: 15, textAlign: 'center' },
  emptySubtext: { fontFamily: 'Manrope_500Medium', fontSize: 11, textAlign: 'center' },
  emptyBtn: { borderRadius: 13, paddingVertical: 12, paddingHorizontal: 24, marginTop: 8 },
  emptyBtnText: { fontFamily: 'Manrope_700Bold', fontSize: 12, color: '#fff' },

});
