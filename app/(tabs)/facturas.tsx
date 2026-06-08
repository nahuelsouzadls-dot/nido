import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
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
import { useAuthStore } from '@/store/auth';
import { crearGasto } from '@/services/gastos';
import { formatMes } from '@/utils/format';
import type { Factura } from '@/types';

type Filtro = 'todas' | 'pendientes' | 'pagadas';

export default function FacturasScreen() {
  const router = useRouter();
  const colors = useColors();
  const { activeContext } = useSpace();
  const { perfil, hogar } = useAuthStore();
  const isPersonal = activeContext === 'personal';
  const hoy = new Date();
  const mes = hoy.getMonth() + 1;
  const anio = hoy.getFullYear();

  const { facturas, pagar, despagar, eliminar, recargar, todasPagadas } = useFacturas(mes, anio, { scope: activeContext });

  const puedeModificar = (factura: { scope: string; creado_por: string | null }) => {
    if (factura.scope === 'personal') return factura.creado_por === perfil?.id;
    return true;
  };
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

  const handlePagar = (factura: Factura) => {
    const ejecutarPago = async (montoPersonal?: number) => {
      try {
        await pagar(factura.id, factura.monto ?? undefined);
        if (montoPersonal && montoPersonal > 0 && hogar && perfil) {
          await crearGasto({
            hogar_id: hogar.id,
            categoria_id: null,
            categoria_texto: 'Factura',
            pagado_por: perfil.id,
            monto: montoPersonal,
            descripcion: `Factura · ${factura.nombre}`,
            fecha: new Date().toISOString().split('T')[0],
            observaciones: `factura_ref:${factura.id}`,
            scope: 'personal',
          });
        }
      } catch {
        Alert.alert('Error al pagar', 'No se pudo registrar el pago. Intentá de nuevo.');
      }
    };

    // Facturas personales: solo cambiar estado (ya impactan el balance vía useResumenPersonal)
    // Facturas de hogar sin monto definido: solo cambiar estado
    if (factura.scope === 'personal' || !factura.monto) {
      ejecutarPago();
      return;
    }

    const monto = factura.monto;
    const montoFormateado = `$${monto.toLocaleString('es-UY')}`;

    if (Platform.OS === 'web') {
      const afectar = window.confirm(
        `¿Registrar el impacto de "${factura.nombre}" (${montoFormateado}) en tu balance personal?`,
      );
      if (!afectar) { ejecutarPago(); return; }
      const solo = window.confirm(
        '¿Lo pagaste solo?\n\nAceptar → lo pagué solo   ·   Cancelar → lo dividí',
      );
      ejecutarPago(solo ? monto : monto / 2);
      return;
    }

    Alert.alert(
      '¿Cómo lo pagaste?',
      `${factura.nombre} · ${montoFormateado}`,
      [
        { text: 'Lo pagué solo', onPress: () => ejecutarPago(monto) },
        { text: 'Lo dividí', onPress: () => ejecutarPago(monto / 2) },
        { text: 'Solo cambiar estado', onPress: () => ejecutarPago() },
        { text: 'Cancelar', style: 'cancel' },
      ],
    );
  };

  const handleDespagar = (facturaId: string, nombre: string) => {
    if (Platform.OS === 'web') {
      if (!window.confirm(`¿Marcar "${nombre}" como pendiente? Si tenías un gasto personal asociado también se eliminará.`)) return;
      despagar(facturaId).catch(() => Alert.alert('Error', 'No se pudo actualizar el estado.'));
      return;
    }
    Alert.alert(
      'Marcar como pendiente',
      `La factura "${nombre}" volverá a estar pendiente. Si registraste un impacto en tu balance personal, también se eliminará.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Marcar como pendiente', onPress: () => despagar(facturaId).catch(() => Alert.alert('Error', 'No se pudo actualizar el estado.')) },
      ],
    );
  };

  const handleEliminar = (id: string, nombre: string) => {
    if (Platform.OS === 'web') {
      if (!window.confirm(`¿Eliminar "${nombre}"? Esta acción no se puede deshacer.`)) return;
      eliminar(id).catch(() => Alert.alert('Error', 'No se pudo eliminar la factura.'));
      return;
    }
    Alert.alert(`Eliminar ${nombre}`, '¿Estás seguro? Se eliminará la factura permanentemente.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => eliminar(id).catch(() => Alert.alert('Error', 'No se pudo eliminar la factura.')) },
    ]);
  };

  const handleEditar = (factura: Factura) => {
    router.push({
      pathname: '/modal/factura',
      params: {
        id: factura.id,
        nombre: factura.nombre,
        monto: factura.monto?.toString() ?? '',
        diaVencimiento: factura.dia_vencimiento.toString(),
        responsableId: factura.responsable_id ?? '',
        scope: factura.scope,
      },
    });
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
        <View style={styles.headerRight}>
          {Platform.OS === 'web' && (
            <TouchableOpacity onPress={refresh} disabled={refreshing} style={styles.refreshBtn}>
              {refreshing
                ? <ActivityIndicator size="small" color={isPersonal ? colors.personal : colors.primary} />
                : <MaterialCommunityIcons name="refresh" size={18} color={colors.textSecondary} />}
            </TouchableOpacity>
          )}
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={isPersonal ? colors.personal : colors.primary} />}
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
              onPagar={() => handlePagar(factura)}
              onDespagar={factura.pago_actual?.estado === 'pagada' ? () => handleDespagar(factura.id, factura.nombre) : undefined}
              onEditar={puedeModificar(factura) ? () => handleEditar(factura) : undefined}
              onEliminar={puedeModificar(factura) ? () => handleEliminar(factura.id, factura.nombre) : undefined}
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
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  refreshBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(30,10,16,0.06)' },
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
