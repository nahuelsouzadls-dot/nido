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
import { useObjetivos } from '@/hooks/useObjetivos';

const ICONOS = ['✈️', '🛋️', '📺', '🚗', '🏠', '💍', '🐾', '🎓', '💻', '🏖️', '🎉', '💰'];

export default function ModalObjetivo() {
  const router = useRouter();
  const colors = useColors();
  const { crear } = useObjetivos();

  const [nombre, setNombre] = useState('');
  const [monto, setMonto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [icono, setIcono] = useState('🎯');
  const [loading, setLoading] = useState(false);

  const handleGuardar = async () => {
    if (!nombre.trim() || !monto) {
      Alert.alert('Campos requeridos', 'Completá el nombre y el monto objetivo');
      return;
    }

    const montoNum = parseFloat(monto.replace(',', '.'));
    if (isNaN(montoNum) || montoNum <= 0) {
      Alert.alert('Monto inválido', 'Ingresá un monto válido');
      return;
    }

    setLoading(true);
    try {
      await crear({
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || null,
        monto_objetivo: montoNum,
        icono,
        fecha_objetivo: null,
      });
      router.back();
    } catch {
      Alert.alert('Error', 'No se pudo crear el objetivo');
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
        {/* Icono */}
        <View style={styles.seccion}>
          <Text variant="footnote" color={colors.textSecondary}>
            Icono
          </Text>
          <View style={styles.iconosGrid}>
            {ICONOS.map((i) => (
              <TouchableOpacity
                key={i}
                style={[
                  styles.iconoBtn,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  icono === i && { borderColor: colors.primary, backgroundColor: colors.primaryLight },
                ]}
                onPress={() => setIcono(i)}
                activeOpacity={0.8}
              >
                <Text style={{ fontSize: 24 }}>{i}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Input
          label="Nombre del objetivo"
          value={nombre}
          onChangeText={setNombre}
          placeholder="Ej: Vacaciones, Sofá nuevo, TV..."
          returnKeyType="next"
          autoFocus
        />

        <Input
          label="Monto objetivo"
          value={monto}
          onChangeText={setMonto}
          placeholder="0"
          keyboardType="numeric"
          prefix="$"
          returnKeyType="next"
        />

        <Input
          label="Descripción (opcional)"
          value={descripcion}
          onChangeText={setDescripcion}
          placeholder="Agregá detalles..."
          multiline
          numberOfLines={2}
        />

        <Button
          label="Crear objetivo"
          onPress={handleGuardar}
          loading={loading}
          size="lg"
          icon={icono}
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
  iconosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  iconoBtn: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radii.md,
    borderWidth: 1.5,
  },
});
