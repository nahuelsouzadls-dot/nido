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

// ─── Colores por categoría ────────────────────────────────────────────────────

const CAT_COLORS: Record<string, string> = {
  Supermercado: '#4A90D9',
  Hogar:        '#7B68EE',
  Servicios:    '#50C878',
  Transporte:   '#FFB347',
  Mascotas:     '#FF6B9D',
  Salidas:      '#FF7F50',
  Salud:        '#20B2AA',
  Reembolso:    '#A8D5A2',
  Otros:        '#A9A9A9',
};

function catColor(name: string): string {
  return CAT_COLORS[name] ?? '#A9A9A9';
}

// ─── BienvenidaCard ───────────────────────────────────────────────────────────

function BienvenidaCard({ onDismiss }: { onDismiss: () => void }) {
  const colors = useColors();
  return (
    <View style={[bStyles.card, { backgroundColor: colors.card, borderColor: colors.borderSubtle }]}>
      <RNText style={[bStyles.label, { color: colors.textSecondary }]}>BIENVENIDO/A A NIDO</RNText>
      <RNText style={[bStyles.titulo, { color: colors.textPrimary }]}>Tu espacio está listo</RNText>
      <RNText style={[bStyles.texto, { color: colors.textSecondary }]}>
        Registrá gastos desde el botón + o mandando un mensaje al bot de Telegram.
      </RNText>
      <TouchableOpacity style={[bStyles.btn, { backgroundColor: 'rgba(30,10,16,0.07)' }]} onPress={onDismiss} activeOpacity={0.7}>
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
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [gastos]);

  return (
    <View style={[sStyles.card, { backgroundColor: colors.card, borderColor: colors.borderSubtle }]}>
      {/* Encabezado */}
      <View style={sStyles.header}>
        <View>
          <RNText style={[sStyles.label, { color: colors.textSecondary }]}>GASTASTE ESTE MES</RNText>
          <RNText style={[sStyles.total, { color: colors.textPrimary }]}>{formatMonto(totalGastos)}</RNText>
        </View>
        <View style={[sStyles.countBadge, { backgroundColor: colors.borderSubtle }]}>
          <RNText style={[sStyles.countText, { color: colors.textSecondary }]}>
            {gastos.length} {gastos.length === 1 ? 'gasto' : 'gastos'}
          </RNText>
        </View>
      </View>

      {breakdown.length > 0 ? (
        <>
          {/* Barra apilada por categoría */}
          <View style={sStyles.stackedBar}>
            {breakdown.map(([cat, monto], i) => {
              const pct = totalGastos > 0 ? (monto / totalGastos) * 100 : 0;
              return (
                <View
                  key={cat}
                  style={[
                    sStyles.stackedSlice,
                    {
                      width: `${pct}%` as `${number}%`,
                      backgroundColor: catColor(cat),
                      borderTopLeftRadius: i === 0 ? 5 : 0,
                      borderBottomLeftRadius: i === 0 ? 5 : 0,
                      borderTopRightRadius: i === breakdown.length - 1 ? 5 : 0,
                      borderBottomRightRadius: i === breakdown.length - 1 ? 5 : 0,
                    },
                  ]}
                />
              );
            })}
          </View>

          {/* Filas por categoría */}
          {breakdown.map(([cat, monto]) => {
            const pct = totalGastos > 0 ? Math.round((monto / totalGastos) * 100) : 0;
            const color = catColor(cat);
            return (
              <View key={cat} style={sStyles.catRow}>
                <View style={[sStyles.dot, { backgroundColor: color }]} />
                <RNText style={[sStyles.catName, { color: colors.textPrimary }]} numberOfLines={1}>{cat}</RNText>
                <RNText style={[sStyles.catMonto, { color: colors.textSecondary }]}>{formatMonto(monto)}</RNText>
                <RNText style={[sStyles.catPct, { color }]}>{pct}%</RNText>
              </View>
            );
          })}
        </>
      ) : (
        <View style={sStyles.emptyWrap}>
          <MaterialCommunityIcons name="chart-bar" size={28} color={colors.borderSubtle} />
          <RNText style={[sStyles.emptyText, { color: colors.textSecondary }]}>
            Sin gastos registrados este mes
          </RNText>
        </View>
      )}
    </View>
  );
}

