import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useSpace } from '@/context/SpaceContext';
import { Text } from '@/components/ui/Text';
import { ObjetivoCard } from '@/components/ObjetivoCard';
import { ContextSelectorBar } from '@/components/ui/ContextSelectorBar';
import { useObjetivos } from '@/hooks/useObjetivos';
import { formatMes } from '@/utils/format';

export default function ObjetivosScreen() {
  const router = useRouter();
  const colors = useColors();
  const { activeContext } = useSpace();
  const isPersonal = activeContext === 'personal';
  const accentColor = isPersonal ? colors.personal : colors.sage;
  const accentLight = isPersonal ? 'rgba(15,110,86,0.15)' : 'rgba(90,122,72,0.15)';
  const hoy = new Date();
  const { objetivos, recargar, eliminar } = useObjetivos({ scope: activeContext });
  const [refreshing, setRefreshing] = useState(false);

  const activos = objetivos.filter((o) => !o.completado);
  const completados = objetivos.filter((o) => o.completado);

  const refresh = async () => {
    setRefreshing(true);
    await recargar();
    setRefreshing(false);
  };

  const handleEliminar = (id: string, nombre: string) => {
    if (Platform.OS === 'web') {
      if (!window.confirm(`¿Eliminar "${nombre}"? Esta acción no se puede deshacer.`)) return;
      eliminar(id);
    } else {
      Alert.alert(
        `Eliminar objetivo`,
        `¿Querés eliminar "${nombre}"? Esta acción no se puede deshacer.`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Eliminar', style: 'destructive', onPress: () => eliminar(id) },
        ],
      );
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.labelCaps, { color: colors.textSecondary }]}>
            {formatMes(hoy.getMonth() + 1, hoy.getFullYear()).toUpperCase()}
          </Text>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Objetivos</Text>
        </View>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: accentColor }]}
          onPress={() => router.push('/modal/objetivo')}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="plus" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.sage} />}
      >
        <ContextSelectorBar />

        {objetivos.length === 0 ? (
          /* Empty state */
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIcon, { backgroundColor: isPersonal ? colors.personalLight : colors.sageLight }]}>
              <MaterialCommunityIcons name="target" size={26} color={accentColor} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
              {isPersonal ? '¿A qué estás apuntando?' : '¿Qué están construyendo?'}
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
              {isPersonal
                ? 'Un viaje, una notebook, un fondo de emergencia.'
                : 'Creá un objetivo compartido y vean cómo avanzan juntos.'}
            </Text>
            <TouchableOpacity
              style={[styles.emptyBtn, { backgroundColor: accentColor }]}
              onPress={() => router.push('/modal/objetivo')}
              activeOpacity={0.8}
            >
              <Text style={styles.emptyBtnText}>
                {isPersonal ? 'Crear primer objetivo personal' : 'Crear primer objetivo'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {activos.map((obj) => (
              <ObjetivoCard
                key={obj.id}
                objetivo={obj}
                accentColor={accentColor}
                accentLight={accentLight}
                onAportar={() => router.push({
                  pathname: '/modal/objetivo',
                  params: {
                    id: obj.id,
                    modo: 'aportar',
                    nombre: obj.nombre,
                    montoObjetivo: obj.monto_objetivo.toString(),
                    montoActual: obj.monto_actual.toString(),
                    scope: obj.scope,
                  },
                })}
                onDelete={() => handleEliminar(obj.id, obj.nombre)}
              />
            ))}

            {/* Add card */}
            <TouchableOpacity
              style={[styles.addCard, { borderColor: isPersonal ? 'rgba(15,110,86,0.3)' : 'rgba(90,122,72,0.3)',
                backgroundColor: isPersonal ? 'rgba(15,110,86,0.06)' : 'rgba(90,122,72,0.06)' }]}
              onPress={() => router.push('/modal/objetivo')}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="plus" size={20} color={accentColor} />
              <View>
                <Text style={[styles.addCardTitle, { color: accentColor }]}>
                  {isPersonal ? 'Nuevo objetivo personal' : 'Nuevo objetivo'}
                </Text>
                <Text style={[styles.addCardSubtext, { color: colors.textSecondary }]}>
                  {isPersonal ? '¿A qué estás apuntando?' : '¿Qué están ahorrando juntos?'}
                </Text>
              </View>
            </TouchableOpacity>

            {completados.length > 0 && (
              <View style={styles.seccion}>
                <Text style={[styles.seccionLabel, { color: colors.textSecondary }]}>
                  COMPLETADOS
                </Text>
                {completados.map((obj) => (
                  <ObjetivoCard
                    key={obj.id}
                    objetivo={obj}
                    accentColor={accentColor}
                    accentLight={accentLight}
                    onDelete={() => handleEliminar(obj.id, obj.nombre)}
                  />
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
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
    paddingBottom: 12,
  },
  labelCaps: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 8,
    letterSpacing: 0.8,
  },
  title: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 20,
    letterSpacing: -0.4,
  },
  addBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: { flex: 1 },
  content: { padding: 16, gap: 12, paddingBottom: 100 },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 15,
    textAlign: 'center',
  },
  emptySubtext: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 24,
  },
  emptyBtn: {
    borderRadius: 13,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 8,
  },
  emptyBtnText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 12,
    color: '#fff',
  },
  addCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    backgroundColor: 'rgba(90,122,72,0.06)',
    padding: 14,
  },
  addCardTitle: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 13,
  },
  addCardSubtext: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 10,
    marginTop: 1,
  },
  seccion: { gap: 8 },
  seccionLabel: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 8,
    letterSpacing: 0.8,
    marginTop: 8,
  },
});
