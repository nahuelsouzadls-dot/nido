import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
  Text as RNText,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useIngresos } from '@/hooks/useIngresos';
import { PrivacyBadge } from '@/components/ui/PrivacyBadge';

const CATEGORIAS = ['Sueldo', 'Aguinaldo', 'Freelance', 'Bono', 'Otro'];

export default function ModalIngreso() {
  const router = useRouter();
  const colors = useColors();
  const hoy = new Date();
  const { agregar } = useIngresos(hoy.getMonth() + 1, hoy.getFullYear());

  const [monto, setMonto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoria, setCategoria] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [descFocused, setDescFocused] = useState(false);

  const handleGuardar = async () => {
    const montoNum = parseFloat(monto.replace(',', '.'));
    if (isNaN(montoNum) || montoNum <= 0) {
      Alert.alert('Monto inválido', 'Ingresá un monto mayor a cero');
      return;
    }
    setLoading(true);
    try {
      await agregar({
        monto: montoNum,
        descripcion: descripcion.trim() || null,
        categoria,
        fecha: hoy.toISOString().split('T')[0],
      });
      router.back();
    } catch {
      Alert.alert('Error', 'No se pudo registrar el ingreso. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const isValid = monto.length > 0 && parseFloat(monto.replace(',', '.')) > 0;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Top bar */}
      <View style={[styles.topBar, { backgroundColor: colors.background, borderBottomColor: colors.borderSubtle }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="close" size={22} color={colors.textSecondary} />
        </TouchableOpacity>
        <RNText style={[styles.topTitle, { color: colors.textPrimary }]}>Nuevo ingreso</RNText>
        <TouchableOpacity onPress={handleGuardar} disabled={loading || !isValid}>
          <RNText style={[styles.topSave, { color: isValid && !loading ? colors.personal : colors.textSecondary }]}>
            Guardar
          </RNText>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={[styles.scroll, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Monto */}
        <View style={[styles.montoCard, { backgroundColor: colors.cardPersonal, borderColor: colors.personalBorder }]}>
          <RNText style={[styles.montoHint, { color: colors.personal }]}>¿Cuánto cobraste?</RNText>
          <View style={styles.montoRow}>
            <RNText style={[styles.montoSign, { color: colors.textSecondary }]}>$</RNText>
            <TextInput
              style={[styles.montoInput, { color: colors.textPrimary }]}
              placeholder="0"
              placeholderTextColor={colors.textSecondary}
              value={monto}
              onChangeText={setMonto}
              keyboardType="decimal-pad"
              autoFocus
              returnKeyType="next"
            />
          </View>
        </View>

        {/* Descripción */}
        <View style={[styles.fieldsCard, { backgroundColor: colors.card, borderColor: colors.borderSubtle }]}>
          <TextInput
            style={[styles.fieldInput, {
              color: colors.textPrimary,
              borderColor: descFocused ? colors.personal : 'transparent',
              borderWidth: 0.5,
            }]}
            placeholder="Descripción (ej: Sueldo junio)"
            placeholderTextColor={colors.textSecondary}
            value={descripcion}
            onChangeText={setDescripcion}
            returnKeyType="done"
            onFocus={() => setDescFocused(true)}
            onBlur={() => setDescFocused(false)}
          />
        </View>

        {/* Categoría */}
        <RNText style={[styles.seccionLabel, { color: colors.textSecondary }]}>Categoría</RNText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.chips}>
            {CATEGORIAS.map((cat) => {
              const selected = categoria === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: selected ? colors.personalLight : 'rgba(255,255,255,0.55)',
                      borderColor: selected ? colors.personal : colors.borderSubtle,
                    },
                  ]}
                  onPress={() => setCategoria(cat === categoria ? null : cat)}
                  activeOpacity={0.8}
                >
                  <RNText style={[styles.chipText, { color: selected ? colors.personal : colors.textSecondary }]}>
                    {cat}
                  </RNText>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        <RNText style={[styles.nota, { color: colors.textSecondary }]}>
          Los ingresos siempre son personales
        </RNText>

        <PrivacyBadge />

        {/* Save button */}
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: colors.personal, opacity: loading || !isValid ? 0.5 : 1 }]}
          onPress={handleGuardar}
          disabled={loading || !isValid}
          activeOpacity={0.8}
        >
          <RNText style={styles.saveBtnText}>{loading ? 'Guardando...' : 'Registrar ingreso'}</RNText>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 0.5 },
  topTitle: { fontFamily: 'Manrope_700Bold', fontSize: 13 },
  topSave: { fontFamily: 'Manrope_700Bold', fontSize: 13 },
  scroll: { flex: 1 },
  content: { padding: 16, gap: 14, paddingBottom: 60 },
  montoCard: { borderRadius: 14, borderWidth: 0.5, padding: 16, alignItems: 'center', gap: 8 },
  montoHint: { fontFamily: 'Manrope_700Bold', fontSize: 9, letterSpacing: 0.5 },
  montoRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  montoSign: { fontFamily: 'Manrope_700Bold', fontSize: 20 },
  montoInput: { fontFamily: 'Manrope_800ExtraBold', fontSize: 34, letterSpacing: -1, textAlign: 'center', minWidth: 80 },
  fieldsCard: { borderRadius: 14, borderWidth: 0.5, overflow: 'hidden' },
  fieldInput: { fontFamily: 'Manrope_600SemiBold', fontSize: 12, paddingHorizontal: 14, paddingVertical: 13, borderRadius: 12 },
  seccionLabel: { fontFamily: 'Manrope_700Bold', fontSize: 9, letterSpacing: 0.5 },
  chips: { flexDirection: 'row', gap: 8, paddingBottom: 2 },
  chip: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7, borderWidth: 0.5 },
  chipText: { fontFamily: 'Manrope_600SemiBold', fontSize: 10 },
  nota: { fontFamily: 'Manrope_500Medium', fontSize: 9, textAlign: 'center' },
  saveBtn: { borderRadius: 13, paddingVertical: 14, alignItems: 'center', marginTop: 4 },
  saveBtnText: { fontFamily: 'Manrope_700Bold', fontSize: 13, color: '#fff' },
});
