import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Spacing, Radii, Typography } from '@/constants/theme';
import { useColors } from '@/hooks/useColors';
import { Text } from '@/components/ui/Text';
import { FacturaCard } from '@/components/FacturaCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { FAB } from '@/components/FAB';
import { useFacturas } from '@/hooks/useFacturas';
import { formatMes } from '@/utils/format';

type Filtro = 'todas' | 'pendientes' | 'pagadas';

export default function FacturasScreen() {
  const colors = useColors();
  const hoy = new Date();
  const mes = hoy.getMonth() + 1;
  const anio = hoy.getFullYear();

  const { facturas, pagar, eliminar, recargar, todasPagadas } = useFacturas(mes, anio);
  const [filtro, setFiltro] = useState<Filtro>('todas');
  const [refreshing, setRefreshing] = useState(false);

  // Modal para ingresar monto variable (reemplaza Alert.prompt en Android)
  const [modalPago, setModalPago] = useState<{ id: string; nombre: string } | null>(null);
  const [montoPago, setMontoPago] = useState('');

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

  const handlePagar = (facturaId: string, nombre: string, montoPredeterminado?: number | null) => {
    if (montoPredeterminado) {
      Alert.alert(`Pagar ${nombre}`, `¿Confirmar pago de $${montoPredeterminado.toLocaleString('es-UY')}?`, [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Confirmar', onPress: () => pagar(facturaId, montoPredeterminado) },
      ]);
    } else if (Platform.OS === 'ios') {
      Alert.prompt(
        `Pagar ${nombre}`,
        'Ingresá el monto pagado',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Pagar',
            onPress: (monto: string | undefined) => {
              const m = parseFloat(monto?.replace(',', '.') ?? '0');
              if (m > 0) pagar(facturaId, m);
            },
          },
        ],
        'plain-text',
        '',
        'numeric',
      );
    } else {
      // Android: modal custom con TextInput
      setMontoPago('');
      setModalPago({ id: facturaId, nombre });
    }
  };

  const confirmarPagoModal = () => {
    if (!modalPago) return;
    const m = parseFloat(montoPago.replace(',', '.'));
    if (m > 0) pagar(modalPago.id, m);
    setModalPago(null);
  };

  const handleEliminar = (id: string, nombre: string) => {
    Alert.alert(`Eliminar ${nombre}`, '¿Estás seguro? Se eliminará la factura permanentemente.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => eliminar(id) },
    ]);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text variant="largeTitle" style={{ fontWeight: '800' }}>
            Facturas
          </Text>
          <Text variant="subhead" color={colors.textSecondary}>
            {formatMes(mes, anio)}
          </Text>
        </View>
        {todasPagadas ? (
          <View style={[styles.allDoneBadge, { backgroundColor: colors.successLight }]}>
            <Text style={[styles.allDoneText, { color: colors.success }]}>🎉 Todo al día</Text>
          </View>
        ) : null}
      </View>

      {/* Filtros */}
      <View style={styles.filtros}>
        {(['todas', 'pendientes', 'pagadas'] as Filtro[]).map((f) => (
          <TouchableOpacity
            key={f}
            style={[
              styles.filtro,
              { backgroundColor: colors.card, borderColor: colors.border },
              filtro === f && { backgroundColor: colors.primaryLight, borderColor: colors.primary },
            ]}
            onPress={() => setFiltro(f)}
            activeOpacity={0.8}
          >
            <Text
              variant="subhead"
              style={{
                fontWeight: '600',
                color: filtro === f ? colors.primary : colors.textSecondary,
              }}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
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
          <EmptyState
            emoji="🧾"
            titulo={filtro === 'todas' ? 'Sin facturas aún' : `Sin facturas ${filtro}`}
            descripcion={filtro === 'todas' ? 'Creá tu primera factura con el botón +' : undefined}
          />
        ) : (
          facturasVisibles.map((factura) => (
            <FacturaCard
              key={factura.id}
              factura={factura}
              onPagar={() => handlePagar(factura.id, factura.nombre, factura.monto)}
              onPress={() =>
                Alert.alert(factura.nombre, undefined, [
                  {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: () => handleEliminar(factura.id, factura.nombre),
                  },
                  { text: 'Cerrar', style: 'cancel' },
                ])
              }
            />
          ))
        )}
      </ScrollView>

      {/* Modal de pago para Android */}
      <Modal
        visible={modalPago !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setModalPago(null)}
      >
        <KeyboardAvoidingView style={styles.modalOverlay} behavior="padding">
          <View style={[styles.modalBox, { backgroundColor: colors.card }]}>
            <Text variant="headline" style={{ marginBottom: 4 }}>
              Pagar {modalPago?.nombre}
            </Text>
            <Text variant="subhead" color={colors.textSecondary} style={{ marginBottom: 16 }}>
              Ingresá el monto pagado
            </Text>
            <TextInput
              style={[
                styles.modalInput,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  color: colors.textPrimary,
                },
              ]}
              placeholder="0"
              placeholderTextColor={colors.textTertiary}
              keyboardType="numeric"
              value={montoPago}
              onChangeText={setMontoPago}
              autoFocus
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: colors.background }]}
                onPress={() => setModalPago(null)}
              >
                <Text variant="callout" color={colors.textSecondary}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: colors.primary }]}
                onPress={confirmarPagoModal}
              >
                <Text variant="callout" style={{ color: '#fff', fontWeight: '600' }}>Pagar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <FAB />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: 8,
    paddingBottom: 4,
  },
  allDoneBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  allDoneText: {
    fontWeight: '600',
    fontSize: 13,
  },
  filtros: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    gap: 8,
    paddingVertical: 12,
  },
  filtro: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: Spacing.md,
    gap: 12,
    paddingBottom: 120,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalBox: {
    borderRadius: Radii.xl,
    padding: Spacing.lg,
    width: '100%',
  },
  modalInput: {
    borderWidth: 1.5,
    borderRadius: Radii.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    ...Typography.title2,
    marginBottom: 16,
  },
  modalBtns: {
    flexDirection: 'row',
    gap: 10,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: Radii.md,
    alignItems: 'center',
  },
});
