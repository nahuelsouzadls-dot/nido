import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Spacing } from '@/constants/theme';
import { useColors } from '@/hooks/useColors';
import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { ActividadItem } from '@/components/ActividadItem';
import { ObjetivoCard } from '@/components/ObjetivoCard';
import { FAB } from '@/components/FAB';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuthStore } from '@/store/auth';
import { useActividad } from '@/hooks/useActividad';
import { useFacturas } from '@/hooks/useFacturas';
import { useObjetivos } from '@/hooks/useObjetivos';
import { useGastos } from '@/hooks/useGastos';
import { formatMonto, formatMes } from '@/utils/format';

export default function HomeScreen() {
  const router = useRouter();
  const colors = useColors();
  const { hogar, perfil, companero } = useAuthStore();
  const hoy = new Date();
  const mes = hoy.getMonth() + 1;
  const anio = hoy.getFullYear();

  const { actividad, recargar: recargarAct } = useActividad();
  const { facturas, pendientes, vencidas, todasPagadas } = useFacturas(mes, anio);
  const { objetivos } = useObjetivos();
  const { totalMes } = useGastos(mes, anio);

  const [refreshing, setRefreshing] = useState(false);

  const refresh = async () => {
    setRefreshing(true);
    await recargarAct();
    setRefreshing(false);
  };

  const objetivosActivos = objetivos.filter((o) => !o.completado).slice(0, 2);

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
          <View>
            <Text variant="largeTitle" style={{ fontWeight: '800' }}>
              {hogar?.nombre ?? 'Nuestro Hogar'}
            </Text>
            <Text variant="subhead" color={colors.textSecondary}>
              {formatMes(mes, anio)}
            </Text>
          </View>
          <View style={styles.avatares}>
            {perfil ? <Avatar nombre={perfil.nombre} url={perfil.avatar_url} size={38} /> : null}
            {companero ? (
              <Avatar
                nombre={companero.nombre}
                url={companero.avatar_url}
                size={38}
                color="#FF9F0A"
              />
            ) : null}
          </View>
        </View>

        {/* Estado del hogar */}
        <Card style={styles.estadoCard}>
          {todasPagadas ? (
            <View style={styles.estadoRow}>
              <Text style={styles.estadoEmoji}>🎉</Text>
              <View>
                <Text variant="headline">Todo al día</Text>
                <Text variant="caption" color={colors.textSecondary}>
                  Todas las facturas del mes pagadas
                </Text>
              </View>
            </View>
          ) : vencidas.length > 0 ? (
            <TouchableOpacity
              style={styles.estadoRow}
              onPress={() => router.push('/(tabs)/facturas')}
              activeOpacity={0.8}
            >
              <Text style={styles.estadoEmoji}>⚠️</Text>
              <View style={{ flex: 1 }}>
                <Text variant="headline">
                  {vencidas.length} {vencidas.length === 1 ? 'factura vencida' : 'facturas vencidas'}
                </Text>
                <Text variant="caption" color={colors.danger}>
                  {vencidas.map((f) => f.nombre).join(', ')}
                </Text>
              </View>
              <Text color={colors.textTertiary}>›</Text>
            </TouchableOpacity>
          ) : pendientes.length > 0 ? (
            <TouchableOpacity
              style={styles.estadoRow}
              onPress={() => router.push('/(tabs)/facturas')}
              activeOpacity={0.8}
            >
              <Text style={styles.estadoEmoji}>🧾</Text>
              <View style={{ flex: 1 }}>
                <Text variant="headline">
                  {pendientes.length} {pendientes.length === 1 ? 'factura pendiente' : 'facturas pendientes'}
                </Text>
                <Text variant="caption" color={colors.textSecondary}>
                  {pendientes.map((f) => f.nombre).join(', ')}
                </Text>
              </View>
              <Text color={colors.textTertiary}>›</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.estadoRow}>
              <Text style={styles.estadoEmoji}>🏡</Text>
              <Text variant="headline">Sin facturas registradas</Text>
            </View>
          )}

          <View style={[styles.divisor, { backgroundColor: colors.border }]} />

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text variant="caption" color={colors.textSecondary}>
                Gastos del mes
              </Text>
              <Text variant="title3" style={{ fontWeight: '700' }}>
                {formatMonto(totalMes)}
              </Text>
            </View>
            <View style={[styles.statDivisor, { backgroundColor: colors.border }]} />
            <View style={styles.stat}>
              <Text variant="caption" color={colors.textSecondary}>
                Facturas pagadas
              </Text>
              <Text variant="title3" style={{ fontWeight: '700' }}>
                {facturas.filter((f) => f.pago_actual?.estado === 'pagada').length} / {facturas.length}
              </Text>
            </View>
          </View>
        </Card>

        {/* Objetivos */}
        {objetivosActivos.length > 0 ? (
          <View style={styles.seccion}>
            <View style={styles.seccionHeader}>
              <Text variant="title3">Objetivos</Text>
              <TouchableOpacity onPress={() => router.push('/modal/objetivo')}>
                <Text variant="footnote" color={colors.primary}>
                  + Nuevo
                </Text>
              </TouchableOpacity>
            </View>
            {objetivosActivos.map((obj) => (
              <ObjetivoCard key={obj.id} objetivo={obj} />
            ))}
          </View>
        ) : null}

        {/* Feed de actividad */}
        <View style={styles.seccion}>
          <Text variant="title3" style={styles.seccionTitulo}>
            Actividad
          </Text>

          {actividad.length === 0 ? (
            <EmptyState
              emoji="🌿"
              titulo="Sin actividad aún"
              descripcion="Las acciones del hogar aparecerán aquí"
            />
          ) : (
            <Card padded={false} style={styles.actividadCard}>
              {actividad.map((item, idx) => (
                <React.Fragment key={item.id}>
                  <ActividadItem item={item} />
                  {idx < actividad.length - 1 && (
                    <View style={[styles.separador, { backgroundColor: colors.border }]} />
                  )}
                </React.Fragment>
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
  safe: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: 120,
    gap: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
  },
  avatares: {
    flexDirection: 'row',
    gap: -8,
  },
  estadoCard: {
    gap: 0,
    padding: 0,
    overflow: 'hidden',
  },
  estadoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
  },
  estadoEmoji: {
    fontSize: 28,
  },
  divisor: {
    height: 1,
  },
  statsRow: {
    flexDirection: 'row',
    padding: 16,
  },
  stat: {
    flex: 1,
    gap: 4,
  },
  statDivisor: {
    width: 1,
    marginHorizontal: 16,
  },
  seccion: {
    gap: 12,
  },
  seccionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  seccionTitulo: {
    marginBottom: 0,
  },
  actividadCard: {
    overflow: 'hidden',
  },
  separador: {
    height: 1,
    marginLeft: 64,
  },
});
