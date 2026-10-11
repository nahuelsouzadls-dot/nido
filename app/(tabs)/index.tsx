import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Text as RNText,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useAuthStore } from '@/store/auth';
import { useFacturas } from '@/hooks/useFacturas';
import { useResumenPersonal } from '@/hooks/useResumenPersonal';
import { Avatar } from '@/components/ui/Avatar';
import { FAB } from '@/components/FAB';
import { formatMonto, formatMes } from '@/utils/format';
import type { Factura, Gasto } from '@/types';

// ─── Hero state logic ─────────────────────────────────────────────────────────

type HeroState = 'calm' | 'warn' | 'urgent';

function getHeroState(days: number | null): HeroState {
  if (days === null || days > 7) return 'calm';
  if (days >= 3) return 'warn';
  return 'urgent';
}

const HERO_COLORS: Record<HeroState, {
  bg: string;
  badgeBg: string;
  badgeColor: string;
  pendingNum: string;
}> = {
  calm:   { bg: '#6B2D3E', badgeBg: 'rgba(143,175,122,0.22)', badgeColor: '#C8EAB0', pendingNum: 'rgba(255,255,255,0.35)' },
  warn:   { bg: '#8B3A20', badgeBg: 'rgba(255,200,120,0.20)', badgeColor: '#FFD9A0', pendingNum: '#FFCBA4' },
  urgent: { bg: '#5C1A1A', badgeBg: 'rgba(255,120,100,0.18)', badgeColor: '#FFBCB0', pendingNum: '#FFBCB0' },
};

const HERO_BADGE: Record<HeroState, string> = {
  calm: 'Todo al día', warn: 'Atención', urgent: 'Vence hoy',
};

// ─── BienvenidaCard ───────────────────────────────────────────────────────────

function BienvenidaCard({ onDismiss }: { onDismiss: () => void }) {
  const colors = useColors();
  return (
    <View style={[bStyles.card, { backgroundColor: colors.card, borderColor: colors.borderSubtle }]}>
      <RNText style={[bStyles.label, { color: colors.textSecondary }]}>BIENVENIDO/A A NIDO</RNText>
      <RNText style={[bStyles.titulo, { color: colors.textPrimary }]}>Tu espacio está listo</RNText>
      <RNText style={[bStyles.texto, { color: colors.textSecondary }]}>
        Registrá tu primer ingreso o gasto. Todo lo que guardés acá es solo tuyo.
      </RNText>
      <TouchableOpacity
        style={[bStyles.btn, { backgroundColor: 'rgba(30,10,16,0.07)' }]}
        onPress={onDismiss}
        activeOpacity={0.7}
      >
        <RNText style={[bStyles.btnText, { color: colors.textSecondary }]}>Entendido</RNText>
      </TouchableOpacity>
    </View>
  );
}

const bStyles = StyleSheet.create({
  card: { borderRadius: 14, borderWidth: 0.5, padding: 14, gap: 6 },
  label: { fontFamily: 'Manrope_700Bold', fontSize: 10, letterSpacing: 0.8 },
  titulo: { fontFamily: 'Manrope_800ExtraBold', fontSize: 15, letterSpacing: -0.3 },
  texto: { fontFamily: 'Manrope_500Medium', fontSize: 12, lineHeight: 18 },
  btn: { borderRadius: 10, paddingVertical: 8, alignItems: 'center', marginTop: 4 },
  btnText: { fontFamily: 'Manrope_700Bold', fontSize: 11 },
});

// ─── SpendingCard ─────────────────────────────────────────────────────────────

