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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useSpace } from '@/context/SpaceContext';
import { Avatar } from '@/components/ui/Avatar';
import { ScopeSelector } from '@/components/ui/ScopeSelector';
import { PrivacyBadge } from '@/components/ui/PrivacyBadge';
import { useAuthStore } from '@/store/auth';
import { useFacturas } from '@/hooks/useFacturas';
import { actualizarFactura } from '@/services/facturas';
import type { Scope } from '@/types';

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

const CATEGORIAS_HOGAR: { nombre: string; icon: IconName }[] = [
  { nombre: 'Servicios', icon: 'lightning-bolt' },
  { nombre: 'Internet', icon: 'wifi' },
  { nombre: 'Alquiler', icon: 'home-city-outline' },
  { nombre: 'Impuestos', icon: 'office-building-outline' },
  { nombre: 'Suscripciones', icon: 'television-play' },
  { nombre: 'Otro', icon: 'dots-horizontal' },
];

const CATEGORIAS_PERSONAL: { nombre: string; icon: IconName }[] = [
  { nombre: 'Celular', icon: 'cellphone' },
  { nombre: 'Streaming', icon: 'television-play' },
  { nombre: 'Gimnasio', icon: 'dumbbell' },
  { nombre: 'Software', icon: 'laptop' },
  { nombre: 'Seguro', icon: 'shield-outline' },
  { nombre: 'Otro', icon: 'dots-horizontal' },
];

export default function ModalFactura() {
  const router = useRouter();
  const colors = useColors();
  const { activeContext } = useSpace();
  const { perfil, companero } = useAuthStore();
  const hoy = new Date();
  const { crear } = useFacturas(hoy.getMonth() + 1, hoy.getFullYear());

  // ── Params para modo edición ──────────────────────────────────────────────
  const params = useLocalSearchParams<{
    id?: string;
    nombre?: string;
    monto?: string;
    diaVencimiento?: string;
    responsableId?: string;
    scope?: string;
  }>();
  const esEdicion = !!params.id;
  const scopeInicial = (params.scope as Scope | undefined) ?? activeContext;

  // ── Estado ────────────────────────────────────────────────────────────────
  const [scope] = useState<Scope>(scopeInicial);
  const [nombre, setNombre] = useState(params.nombre ?? '');
  const [monto, setMonto] = useState(params.monto ?? '');
  const [diaVencimiento, setDiaVencimiento] = useState(params.diaVencimiento ?? '');
  const [responsableId, setResponsableId] = useState(params.responsableId ?? perfil?.id ?? '');
  const [loading, setLoading] = useState(false);
  const [nombreFocused, setNombreFocused] = useState(false);
  const [diaFocused, setDiaFocused] = useState(false);

  const accentColor = scope === 'personal' ? colors.personal : colors.primary;
  const categorias = scope === 'personal' ? CATEGORIAS_PERSONAL : CATEGORIAS_HOGAR;

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
    const montoNum = monto ? parseFloat(monto.replace(',', '.')) : null;

    setLoading(true);
    try {
      if (esEdicion) {
        await actualizarFactura(params.id!, {
          nombre: nombre.trim(),
          monto: montoNum,
          dia_vencimiento: dia,
          responsable_id: scope === 'hogar' ? (responsableId || null) : null,
        });
      } else {
        await crear({
          nombre: nombre.trim(),
          monto: montoNum,
          dia_vencimiento: dia,
          responsable_id: scope === 'hogar' ? (responsableId || null) : null,
          frecuencia: 'mensual',
          scope,
          creado_por: perfil?.id ?? null,
        });
      }
      router.back();
    } catch {
      Alert.alert('Error', `No se pudo ${esEdicion ? 'actualizar' : 'crear'} la factura`);
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
        <RNText style={[styles.topTitle, { color: colors.textPrimary }]}>
          {esEdicion ? 'Editar factura' : 'Nueva factura'}
        </RNText>
        <TouchableOpacity onPress={handleGuardar} disabled={loading}>
          <RNText style={[styles.topSave, { color: loading ? colors.textSecondary : accentColor }]}>
            Guardar
          </RNText>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={[styles.scroll, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Monto */}
        <View style={[styles.montoCard, {
          backgroundColor: scope === 'personal' ? colors.cardPersonal : 'rgba(255,255,255,0.55)',
          borderColor: scope === 'personal' ? colors.personalBorder : 'rgba(107,45,62,0.2)',
        }]}>
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

        {/* Scope selector — solo en creación */}
        {!esEdicion && <ScopeSelector value={scope} onChange={() => {}} />}

        {/* Campos */}
        <View style={[styles.fieldsCard, { backgroundColor: colors.card, borderColor: colors.borderSubtle }]}>
          <View style={styles.fieldRow}>
            <RNText style={[styles.fieldLabel, { color: colors.textSecondary }]}>Nombre</RNText>
            <TextInput
              style={[styles.fieldInput, {
                backgroundColor: nombreFocused ? 'rgba(255,255,255,0.85)' : 'transparent',
                borderColor: nombreFocused ? accentColor : 'transparent',
                color: colors.textPrimary,
              }]}
              placeholder="Ej: Celular, Gym, UTE..."
              placeholderTextColor={colors.textSecondary}
              value={nombre}
              onChangeText={setNombre}
              returnKeyType="next"
              autoFocus={!esEdicion}
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
                borderColor: diaFocused ? accentColor : 'transparent',
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

        {/* Categorías por scope */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.chips}>
            {categorias.map((cat) => {
              const selected = nombre === cat.nombre;
              return (
                <TouchableOpacity
                  key={cat.nombre}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: selected
                        ? (scope === 'personal' ? colors.personalLight : 'rgba(107,45,62,0.1)')
                        : 'rgba(255,255,255,0.55)',
                      borderColor: selected ? accentColor : 'rgba(107,45,62,0.14)',
                    },
                  ]}
                  onPress={() => setNombre(cat.nombre)}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons name={cat.icon} size={14} color={selected ? accentColor : colors.textSecondary} />
                  <RNText style={[styles.chipText, { color: selected ? accentColor : colors.textSecondary }]}>
                    {cat.nombre}
                  </RNText>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Responsable — solo en modo hogar */}
        {scope === 'hogar' && (
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
        )}

        {scope === 'personal' && <PrivacyBadge />}
      </ScrollView>

      <View style={styles.saveBtnContainer}>
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: accentColor, opacity: loading ? 0.6 : 1 }]}
          onPress={handleGuardar}
          disabled={loading}
          activeOpacity={0.8}
        >
          <RNText style={styles.saveBtnText}>
            {loading
              ? (esEdicion ? 'Guardando...' : 'Guardando...')
              : esEdicion
                ? 'Guardar cambios'
                : scope === 'personal' ? 'Guardar factura personal' : 'Guardar factura'}
          </RNText>
        </TouchableOpacity>
      </View>
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
  saveBtnContainer: { paddingHorizontal: 16, paddingVertical: 12, paddingBottom: 20 },
  saveBtn: { borderRadius: 13, paddingVertical: 14, alignItems: 'center' },
  saveBtnText: { fontFamily: 'Manrope_700Bold', fontSize: 13, color: '#fff' },
});