const sStyles = StyleSheet.create({
  card: { borderRadius: 16, borderWidth: 0.5, padding: 16, gap: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  label: { fontFamily: 'Manrope_700Bold', fontSize: 10, letterSpacing: 0.8, marginBottom: 2 },
  total: { fontFamily: 'Manrope_800ExtraBold', fontSize: 32, letterSpacing: -1 },
  countBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, marginTop: 4 },
  countText: { fontFamily: 'Manrope_600SemiBold', fontSize: 10 },
  stackedBar: { flexDirection: 'row', height: 12, borderRadius: 5, overflow: 'hidden', gap: 1.5 },
  stackedSlice: { height: 12 },
  catRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  catName: { fontFamily: 'Manrope_600SemiBold', fontSize: 12, flex: 1 },
  catMonto: { fontFamily: 'Manrope_500Medium', fontSize: 11 },
  catPct: { fontFamily: 'Manrope_800ExtraBold', fontSize: 12, width: 36, textAlign: 'right' },
  emptyWrap: { alignItems: 'center', paddingVertical: 20, gap: 8 },
  emptyText: { fontFamily: 'Manrope_500Medium', fontSize: 12 },
});

// ─── FacturasCard ─────────────────────────────────────────────────────────────

type FacturasCardProps = {
  facturas: Factura[];
  pendientes: Factura[];
  vencidas: Factura[];
  hogarNombre: string;
  onVerTodas: () => void;
};

function FacturasCard({ facturas, pendientes, vencidas, hogarNombre, onVerTodas }: FacturasCardProps) {
  const colors = useColors();
  const pagadas = facturas.filter((f) => f.pago_actual?.estado === 'pagada');
  const total = facturas.length;
  const pctPagadas = total > 0 ? pagadas.length / total : 0;

  const urgente = vencidas.length > 0;
  const atencion = !urgente && pendientes.some((f) => {
    const dias = f.dia_vencimiento - new Date().getDate();
    return dias >= 0 && dias <= 5;
  });

  const badgeColor = urgente ? '#FF6B6B' : atencion ? '#FFB347' : '#50C878';
  const badgeLabel = urgente ? 'Vencida' : atencion ? 'Atención' : 'Al día';
  const badgeBg = urgente ? 'rgba(255,107,107,0.15)' : atencion ? 'rgba(255,179,71,0.15)' : 'rgba(80,200,120,0.15)';

  if (total === 0) return null;

  const visibles = facturas.slice(0, 4);

  return (
    <View style={[fStyles.card, { backgroundColor: colors.card, borderColor: colors.borderSubtle }]}>
      {/* Header */}
      <View style={fStyles.cardHeader}>
        <View style={{ flex: 1 }}>
          <RNText style={[fStyles.label, { color: colors.textSecondary }]}>FACTURAS DEL HOGAR</RNText>
          <RNText style={[fStyles.hogarName, { color: colors.textPrimary }]}>{hogarNombre}</RNText>
        </View>
        <View style={[fStyles.badge, { backgroundColor: badgeBg }]}>
          <View style={[fStyles.badgeDot, { backgroundColor: badgeColor }]} />
          <RNText style={[fStyles.badgeText, { color: badgeColor }]}>{badgeLabel}</RNText>
        </View>
      </View>

      {/* Barra de progreso */}
      <View style={fStyles.progressWrap}>
        <View style={[fStyles.progressTrack, { backgroundColor: colors.borderSubtle }]}>
          <View style={[fStyles.progressFill, { width: `${pctPagadas * 100}%` as `${number}%`, backgroundColor: '#50C878' }]} />
        </View>
        <RNText style={[fStyles.progressLabel, { color: colors.textSecondary }]}>
          {pagadas.length} de {total} pagadas
        </RNText>
      </View>

      {/* Lista */}
      <View style={[fStyles.lista, { borderColor: colors.borderSubtle }]}>
        {visibles.map((f, i) => {
          const isPagada = f.pago_actual?.estado === 'pagada';
          const isVencida = f.pago_actual?.estado === 'vencida' || vencidas.includes(f);
          const rowColor = isPagada ? '#50C878' : isVencida ? '#FF6B6B' : colors.primary;
          return (
            <View key={f.id}>
              {i > 0 && <View style={[fStyles.sep, { backgroundColor: colors.borderSubtle }]} />}
              <View style={fStyles.facturaRow}>
                <MaterialCommunityIcons
                  name={isPagada ? 'check-circle' : isVencida ? 'alert-circle' : 'circle-outline'}
                  size={16}
                  color={rowColor}
                />
                <RNText style={[fStyles.facturaNombre, { color: colors.textPrimary }]} numberOfLines={1}>
                  {f.nombre}
                </RNText>
                {f.monto != null && (
                  <RNText style={[fStyles.facturaMonto, { color: colors.textSecondary }]}>
                    {formatMonto(f.monto)}
                  </RNText>
                )}
                <View style={[fStyles.estadoBadge, { backgroundColor: isPagada ? 'rgba(80,200,120,0.12)' : isVencida ? 'rgba(255,107,107,0.12)' : 'rgba(107,45,62,0.08)' }]}>
                  <RNText style={[fStyles.estadoText, { color: rowColor }]}>
                    {isPagada ? 'Listo' : isVencida ? 'Vencida' : 'Pendiente'}
                  </RNText>
                </View>
              </View>
            </View>
          );
        })}
      </View>

      {total > 4 && (
        <TouchableOpacity onPress={onVerTodas} activeOpacity={0.7} style={fStyles.verTodas}>
          <RNText style={[fStyles.verTodasText, { color: colors.primary }]}>
            Ver las {total} facturas →
          </RNText>
        </TouchableOpacity>
      )}
    </View>
  );
}