function SpendingCard({ totalGastos, gastos }: { totalGastos: number; gastos: Gasto[] }) {
  const colors = useColors();

  const breakdown = useMemo(() => {
    const map: Record<string, number> = {};
    for (const g of gastos) {
      const cat = g.categoria?.nombre ?? g.categoria_texto ?? 'Otros';
      map[cat] = (map[cat] ?? 0) + g.monto;
    }
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [gastos]);

  return (
    <View style={[pStyles.card, { backgroundColor: colors.card, borderColor: colors.borderSubtle }]}>
      <RNText style={[pStyles.label, { color: colors.textSecondary }]}>ESTE MES</RNText>
      <RNText style={[pStyles.total, { color: colors.textPrimary }]}>{formatMonto(totalGastos)}</RNText>
      {breakdown.length > 0 ? (
        <>
          <View style={[pStyles.sep, { backgroundColor: colors.borderSubtle }]} />
          {breakdown.map(([cat, monto]) => {
            const pct = totalGastos > 0 ? Math.round((monto / totalGastos) * 100) : 0;
            return (
              <View key={cat} style={pStyles.catRow}>
                <RNText style={[pStyles.catName, { color: colors.textPrimary }]} numberOfLines={1}>{cat}</RNText>
                <View style={[pStyles.barTrack, { backgroundColor: colors.borderSubtle }]}>
                  <View style={[pStyles.barFill, { width: `${pct}%` as `${number}%`, backgroundColor: colors.primary }]} />
                </View>
                <RNText style={[pStyles.catPct, { color: colors.textSecondary }]}>{pct}%</RNText>
              </View>
            );
          })}
        </>
      ) : (
        <RNText style={[pStyles.empty, { color: colors.textSecondary }]}>Sin gastos registrados este mes</RNText>
      )}
    </View>
  );
}

const pStyles = StyleSheet.create({
  card: { borderRadius: 16, borderWidth: 0.5, padding: 16, gap: 10 },
  label: { fontFamily: 'Manrope_700Bold', fontSize: 10, letterSpacing: 0.8 },
  total: { fontFamily: 'Manrope_800ExtraBold', fontSize: 28, letterSpacing: -0.8 },
  sep: { height: 0.5 },
  catRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  catName: { fontFamily: 'Manrope_600SemiBold', fontSize: 11, width: 90 },
  barTrack: { flex: 1, height: 5, borderRadius: 3, overflow: 'hidden' },
  barFill: { height: 5, borderRadius: 3 },
  catPct: { fontFamily: 'Manrope_700Bold', fontSize: 10, width: 30, textAlign: 'right' },
  empty: { fontFamily: 'Manrope_500Medium', fontSize: 12 },
});

// ─── BillRow ──────────────────────────────────────────────────────────────────

function BillRow({ factura }: { factura: Factura }) {
  const colors = useColors();
  const isPagada = factura.pago_actual?.estado === 'pagada';

  return (
    <View style={[styles.billRow, { borderLeftColor: isPagada ? colors.sage : colors.primary }]}>
      <View style={{ flex: 1 }}>
        <RNText style={[styles.billName, { color: colors.textPrimary }]}>{factura.nombre}</RNText>
        <RNText style={[styles.billDue, { color: colors.textSecondary }]}>
          {isPagada
            ? 'Pagada'
            : factura.num_cuotas && factura.cuota_actual
              ? `Cuota ${factura.cuota_actual} de ${factura.num_cuotas}`
              : `Día ${factura.dia_vencimiento}`}
        </RNText>
      </View>
      <View style={[
        styles.billBadge,
        { backgroundColor: isPagada ? 'rgba(90,122,72,0.12)' : 'rgba(107,45,62,0.1)' },
      ]}>
        <RNText style={[styles.billBadgeText, { color: isPagada ? colors.sageDark : colors.primary }]}>
          {isPagada ? 'Listo' : 'Pendiente'}
        </RNText>
      </View>
    </View>
  );
}

// ─── HomeScreen ───────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const router = useRouter();
  const colors = useColors();
  const { hogar, perfil, companero } = useAuthStore();
  const hoy = new Date();
  const mes = hoy.getMonth() + 1;
  const anio = hoy.getFullYear();

  const { facturas, pendientes, vencidas, recargar } = useFacturas(mes, anio);
  const resumenPersonal = useResumenPersonal(mes, anio);
  const [refreshing, setRefreshing] = useState(false);
  const [mostrarBienvenida, setMostrarBienvenida] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('nido_first_home_visit').then((val) => {
      if (val === null) {
        setMostrarBienvenida(true);
        AsyncStorage.setItem('nido_first_home_visit', 'done');
      }
    });
  }, []);

  const refresh = async () => {
    setRefreshing(true);
    await Promise.all([recargar(), resumenPersonal.recargar()]);
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      recargar();
      resumenPersonal.recargar();
    }, [recargar, resumenPersonal.recargar]),
  );

  const daysUntilNextDue = useMemo(() => {
    if (vencidas.length > 0) return 0;
    if (pendientes.length === 0) return null;
    const diaHoy = hoy.getDate();
    const days = pendientes.map((f) => f.dia_vencimiento - diaHoy).filter((d) => d >= 0);
    return days.length > 0 ? Math.min(...days) : null;
  }, [pendientes, vencidas]);

  const proximaFactura = useMemo((): Factura | null => {
    if (vencidas.length > 0) return vencidas[0];
    if (pendientes.length === 0) return null;
    const diaHoy = hoy.getDate();
    const conDias = pendientes
      .map((f) => ({ f, d: f.dia_vencimiento - diaHoy }))
      .filter(({ d }) => d >= 0)
      .sort((a, b) => a.d - b.d);
    return conDias[0]?.f ?? null;
  }, [pendientes, vencidas]);

  const heroState = getHeroState(daysUntilNextDue);
  const hc = HERO_COLORS[heroState];

  const pagadas = facturas.filter((f) => f.pago_actual?.estado === 'pagada');
  const nombre = perfil?.nombre.split(' ')[0] ?? 'Vos';
  const hora = hoy.getHours();
  const saludo = hora < 12 ? 'Buenos días' : hora < 20 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <RNText style={[styles.labelCaps, { color: colors.textSecondary }]}>
              {formatMes(mes, anio).toUpperCase()}
            </RNText>
            <RNText style={[styles.greeting, { color: colors.textPrimary }]}>
              {saludo}, {nombre}
            </RNText>
          </View>
          <View style={styles.headerRight}>
            {Platform.OS === 'web' && (
              <TouchableOpacity onPress={refresh} disabled={refreshing} style={styles.refreshBtn}>
                {refreshing
                  ? <ActivityIndicator size="small" color={colors.primary} />
                  : <MaterialCommunityIcons name="refresh" size={18} color={colors.textSecondary} />}
              </TouchableOpacity>
            )}
            <View style={styles.avatares}>
              {perfil ? <Avatar nombre={perfil.nombre} url={perfil.avatar_url} size={36} color={colors.primaryLight} /> : null}
              {companero ? <Avatar nombre={companero.nombre} url={companero.avatar_url} size={36} color={colors.primaryLight} /> : null}
            </View>
          </View>
        </View>

        {mostrarBienvenida && (
          <BienvenidaCard onDismiss={() => setMostrarBienvenida(false)} />
        )}

        {/* Gastos del mes */}
        <SpendingCard totalGastos={resumenPersonal.totalGastos} gastos={resumenPersonal.gastos} />

        {/* Estado del hogar */}
        <View style={[styles.heroCard, { backgroundColor: hc.bg }]}>
          <View style={styles.heroTop}>
            <RNText style={styles.heroHogarName}>
              {hogar?.nombre ?? 'Nuestro Hogar'}
            </RNText>
            <View style={[styles.heroBadge, { backgroundColor: hc.badgeBg }]}>
              <RNText style={[styles.heroBadgeText, { color: hc.badgeColor }]}>
                {HERO_BADGE[heroState]}
              </RNText>
            </View>
          </View>

          <View style={styles.heroGrid}>
            <View style={styles.heroStat}>
              <RNText style={[styles.heroNum, { color: '#C8EAB0' }]}>{pagadas.length}</RNText>
              <RNText style={styles.heroStatLabel}>Pagadas</RNText>
            </View>
            <View style={styles.heroDivider} />
            <View style={styles.heroStat}>
              <RNText style={[styles.heroNum, { color: hc.pendingNum }]}>
                {pendientes.length + vencidas.length}
              </RNText>
              <RNText style={styles.heroStatLabel}>Pendientes</RNText>
            </View>
          </View>

          <View style={styles.heroFooter}>
            {heroState === 'calm' ? (
              <>
                <MaterialCommunityIcons name="calendar-outline" size={13} color="rgba(255,255,255,0.5)" />
                <RNText style={styles.heroFooterCalm}>Sin vencimientos próximos</RNText>
              </>
            ) : proximaFactura ? (
              <>
                <MaterialCommunityIcons
                  name={heroState === 'urgent' ? 'lightning-bolt' : 'calendar-outline'}
                  size={13}
                  color={hc.badgeColor}
                />
                <RNText style={[styles.heroFooterText, { color: hc.badgeColor }]} numberOfLines={1}>
                  {proximaFactura.nombre}
                </RNText>
                <RNText style={[styles.heroFooterDays, { color: hc.badgeColor }]}>
                  {heroState === 'urgent' ? 'Hoy' : `${daysUntilNextDue}d`}
                </RNText>
                {proximaFactura.monto ? (
                  <RNText style={[styles.heroFooterMonto, { color: hc.badgeColor }]}>
                    · {formatMonto(proximaFactura.monto)}
                  </RNText>
                ) : null}
              </>
            ) : null}
          </View>
        </View>

        {/* Facturas del mes */}
        {facturas.length > 0 && (
          <View style={styles.seccion}>
            <View style={styles.seccionHeader}>
              <RNText style={[styles.seccionTitle, { color: colors.textPrimary }]}>Facturas del mes</RNText>
              <TouchableOpacity onPress={() => router.push('/(tabs)/facturas')}>
                <RNText style={[styles.seccionLink, { color: colors.primary }]}>Ver todas</RNText>
              </TouchableOpacity>
            </View>
            <View style={[styles.billList, { backgroundColor: colors.card, borderColor: colors.borderSubtle }]}>
              {facturas.slice(0, 3).map((f, i) => (
                <View key={f.id}>
                  <BillRow factura={f} />
                  {i < Math.min(facturas.length, 3) - 1 && (
                    <View style={styles.billSep} />
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

      </ScrollView>

      <FAB />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 120, gap: 20 },

  // Header
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8 },
  labelCaps: { fontFamily: 'Manrope_700Bold', fontSize: 10, letterSpacing: 0.8 },
  greeting: { fontFamily: 'Manrope_800ExtraBold', fontSize: 22, letterSpacing: -0.4, marginTop: 2 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  avatares: { flexDirection: 'row', gap: -8 },
  refreshBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(30,10,16,0.06)' },

  // HeroCard
  heroCard: { borderRadius: 16, padding: 16, gap: 16 },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heroHogarName: { fontFamily: 'Manrope_700Bold', fontSize: 12, color: 'rgba(255,255,255,0.75)' },
  heroBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  heroBadgeText: { fontFamily: 'Manrope_700Bold', fontSize: 10 },
  heroGrid: { flexDirection: 'row', alignItems: 'center' },
  heroStat: { flex: 1, alignItems: 'center', gap: 4 },
  heroDivider: { width: 1, height: 44, marginHorizontal: 12, backgroundColor: 'rgba(255,255,255,0.13)' },
  heroNum: { fontFamily: 'Manrope_800ExtraBold', fontSize: 36, letterSpacing: -1 },
  heroStatLabel: { fontFamily: 'Manrope_500Medium', fontSize: 11, color: 'rgba(255,255,255,0.55)' },
  heroFooter: { flexDirection: 'row', alignItems: 'center', gap: 6, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', paddingTop: 12 },
  heroFooterCalm: { fontFamily: 'Manrope_500Medium', fontSize: 13, color: 'rgba(255,255,255,0.5)', flex: 1 },
  heroFooterText: { fontFamily: 'Manrope_600SemiBold', fontSize: 13, flex: 1 },
  heroFooterDays: { fontFamily: 'Manrope_700Bold', fontSize: 13 },
  heroFooterMonto: { fontFamily: 'Manrope_600SemiBold', fontSize: 13 },

  // Bill rows
  billList: { borderRadius: 14, borderWidth: 0.5, overflow: 'hidden' },
  billRow: { flexDirection: 'row', alignItems: 'center', borderLeftWidth: 2.5, paddingLeft: 10, paddingVertical: 11, paddingRight: 12 },
  billName: { fontFamily: 'Manrope_700Bold', fontSize: 13 },
  billDue: { fontFamily: 'Manrope_500Medium', fontSize: 11, marginTop: 2 },
  billBadge: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  billBadgeText: { fontFamily: 'Manrope_700Bold', fontSize: 10 },
  billSep: { height: 0.5, backgroundColor: 'rgba(30,10,16,0.06)', marginLeft: 10 },

  // Sections
  seccion: { gap: 10 },
  seccionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  seccionTitle: { fontFamily: 'Manrope_800ExtraBold', fontSize: 15, letterSpacing: -0.3 },
  seccionLink: { fontFamily: 'Manrope_600SemiBold', fontSize: 11 },
});
