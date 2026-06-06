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
  Text as RNText,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { FacturaCard } from '@/components/FacturaCard';
import { FAB } from '@/components/FAB';
import { useFacturas } from '@/hooks/useFacturas';
import { formatMes } from '@/utils/format';

type Filtro = 'todas' | 'pendientes' | 'pagadas';

export default function FacturasScreen() {
  const router = useRouter();
  const colors = useColors();
  const hoy = new Date();
  const mes = hoy.getMonth() + 1;
  const anio = hoy.getFullYear();

  const { facturas, pagar, eliminar, recargar, todasPagadas } = useFacturas(mes, anio);
  const [filtro, setFiltro] = useState<Filtro>('todas');
  const [refreshing, setRefreshing] = useState(false);
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
          <RNText style={[styles.title, { color: colors.textPrimary }]}>Facturas</RNText>
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
            <View style={[styles.emptyIcon, { backgroundColor: 'rgba(107,45,62,0.08)' }]}>
              <MaterialCommunityIcons name="file-document-outline" size={26} color={colors.primary} />
            </View>
            <RNText style={[styles.emptyTitle, { color: colors.textPrimary }]}>
              {filtro === 'todas' ? 'Sin facturas todavía' : `Sin facturas ${filtro}`}
            </RNText>
            {filtro === 'todas' && (
              <RNText style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                Registrá tu primera factura recurrente
              </RNText>
            )}
            {filtro === 'todas' && (
              <TouchableOpacity
                style={[styles.emptyBtn, { backgroundColor: colors.primary }]}
                onPress={() => router.push('/modal/factura')}
                activeOpacity={0.8}
              >
                <RNText style={styles.emptyBtnText}>Agregar primera factura</RNText>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          facturasVisibles.map((factura) => (
            <FacturaCard
              key={factura.id}
              factura={factura}
              onPagar={() => handlePagar(factura.id, factura.nombre, factura.monto)}
              onPress={() =>
                Alert.alert(factura.nombre, undefined, [
                  { text: 'Eliminar', style: 'destructive', onPress: () => handleEliminar(factura.id, factura.nombre) },
                  { text: 'Cerrar', style: 'cancel' },
                ])
              }
            />
          ))
        )}
      </ScrollView>

      {/* Payment modal for Android */}
      <Modal
        visible={modalPago !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setModalPago(null)}
      >
        <KeyboardAvoidingView style={styles.modalOverlay} behavior="padding">
          <View style={[styles.modalBox, { backgroundColor: '#fff' }]}>
            <RNText style={[styles.modalTitle, { color: colors.textPrimary }]}>
              Pagar {modalPago?.nombre}
            </RNText>
            <RNText style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
              Ingresá el monto pagado
            </RNText>
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.background, borderColor: colors.borderSubtle, color: colors.textPrimary }]}
              placeholder="0"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              value={montoPago}
              onChangeText={setMontoPago}
              autoFocus
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: 'rgba(30,10,16,0.07)' }]}
                onPress={() => setModalPago(null)}
              >
                <RNText style={[styles.modalBtnText, { color: colors.textSecondary }]}>Cancelar</RNText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: colors.primary }]}
                onPress={confirmarPagoModal}
              >
                <RNText style={[styles.modalBtnText, { color: '#fff' }]}>Pagar</RNText>
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

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalBox: { borderRadius: 20, padding: 24, width: '100%' },
  modalTitle: { fontFamily: 'Manrope_700Bold', fontSize: 15, marginBottom: 4 },
  modalSubtitle: { fontFamily: 'Manrope_500Medium', fontSize: 11, marginBottom: 16 },
  modalInput: { borderWidth: 0.5, borderRadius: 12, paddingHorizontal: 13, paddingVertical: 11, fontFamily: 'Manrope_800ExtraBold', fontSize: 22, marginBottom: 16 },
  modalBtns: { flexDirection: 'row', gap: 10 },
  modalBtn: { flex: 1, paddingVertical: 12, borderRadius: 13, alignItems: 'center' },
  modalBtnText: { fontFamily: 'Manrope_700Bold', fontSize: 12 },
});
