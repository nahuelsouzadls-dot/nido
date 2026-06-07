import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  Text as RNText,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useSpace } from '@/context/SpaceContext';
import { useAuthStore } from '@/store/auth';
import { useGastos } from '@/hooks/useGastos';
import { useFacturas } from '@/hooks/useFacturas';
import { useResumenPersonal } from '@/hooks/useResumenPersonal';
import { useMovimientosPersonales } from '@/hooks/useMovimientosPersonales';
import { ContextSelectorBar } from '@/components/ui/ContextSelectorBar';
import { PrivacyBadge } from '@/components/ui/PrivacyBadge';
import { DisponibleHeroCard } from '@/components/DisponibleHeroCard';
import { MiniStatCard } from '@/components/MiniStatCard';
import { MovimientoRow } from '@/components/MovimientoRow';
import { formatMonto, formatMes } from '@/utils/format';

export default function BalanceScreen() {
  const { perfil, companero } = useAuthStore();
  const colors = useColors();
  const { activeContext } = useSpace();
  const isPersonal = activeContext === 'personal';
  const hoy = new Date();
  const mes = hoy.getMonth() + 1;
  const anio = hoy.getFullYear();

  const { gastos, loading: loadingGastos, recargar: recargarGastos } = useGastos(mes, anio);
  const { facturas, loading: loadingFacturas, recargar: recargarFacturas, pendientes } = useFacturas(mes, anio);
  const resumenPersonal = useResumenPersonal(mes, anio);
  const { movimientos } = useMovimientosPersonales(mes, anio);
  const loading = loadingGastos || loadingFacturas;

  const [refreshing, setRefreshing] = useState(false);

  const refresh = async () => {
    setRefreshing(true);
    await Promise.all([
      recargarGastos(),
      recargarFacturas(),
      resumenPersonal.recargar(),
    ]);
    setRefreshing(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  // Compute total
  const totalGastos = gastos.reduce((sum, g) => sum + g.monto, 0);
  const facturasPagadasMonto = facturas
    .filter((f) => f.pago_actual?.estado === 'pagada' && f.pago_actual?.monto)
    .reduce((sum, f) => sum + (f.pago_actual?.monto ?? 0), 0);
  const totalMes = totalGastos + facturasPagadasMonto;

  // Simple progress — ratio of paid vs total invoices
  const totalFacturas = facturas.length;
  const pagadasCount = facturas.filter((f) => f.pago_actual?.estado === 'pagada').length;
  const pctPagadas = totalFacturas > 0 ? pagadasCount / totalFacturas : 0;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header — outside scroll, same pattern as facturas/objetivos */}
      <View style={styles.header}>
        <View>
          <RNText style={[styles.labelCaps, { color: colors.textSecondary }]}>
            {formatMes(mes, anio).toUpperCase()}
          </RNText>
          <RNText style={[styles.title, { color: colors.textPrimary }]}>Balance</RNText>
        </View>
        {Platform.OS === 'web' && (
          <TouchableOpacity onPress={refresh} disabled={refreshing} style={styles.refreshBtn}>
            {refreshing
              ? <ActivityIndicator size="small" color={isPersonal ? colors.personal : colors.primary} />
              : <MaterialCommunityIcons name="refresh" size={18} color={colors.textSecondary} />}
          </TouchableOpacity>
        )}
      </View>

      {/* Sin compañero — solo en modo hogar */}
      {!isPersonal && !companero ? (
        <View style={styles.emptyContainer}>
          <View style={[styles.emptyIcon, { backgroundColor: 'rgba(107,45,62,0.08)' }]}>
            <MaterialCommunityIcons name="account-plus-outline" size={26} color={colors.primary} />
          </View>
          <RNText style={[styles.emptyTitle, { color: colors.textPrimary }]}>
            Esperando a tu compañero/a
          </RNText>
          <RNText style={[styles.emptySubtext, { color: colors.textSecondary }]}>
            Invitá a alguien a unirse al hogar para ver el balance compartido
          </RNText>
        </View>
      ) : isPersonal ? (
        /* Modo personal */
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.personal} />}
        >
          <ContextSelectorBar />
          <DisponibleHeroCard
            disponible={resumenPersonal.disponible}
            totalIngresos={resumenPersonal.totalIngresos}
          />
          <View style={styles.miniGrid}>
            <MiniStatCard
              label="Cobré"
              value={resumenPersonal.totalIngresos}
              valueColor={colors.sage}
              count={`${resumenPersonal.ingresos.length} ingreso${resumenPersonal.ingresos.length !== 1 ? 's' : ''}`}
            />
            <MiniStatCard
              label="Gasté"
              value={resumenPersonal.totalGastos}
              count={`${resumenPersonal.gastos.length} movimiento${resumenPersonal.gastos.length !== 1 ? 's' : ''}`}
            />
          </View>
          {/* Barra de progreso */}
          {resumenPersonal.totalIngresos > 0 && (
            <View style={styles.progressSection}>
              <View style={styles.progressRow}>
                <RNText style={[styles.progressLabel, { color: colors.textSecondary }]}>
                  Gastado del ingreso
                </RNText>
                <RNText style={[styles.progressCount, { color: colors.personal }]}>
                  {resumenPersonal.pctGastado}%
                </RNText>
              </View>
              <View style={[styles.progressTrack, { backgroundColor: colors.personalLight }]}>
                <View style={[
                  styles.progressFill,
                  { width: `${resumenPersonal.pctGastado}%` as `${number}%`, backgroundColor: colors.personal },
                ]} />
              </View>
            </View>
          )}
          {/* Movimientos */}
          {movimientos.length > 0 && (
            <View style={styles.gastosSection}>
              <RNText style={[styles.gastosTitle, { color: colors.textPrimary }]}>Movimientos</RNText>
              <View style={[styles.gastosList, { backgroundColor: colors.card, borderColor: colors.borderSubtle }]}>
                {movimientos.map((m, i) => (
                  <MovimientoRow
                    key={m.id}
                    movimiento={m}
                    showSeparator={i < movimientos.length - 1}
                  />
                ))}
              </View>
            </View>
          )}
          {movimientos.length === 0 && (
            <View style={styles.emptyContainer}>
              <View style={[styles.emptyIcon, { backgroundColor: colors.personalLight }]}>
                <MaterialCommunityIcons name="trending-up" size={26} color={colors.personal} />
              </View>
              <RNText style={[styles.emptyTitle, { color: colors.textPrimary }]}>
                Sin movimientos este mes
              </RNText>
              <RNText style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                Registrá tu primer ingreso o gasto personal
              </RNText>
            </View>
          )}
          <PrivacyBadge />
        </ScrollView>
      ) : (
      /* Modo hogar */
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />}
      >
        <ContextSelectorBar />
        {/* BalanceHeroCard */}
        <View style={[styles.heroCard, { backgroundColor: colors.card, borderColor: colors.borderSubtle }]}>
          <RNText style={[styles.heroLabel, { color: colors.textSecondary }]}>
            EL HOGAR GASTÓ ESTE MES
          </RNText>
          <RNText style={[styles.heroTotal, { color: colors.textPrimary }]}>
            {formatMonto(totalMes)}
          </RNText>
          {totalFacturas > 0 && pctPagadas === 1 && (
            <View style={[styles.heroBadge, { backgroundColor: colors.sageLight }]}>
              <MaterialCommunityIcons name="check" size={12} color={colors.sage} />
              <RNText style={[styles.heroBadgeText, { color: colors.sageDark }]}>
                Dentro del presupuesto
              </RNText>
            </View>
          )}
        </View>

        {/* Monthly progress */}
        {totalFacturas > 0 && (
          <View style={styles.progressSection}>
            <View style={styles.progressRow}>
              <RNText style={[styles.progressLabel, { color: colors.textSecondary }]}>
                Facturas pagadas
              </RNText>
              <RNText style={[styles.progressCount, { color: colors.textPrimary }]}>
                {pagadasCount} de {totalFacturas}
              </RNText>
            </View>
            <View style={[styles.progressTrack, { backgroundColor: colors.borderSubtle }]}>
              <View style={[
                styles.progressFill,
                { width: `${pctPagadas * 100}%` as `${number}%`, backgroundColor: colors.primary },
              ]} />
            </View>
          </View>
        )}

        {/* Pendientes box */}
        {pendientes.length > 0 && (
          <View style={[styles.pendientesBox, { backgroundColor: 'rgba(107,45,62,0.06)', borderColor: 'rgba(107,45,62,0.11)' }]}>
            <View style={styles.pendientesHeader}>
              <RNText style={[styles.pendientesTitle, { color: colors.textPrimary }]}>
                Pendiente de pago
              </RNText>
              <RNText style={[styles.pendientesCount, { color: colors.primary }]}>
                {pendientes.length} {pendientes.length === 1 ? 'factura' : 'facturas'} este mes
              </RNText>
            </View>
            {pendientes.map((f, i) => (
              <View key={f.id}>
                {i > 0 && <View style={[styles.pendienteSep, { backgroundColor: 'rgba(107,45,62,0.08)' }]} />}
                <View style={styles.pendienteRow}>
                  <RNText style={[styles.pendienteName, { color: colors.textPrimary }]}>{f.nombre}</RNText>
                  <RNText style={[styles.pendienteMonto, { color: colors.primary }]}>
                    {f.monto ? formatMonto(f.monto) : 'Variable'}
                  </RNText>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Gastos list */}
        {gastos.length > 0 && (
          <View style={styles.gastosSection}>
            <RNText style={[styles.gastosTitle, { color: colors.textPrimary }]}>Gastos del mes</RNText>
            <View style={[styles.gastosList, { backgroundColor: colors.card, borderColor: colors.borderSubtle }]}>
              {gastos.map((g, i) => (
                <View key={g.id}>
                  {i > 0 && <View style={[styles.gastoSep, { backgroundColor: 'rgba(30,10,16,0.06)' }]} />}
                  <View style={styles.gastoRow}>
                    <View style={{ flex: 1 }}>
                      <RNText style={[styles.gastoDesc, { color: colors.textPrimary }]}>
                        {g.descripcion}
                      </RNText>
                      {g.categoria?.nombre && (
                        <RNText style={[styles.gastoCat, { color: colors.textSecondary }]}>
                          {g.categoria.nombre}
                        </RNText>
                      )}
                    </View>
                    <RNText style={[styles.gastoMonto, { color: colors.textPrimary }]}>
                      {formatMonto(g.monto)}
                    </RNText>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {gastos.length === 0 && pendientes.length === 0 && (
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIcon, { backgroundColor: 'rgba(107,45,62,0.08)' }]}>
              <MaterialCommunityIcons name="scale-balance" size={26} color={colors.primary} />
            </View>
            <RNText style={[styles.emptyTitle, { color: colors.textPrimary }]}>
              Todavía no hay datos
            </RNText>
            <RNText style={[styles.emptySubtext, { color: colors.textSecondary }]}>
              Registrá gastos y facturas para ver el balance del hogar
            </RNText>
          </View>
        )}
      </ScrollView>
      )}
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flex: 1 },
  content: { padding: 16, gap: 16, paddingBottom: 100 },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  refreshBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(30,10,16,0.06)' },
  miniGrid: { flexDirection: 'row', gap: 10 },
  labelCaps: { fontFamily: 'Manrope_700Bold', fontSize: 8, letterSpacing: 0.8 },
  title: { fontFamily: 'Manrope_800ExtraBold', fontSize: 20, letterSpacing: -0.4 },

  // Hero card
  heroCard: { borderRadius: 14, borderWidth: 0.5, padding: 20, alignItems: 'center', gap: 10 },
  heroLabel: { fontFamily: 'Manrope_700Bold', fontSize: 8, letterSpacing: 0.8 },
  heroTotal: { fontFamily: 'Manrope_800ExtraBold', fontSize: 22, letterSpacing: -0.8 },
  heroBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  heroBadgeText: { fontFamily: 'Manrope_700Bold', fontSize: 9 },

  // Progress
  progressSection: { gap: 8 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressLabel: { fontFamily: 'Manrope_500Medium', fontSize: 10 },
  progressCount: { fontFamily: 'Manrope_700Bold', fontSize: 10 },
  progressTrack: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: 6, borderRadius: 3 },

  // Pendientes box
  pendientesBox: { borderRadius: 11, borderWidth: 0.5, padding: 11, gap: 8 },
  pendientesHeader: { gap: 2 },
  pendientesTitle: { fontFamily: 'Manrope_700Bold', fontSize: 12 },
  pendientesCount: { fontFamily: 'Manrope_500Medium', fontSize: 10 },
  pendienteSep: { height: 0.5 },
  pendienteRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  pendienteName: { fontFamily: 'Manrope_600SemiBold', fontSize: 11 },
  pendienteMonto: { fontFamily: 'Manrope_700Bold', fontSize: 11 },

  // Gastos
  gastosSection: { gap: 10 },
  gastosTitle: { fontFamily: 'Manrope_800ExtraBold', fontSize: 13, letterSpacing: -0.3 },
  gastosList: { borderRadius: 14, borderWidth: 0.5, overflow: 'hidden' },
  gastoRow: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 12 },
  gastoDesc: { fontFamily: 'Manrope_600SemiBold', fontSize: 11 },
  gastoCat: { fontFamily: 'Manrope_500Medium', fontSize: 9, marginTop: 1 },
  gastoMonto: { fontFamily: 'Manrope_700Bold', fontSize: 12 },
  gastoSep: { height: 0.5, marginLeft: 12 },

  // Empty
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 12 },
  emptyIcon: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  emptyTitle: { fontFamily: 'Manrope_800ExtraBold', fontSize: 15, textAlign: 'center' },
  emptySubtext: { fontFamily: 'Manrope_500Medium', fontSize: 11, textAlign: 'center', lineHeight: 16, paddingHorizontal: 24 },
});
