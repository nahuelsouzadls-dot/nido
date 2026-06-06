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
import { useObjetivos } from '@/hooks/useObjetivos';

export default function ModalObjetivo() {
  const router = useRouter();
  const colors = useColors();
  const { crear } = useObjetivos();

  const [nombre, setNombre] = useState('');
  const [monto, setMonto] = useState('');
  const [yaTeemos, setYaTenemos] = useState('');
  const [loading, setLoading] = useState(false);
  const [nombreFocused, setNombreFocused] = useState(false);
  const [yaFocused, setYaFocused] = useState(false);

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
        descripcion: null,
        monto_objetivo: montoNum,
        icono: 'target',
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
      {/* Top bar */}
      <View style={[styles.topBar, { backgroundColor: colors.background, borderBottomColor: colors.borderSubtle }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="close" size={22} color={colors.textSecondary} />
        </TouchableOpacity>
        <RNText style={[styles.topTitle, { color: colors.textPrimary }]}>Nuevo objetivo</RNText>
        <TouchableOpacity onPress={handleGuardar} disabled={loading}>
          <RNText style={[styles.topSave, { color: loading ? colors.textSecondary : colors.sage }]}>Guardar</RNText>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={[styles.scroll, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Meta monto */}
        <View style={[styles.montoCard, { backgroundColor: 'rgba(90,122,72,0.06)', borderColor: 'rgba(90,122,72,0.2)' }]}>
          <RNText style={[styles.montoLabel, { color: colors.sage }]}>META</RNText>
          <View style={styles.montoRow}>
            <RNText style={[styles.montoSign, { color: colors.textSecondary }]}>$</RNText>
            <TextInput
              style={[styles.montoInput, { color: colors.textPrimary }]}
              placeholder="0"
              placeholderTextColor={colors.textSecondary}
              value={monto}
              onChangeText={setMonto}
              keyboardType="numeric"
              returnKeyType="next"
              autoFocus
            />
          </View>
        </View>

        {/* Campos */}
        <View style={[styles.fieldsCard, { backgroundColor: colors.card, borderColor: colors.borderSubtle }]}>
          <View style={styles.fieldRow}>
            <RNText style={[styles.fieldLabel, { color: colors.textSecondary }]}>Nombre</RNText>
            <TextInput
              style={[styles.fieldInput, {
                backgroundColor: nombreFocused ? 'rgba(255,255,255,0.85)' : 'transparent',
                borderColor: nombreFocused ? colors.sage : 'transparent',
                color: colors.textPrimary,
              }]}
              placeholder="¿Qué están ahorrando?"
              placeholderTextColor={colors.textSecondary}
              value={nombre}
              onChangeText={setNombre}
              returnKeyType="next"
              onFocus={() => setNombreFocused(true)}
              onBlur={() => setNombreFocused(false)}
            />
          </View>
          <View style={[styles.fieldSep, { backgroundColor: colors.borderSubtle }]} />
          <View style={styles.fieldRow}>
            <RNText style={[styles.fieldLabel, { color: colors.textSecondary }]}>Ya tenemos</RNText>
            <TextInput
              style={[styles.fieldInput, {
                backgroundColor: yaFocused ? 'rgba(255,255,255,0.85)' : 'transparent',
                borderColor: yaFocused ? colors.sage : 'transparent',
                color: colors.textPrimary,
              }]}
              placeholder="0 (opcional)"
              placeholderTextColor={colors.textSecondary}
              value={yaTeemos}
              onChangeText={setYaTenemos}
              keyboardType="numeric"
              returnKeyType="done"
              onFocus={() => setYaFocused(true)}
              onBlur={() => setYaFocused(false)}
            />
          </View>
        </View>

        {/* Save button */}
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: colors.sage, opacity: loading ? 0.6 : 1 }]}
          onPress={handleGuardar}
          disabled={loading}
          activeOpacity={0.8}
        >
          <RNText style={styles.saveBtnText}>{loading ? 'Creando...' : 'Crear objetivo'}</RNText>
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
  montoCard: { borderRadius: 14, borderWidth: 0.5, padding: 16, alignItems: 'center', gap: 6 },
  montoLabel: { fontFamily: 'Manrope_700Bold', fontSize: 8, letterSpacing: 0.8 },
  montoRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  montoSign: { fontFamily: 'Manrope_700Bold', fontSize: 20 },
  montoInput: { fontFamily: 'Manrope_800ExtraBold', fontSize: 34, letterSpacing: -1, textAlign: 'center', minWidth: 80 },
  fieldsCard: { borderRadius: 14, borderWidth: 0.5, overflow: 'hidden' },
  fieldRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 4 },
  fieldLabel: { fontFamily: 'Manrope_600SemiBold', fontSize: 11, width: 100 },
  fieldInput: { flex: 1, fontFamily: 'Manrope_600SemiBold', fontSize: 11, paddingVertical: 10, paddingHorizontal: 8, borderRadius: 8, borderWidth: 0.5 },
  fieldSep: { height: 0.5, marginHorizontal: 14 },
  saveBtn: { borderRadius: 13, paddingVertical: 14, alignItems: 'center', marginTop: 4 },
  saveBtnText: { fontFamily: 'Manrope_700Bold', fontSize: 13, color: '#fff' },
});
