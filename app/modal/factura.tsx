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
import { Avatar } from '@/components/ui/Avatar';
import { useAuthStore } from '@/store/auth';
import { useFacturas } from '@/hooks/useFacturas';

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

const CATEGORIAS: { nombre: string; icon: IconName }[] = [
  { nombre: 'Servicios', icon: 'lightning-bolt' },
  { nombre: 'Internet', icon: 'wifi' },
  { nombre: 'Alquiler', icon: 'home-city-outline' },
  { nombre: 'Impuestos', icon: 'office-building-outline' },
  { nombre: 'Suscripciones', icon: 'television-play' },
  { nombre: 'Otro', icon: 'dots-horizontal' },
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
  const [nombreFocused, setNombreFocused] = useState(false);
  const [montoFocused, setMontoFocused] = useState(false);
  const [diaFocused, setDiaFocused] = useState(false);

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
      {/* Top bar */}
      <View style={[styles.topBar, { backgroundColor: colors.background, borderBottomColor: colors.borderSubtle }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="close" size={22} color={colors.textSecondary} />
        </TouchableOpacity>
        <RNText style={[styles.topTitle, { color: colors.textPrimary }]}>Nueva factura</RNText>
        <TouchableOpacity onPress={handleGuardar} disabled={loading}>
          <RNText style={[styles.topSave, { color: loading ? colors.textSecondary : colors.primary }]}>
            Guardar
          </RNText>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={[styles.scroll, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Monto field */}
        <View style={[styles.montoCard, { backgroundColor: 'rgba(255,255,255,0.55)', borderColor: 'rgba(107,45,62,0.2)' }]}>
          <RNText style={[styles.montoSign, { color: colors.textSecondary }]}>$</RNText>
          <TextInput
            style={[styles.montoInput, { color: colors.textPrimary }]}
            placeholder="0"
            placeholderTextColor={colors.textSecondary}
            value={monto}
            onChangeText={setMonto}
            keyboardType="numeric"
            returnKeyType="next"
          />
          <RNText style={[styles.montoHint, { color: colors.textSecondary }]}>opcional</RNText>
        </View>

        {/* Campos */}
        <View style={[styles.fieldsCard, { backgroundColor: colors.card, borderColor: colors.borderSubtle }]}>
          <View style={styles.fieldRow}>
            <RNText style={[styles.fieldLabel, { color: colors.textSecondary }]}>Nombre</RNText>
            <TextInput
              style={[styles.fieldInput, {
                backgroundColor: nombreFocused ? 'rgba(255,255,255,0.85)' : 'transparent',
                borderColor: nombreFocused ? colors.primary : 'transparent',
                color: colors.textPrimary,
              }]}
              placeholder="Ej: UTE, Alquiler, Internet..."
              placeholderTextColor={colors.textSecondary}
              value={nombre}
              onChangeText={setNombre}
              returnKeyType="next"
              autoFocus
              onFocus={() => setNombreFocused(true)}
              onBlur={() => setNombreFocused(false)}
            />
          </View>
          <View style={[styles.fieldSep, { backgroundColor: colors.borderSubtle }]} />
          <View style={styles.fieldRow}>
            <RNText style={[styles.fieldLabel, { color: colors.textSecondary }]}>Vence el día</RNText>
            <TextInput
              style={[styles.fieldInput, {
                backgroundColor: diaFocused ? 'rgba(255,255,255,0.85)' : 'transparent',
                borderColor: diaFocused ? colors.primary : 'transparent',
                color: colors.textPrimary,
              }]}
              placeholder="Ej: 15"
              placeholderTextColor={colors.textSecondary}
              value={diaVencimiento}
              onChangeText={setDiaVencimiento}
              keyboardType="numeric"
              returnKeyType="done"
              onFocus={() => setDiaFocused(true)}
              onBlur={() => setDiaFocused(false)}
            />
          </View>
        </View>

        {/* Categorías */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.chips}>
            {CATEGORIAS.map((cat) => {
              const selected = nombre === cat.nombre;
              return (
                <TouchableOpacity
                  key={cat.nombre}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: selected ? 'rgba(107,45,62,0.1)' : 'rgba(255,255,255,0.55)',
                      borderColor: selected ? colors.primary : 'rgba(107,45,62,0.14)',
                    },
                  ]}
                  onPress={() => setNombre(cat.nombre)}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons name={cat.icon} size={14} color={selected ? colors.primary : colors.textSecondary} />
                  <RNText style={[styles.chipText, { color: selected ? colors.primary : colors.textSecondary }]}>
                    {cat.nombre}
                  </RNText>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Responsable */}
        <View style={styles.seccion}>
          <RNText style={[styles.seccionLabel, { color: colors.textSecondary }]}>Responsable</RNText>
          <View style={styles.pagadoresRow}>
            {[{ id: '', nombre: 'Cualquiera', avatar_url: null as string | null }, perfil, companero]
              .filter(Boolean)
              .map((p) => p && (
                <TouchableOpacity
                  key={p.id || 'any'}
                  style={[
                    styles.pagador,
                    {
                      backgroundColor: responsableId === p.id ? 'rgba(107,45,62,0.1)' : colors.card,
                      borderColor: responsableId === p.id ? colors.primary : colors.borderSubtle,
                    },
                  ]}
                  onPress={() => setResponsableId(p.id)}
                  activeOpacity={0.8}
                >
                  {p.id ? (
                    <Avatar nombre={p.nombre} url={p.avatar_url} size={28} color={colors.primaryLight} />
                  ) : (
                    <View style={[styles.anyIcon, { backgroundColor: colors.borderSubtle }]}>
                      <MaterialCommunityIcons name="account-multiple-outline" size={16} color={colors.textSecondary} />
                    </View>
                  )}
                  <RNText style={[styles.pagadorNombre, {
                    color: responsableId === p.id ? colors.primary : colors.textSecondary,
                  }]}>
                    {p.nombre.split(' ')[0]}
                  </RNText>
                </TouchableOpacity>
              ))}
          </View>
        </View>

        {/* Save button */}
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: colors.primary, opacity: loading ? 0.6 : 1 }]}
          onPress={handleGuardar}
          disabled={loading}
          activeOpacity={0.8}
        >
          <RNText style={styles.saveBtnText}>{loading ? 'Guardando...' : 'Crear factura'}</RNText>
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
  montoCard: { borderRadius: 14, borderWidth: 0.5, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  montoSign: { fontFamily: 'Manrope_700Bold', fontSize: 20 },
  montoInput: { fontFamily: 'Manrope_800ExtraBold', fontSize: 34, letterSpacing: -1, textAlign: 'center', minWidth: 80 },
  montoHint: { fontFamily: 'Manrope_500Medium', fontSize: 9, alignSelf: 'flex-end', marginBottom: 6 },
  fieldsCard: { borderRadius: 14, borderWidth: 0.5, overflow: 'hidden' },
  fieldRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 4 },
  fieldLabel: { fontFamily: 'Manrope_600SemiBold', fontSize: 11, width: 100 },
  fieldInput: { flex: 1, fontFamily: 'Manrope_600SemiBold', fontSize: 11, paddingVertical: 10, paddingHorizontal: 8, borderRadius: 8, borderWidth: 0.5 },
  fieldSep: { height: 0.5, marginHorizontal: 14 },
  chips: { flexDirection: 'row', gap: 8, paddingBottom: 2 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 0.5 },
  chipText: { fontFamily: 'Manrope_600SemiBold', fontSize: 10 },
  seccion: { gap: 8 },
  seccionLabel: { fontFamily: 'Manrope_700Bold', fontSize: 9, letterSpacing: 0.5 },
  pagadoresRow: { flexDirection: 'row', gap: 10 },
  pagador: { flex: 1, alignItems: 'center', gap: 6, padding: 12, borderRadius: 14, borderWidth: 0.5 },
  anyIcon: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  pagadorNombre: { fontFamily: 'Manrope_600SemiBold', fontSize: 10 },
  saveBtn: { borderRadius: 13, paddingVertical: 14, alignItems: 'center', marginTop: 4 },
  saveBtnText: { fontFamily: 'Manrope_700Bold', fontSize: 13, color: '#fff' },
});
