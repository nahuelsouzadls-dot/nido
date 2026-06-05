import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Radii, Spacing } from '@/constants/theme';
import { useColors } from '@/hooks/useColors';
import { Text } from '@/components/ui/Text';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { useAuthStore } from '@/store/auth';
import { useFacturas } from '@/hooks/useFacturas';

const FACTURAS_COMUNES = [
  { nombre: 'UTE', icono: '💡' },
  { nombre: 'OSE', icono: '💧' },
  { nombre: 'Internet', icono: '📡' },
  { nombre: 'Alquiler', icono: '🏠' },
  { nombre: 'Gastos comunes', icono: '🏢' },
  { nombre: 'Netflix', icono: '🎬' },
  { nombre: 'Spotify', icono: '🎵' },
];

export default function ModalFactura() {
  const router = useRouter();
  const colors = useColors();
  const { perfil, companero } = useAuthStore();
  const hoy = new Date();
  const { crear } = useFacturas(hoy.getMonth() + 1, hoy.getFullYear());

  const [nombre, setNombre] = useState('');
  const [monto, setMonto] = useState('');
  const [diaVencimiento, setDiaVencimiento] = useState('');
  const [responsableId, setResponsableId] = useState(perfil?.id ?? '');
  const [loading, setLoading] = useState(false);

  const handleGuardar = async () => {
    if (!nombre.trim() || !diaVencimiento) {
      Alert.alert('Campos requeridos', 'Completá el nombre y el día de vencimiento');
      return;
    }

    const dia = parseInt(diaVencimiento);
    if (isNaN(dia) || dia < 1 || dia > 31) {
      Alert.alert('Día inválido', 'El día debe ser entre 1 y 31');
      return;
    }

    setLoading(true);
    try {
      await crear({
        nombre: nombre.trim(),
        monto: monto ? parseFloat(monto.replace(',', '.')) : null,
        dia_vencimiento: dia,
        responsable_id: responsableId || null,
        frecuencia: 'mensual',
      });
      router.back();
    } catch {
      Alert.alert('Error', 'No se pudo crear la factura');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={[styles.scroll, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Sugerencias rápidas */}
        <View style={styles.seccion}>
          <Text variant="footnote" color={colors.textSecondary}>
            Sugerencias
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.sugerencias}>
              {FACTURAS_COMUNES.map((f) => (
                <TouchableOpacity
                  key={f.nombre}
                  style={[
                    styles.sugerencia,
                    { backgroundColor: colors.card, borderColor: colors.border },
                    nombre === f.nombre && { borderColor: colors.primary, backgroundColor: colors.primaryLight },
                  ]}
                  onPress={() => setNombre(f.nombre)}
                  activeOpacity={0.8}
                >
                  <Text style={{ fontSize: 18 }}>{f.icono}</Text>
                  <Text
                    variant="caption"
                    style={{
                      fontWeight: '600',
                      color: nombre === f.nombre ? colors.primary : colors.textSecondary,
                    }}
                  >
                    {f.nombre}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        <Input
          label="Nombre de la factura"
          value={nombre}
          onChangeText={setNombre}
          placeholder="Ej: UTE, Internet, Alquiler..."
          returnKeyType="next"
        />

        <Input
          label="Monto estimado (opcional)"
          value={monto}
          onChangeText={setMonto}
          placeholder="Si es variable, dejalo vacío"
          keyboardType="numeric"
          prefix="$"
          returnKeyType="next"
        />

        <Input
          label="Día de vencimiento"
          value={diaVencimiento}
          onChangeText={setDiaVencimiento}
          placeholder="Ej: 15"
          keyboardType="numeric"
          returnKeyType="done"
          suffix="de cada mes"
        />

        {/* Responsable */}
        <View style={styles.seccion}>
          <Text variant="footnote" color={colors.textSecondary}>
            Responsable de pago
          </Text>
          <View style={styles.pagadoresRow}>
            {[{ id: '', nombre: 'Cualquiera', avatar_url: null }, perfil, companero]
              .filter(Boolean)
              .map((p) => p && (
                <TouchableOpacity
                  key={p.id || 'any'}
                  style={[
                    styles.pagador,
                    { backgroundColor: colors.card, borderColor: colors.border },
                    responsableId === p.id && { borderColor: colors.primary, backgroundColor: colors.primaryLight },
                  ]}
                  onPress={() => setResponsableId(p.id)}
                  activeOpacity={0.8}
                >
                  {p.id ? (
                    <Avatar nombre={p.nombre} url={p.avatar_url} size={30} />
                  ) : (
                    <Text style={{ fontSize: 20 }}>👥</Text>
                  )}
                  <Text
                    variant="caption"
                    style={{
                      fontWeight: '600',
                      color: responsableId === p.id ? colors.primary : colors.textSecondary,
                    }}
                  >
                    {p.nombre.split(' ')[0]}
                  </Text>
                </TouchableOpacity>
              ))}
          </View>
        </View>

        <Button
          label="Crear factura"
          onPress={handleGuardar}
          loading={loading}
          size="lg"
          icon="🧾"
          style={{ marginTop: 8 }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: Spacing.md, gap: 20, paddingBottom: 60 },
  seccion: { gap: 8 },
  sugerencias: { flexDirection: 'row', gap: 8, paddingBottom: 4 },
  sugerencia: {
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: Radii.lg,
    borderWidth: 1.5,
    minWidth: 72,
  },
  pagadoresRow: { flexDirection: 'row', gap: 10 },
  pagador: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    padding: 12,
    borderRadius: Radii.lg,
    borderWidth: 1.5,
  },
});