const fStyles = StyleSheet.create({
  card: { borderRadius: 16, borderWidth: 0.5, padding: 16, gap: 14 },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  label: { fontFamily: 'Manrope_700Bold', fontSize: 10, letterSpacing: 0.8, marginBottom: 2 },
  hogarName: { fontFamily: 'Manrope_800ExtraBold', fontSize: 16, letterSpacing: -0.3 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  badgeDot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontFamily: 'Manrope_700Bold', fontSize: 10 },
  progressWrap: { gap: 6 },
  progressTrack: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: 6, borderRadius: 3 },
  progressLabel: { fontFamily: 'Manrope_500Medium', fontSize: 10 },
  lista: { borderRadius: 12, borderWidth: 0.5, overflow: 'hidden' },
  facturaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 11 },
  facturaNombre: { fontFamily: 'Manrope_600SemiBold', fontSize: 12, flex: 1 },
  facturaMonto: { fontFamily: 'Manrope_500Medium', fontSize: 11 },
  estadoBadge: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  estadoText: { fontFamily: 'Manrope_700Bold', fontSize: 9 },
  sep: { height: 0.5, marginLeft: 36 },
  verTodas: { alignItems: 'center', paddingTop: 2 },
  verTodasText: { fontFamily: 'Manrope_700Bold', fontSize: 11 },
});

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

  const nombre = perfil?.nombre.split(' ')[0] ?? '';
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
              {saludo}{nombre ? `, ${nombre}` : ''}
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
              {perfil && <Avatar nombre={perfil.nombre} url={perfil.avatar_url} size={36} color={colors.primaryLight} />}
              {companero && <Avatar nombre={companero.nombre} url={companero.avatar_url} size={36} color={colors.primaryLight} />}
            </View>
          </View>
        </View>

        {mostrarBienvenida && <BienvenidaCard onDismiss={() => setMostrarBienvenida(false)} />}

        {/* Gastos personales con breakdown por categoría */}
        <SpendingCard totalGastos={resumenPersonal.totalGastos} gastos={resumenPersonal.gastos} />

        {/* Facturas del hogar */}
        <FacturasCard
          facturas={facturas}
          pendientes={pendientes}
          vencidas={vencidas}
          hogarNombre={hogar?.nombre ?? 'Nuestro Hogar'}
          onVerTodas={() => router.push('/(tabs)/facturas')}
        />
      </ScrollView>

      <FAB />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 120, gap: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, paddingBottom: 4 },
  labelCaps: { fontFamily: 'Manrope_700Bold', fontSize: 10, letterSpacing: 0.8 },
  greeting: { fontFamily: 'Manrope_800ExtraBold', fontSize: 22, letterSpacing: -0.4, marginTop: 2 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  avatares: { flexDirection: 'row', gap: -8 },
  refreshBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(30,10,16,0.06)' },
});
