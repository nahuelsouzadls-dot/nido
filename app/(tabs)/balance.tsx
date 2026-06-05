import React, { useState, useMemo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Radii, Spacing } from '@/constants/theme';
import { useColors } from '@/hooks/useColors';
import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { GastoRow } from '@/components/GastoRow';
import { EmptyState } from '@/components/ui/EmptyState';
import { FAB } from '@/components/FAB';
import { useAuthStore } from '@/store/auth';
import { useGastos } from '@/hooks/useGastos';
import { useBalance } from '@/hooks/useBalance';
import { formatMonto, formatMes } from '@/utils/format';

type Division = '50-50' | '60-40' | '70-30';

const DIVISIONES: { label: string; value: Division; porcentaje: number }[] = [
  { label: '50/50', value: '50-50', porcentaje: 50 },
  { label: '60/40', value: '60-40', porcentaje: 60 },
  { label: '70/30', value: '70-30', porcentaje: 70 },
];

export default function BalanceScreen() {
  const { perfil, companero } = useAuthStore();
  const colors = useColors();
  const hoy = new Date();
  const mes = hoy.getMonth() + 1;
  const anio = hoy.getFullYear();

  const { gastos, loading, recargar } = useGastos(mes, anio);
  const [division, setDivision] = useState<Division>('50-50');
  const [refreshing, setRefreshing] = useState(false);

  const porcentajeA = DIVISIONES.find((d) => d.value === division)?.porcentaje ?? 50;

  // Config estable para evitar re-renders innecesarios en useBalance
  const balanceConfig = useMemo(
    () => ({ tipo: 'porcentaje' as const, porcentajeA }),
    [porcentajeA],
  );
  const balance = useBalance(gastos, balanceConfig);

  const refresh = async () => {
    setRefreshing(true);
    await recargar();
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

  if (!perfil) return null;

  // Sin compañero: mostrar estado vacío en lugar de pantalla en blanco
  if (!companero) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.header}>
          <Text variant="largeTitle" style={{ fontWeight: '800' }}>Balance</Text>
          <Text variant="subhead" color={colors.textSecondary}>{formatMes(mes, anio)}</Text>
        </View>
        <EmptyState
          emoji="👥"
          titulo="Esperando al compañero"
          descripcion="Invitá a tu pareja a unirse al hogar para ver el balance"
        />
      </SafeAreaView>
    );
  }

  if (!balance) return null;

  const deudorNombre =
    balance.deudor === perfil.id ? perfil.nombre : companero.nombre;
  const acreedorNombre =
    balance.acreedor === perfil.id ? perfil.nombre : companero.nombre;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text variant="largeTitle" style={{ fontWeight: '800' }}>
            Balance
          </Text>
          <Text variant="subhead" color={colors.textSecondary}>
            {formatMes(mes, anio)}
          </Text>
        </View>

        {/* División */}
        <View style={styles.divisionWrapper}>
          <Text variant="footnote" color={colors.textSecondary} style={{ marginBottom: 8 }}>
            Método de división
          </Text>
          <View style={styles.divisionRow}>
            {DIVISIONES.map((d) => (
              <TouchableOpacity
                key={d.value}
                style={[
                  styles.divisionBtn,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  division === d.value && { backgroundColor: colors.primaryLight, borderColor: colors.primary },
                ]}
                onPress={() => setDivision(d.value)}
                activeOpacity={0.8}
              >
                <Text
                  style={{
                    fontWeight: '600',
                    fontSize: 14,
                    color: division === d.value ? colors.primary : colors.textSecondary,
                  }}
                >
                  {d.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Resumen */}
        <Card style={styles.resumen}>
          <Text variant="caption" color={colors.textSecondary} align="center">
            Total del mes
          </Text>
          <Text variant="largeTitle" style={{ fontWeight: '800', textAlign: 'center' }}>
            {formatMonto(balance.totalMes)}
          </Text>

          <View style={styles.barraBalance}>
            <View
              style={[
                styles.barraA,
                {
                  flex: balance.montoA || 0.01,
                  backgroundColor: colors.primary,
                },
              ]}
            />
            <View
              style={[
                styles.barraB,
                {
                  flex: balance.montoB || 0.01,
                  backgroundColor: '#FF9F0A',
                },
              ]}
            />
          </View>

          <View style={styles.personasRow}>
            <View style={styles.persona}>
              <Avatar nombre={perfil.nombre} url={perfil.avatar_url} size={40} color={colors.primary} />
              <Text variant="subhead" style={{ fontWeight: '600' }}>
                {perfil.nombre.split(' ')[0]}
              </Text>
              <Text variant="title3" style={{ fontWeight: '700', color: colors.primary }}>
                {formatMonto(balance.montoA)}
              </Text>
              <Text variant="caption" color={colors.textSecondary}>
                {balance.porcentajeA}% esperado
              </Text>
            </View>

            <View style={styles.vsContainer}>
              <Text variant="callout" color={colors.textTertiary} style={{ fontWeight: '700' }}>
                vs
              </Text>
            </View>

            <View style={styles.persona}>
              <Avatar nombre={companero.nombre} url={companero.avatar_url} size={40} color="#FF9F0A" />
              <Text variant="subhead" style={{ fontWeight: '600' }}>
                {companero.nombre.split(' ')[0]}
              </Text>
              <Text variant="title3" style={{ fontWeight: '700', color: '#FF9F0A' }}>
                {formatMonto(balance.montoB)}
              </Text>
              <Text variant="caption" color={colors.textSecondary}>
                {balance.porcentajeB}% esperado
              </Text>
            </View>
          </View>
        </Card>

        {/* Estado */}
        {balance.montoDebe > 0.5 ? (
          <Card style={styles.deudaCard}>
            <Text variant="footnote" color={colors.textSecondary}>
              Ajuste
            </Text>
            <Text variant="headline" style={{ marginTop: 4 }}>
              {deudorNombre.split(' ')[0]} le debe a {acreedorNombre.split(' ')[0]}
            </Text>
            <Text variant="title1" style={{ fontWeight: '800', color: colors.danger, marginTop: 4 }}>
              {formatMonto(balance.montoDebe)}
            </Text>
          </Card>
        ) : (
          <Card style={[styles.deudaCard, { backgroundColor: colors.successLight, borderColor: colors.success + '40' }]}>
            <Text variant="headline" style={{ color: colors.success }}>
              ✓ Están al día
            </Text>
            <Text variant="subhead" color={colors.textSecondary} style={{ marginTop: 4 }}>
              La división está equilibrada
            </Text>
          </Card>
        )}

        {/* Lista de gastos */}
        <View style={styles.gastosSection}>
          <Text variant="title3">Gastos del mes</Text>

          {gastos.length === 0 ? (
            <EmptyState
              emoji="💸"
              titulo="Sin gastos este mes"
              descripcion="Registrá gastos con el botón +"
            />
          ) : (
            <Card padded={false} style={{ overflow: 'hidden' }}>
              {gastos.map((g) => (
                <GastoRow key={g.id} gasto={g} />
              ))}
            </Card>
          )}
        </View>
      </ScrollView>

      <FAB />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flex: 1 },
  content: { padding: Spacing.md, gap: Spacing.md, paddingBottom: 120 },
  header: { paddingTop: 8, gap: 2 },
  divisionWrapper: { gap: 0 },
  divisionRow: { flexDirection: 'row', gap: 8 },
  divisionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radii.full,
    borderWidth: 1,
  },
  resumen: { gap: 16 },
  barraBalance: {
    flexDirection: 'row',
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
    gap: 2,
  },
  barraA: { borderRadius: 5 },
  barraB: { borderRadius: 5 },
  personasRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  persona: { alignItems: 'center', gap: 6, flex: 1 },
  vsContainer: { paddingHorizontal: 8 },
  deudaCard: { gap: 2 },
  gastosSection: { gap: 12 },
});
