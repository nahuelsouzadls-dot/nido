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
import { useObjetivos } from '@/hooks/useObjetivos';
import { useAuthStore } from '@/store/auth';
import { ScopeSelector } from '@/components/ui/ScopeSelector';
import { PrivacyBadge } from '@/components/ui/PrivacyBadge';
import { formatMonto } from '@/utils/format';
import type { Scope } from '@/types';

// ─── Crear objetivo ───────────────────────────────────────────────────────────

function CrearObjetivo() {
  const router = useRouter();
  const colors = useColors();
  const { activeContext } = useSpace();
  const { perfil } = useAuthStore();
  const { crear } = useObjetivos();

  const [scope, setScope] = useState<Scope>(activeContext);
  const [nombre, setNombre] = useState('');
  const [monto, setMonto] = useState('');
  const [yaTeemos, setYaTenemos] = useState('');
  const [loading, setLoading] = useState(false);
  const [nombreFocused, setNombreFocused] = useState(false);
  const [yaFocused, setYaFocused] = useState(false);

  const accentColor = scope === 'personal' ? colors.personal : colors.sage;

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
        scope,
        user_id: scope === 'personal' ? (perfil?.id ?? null) : null,
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
      <View style={[styles.topBar, { backgroundColor: colors.background, borderBottomColor: colors.borderSubtle }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="close" size={22} color={colors.textSecondary} />
        </TouchableOpacity>
        <RNText style={[styles.topTitle, { color: colors.textPrimary }]}>Nuevo objetivo</RNText>
        <TouchableOpacity onPress={handleGuardar} disabled={loading}>
          <RNText style={[styles.topSave, { color: loading ? colors.textSecondary : accentColor }]}>Guardar</RNText>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={[styles.scroll, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.montoCard, {
          backgroundColor: scope === 'personal' ? colors.cardPersonal : 'rgba(90,122,72,0.06)',
          borderColor: scope === 'personal' ? colors.personalBorder : 'rgba(90,122,72,0.2)',
        }]}>
          <RNText style={[styles.montoLabel, { color: accentColor }]}>META</RNText>
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

        <ScopeSelector value={scope} onChange={setScope} />

        <View style={[styles.fieldsCard, { backgroundColor: colors.card, borderColor: colors.borderSubtle }]}>
          <View style={styles.fieldRow}>
            <RNText style={[styles.fieldLabel, { color: colors.textSecondary }]}>Nombre</RNText>
            <TextInput
              style={[styles.fieldInput, {
                backgroundColor: nombreFocused ? 'rgba(255,255,255,0.85)' : 'transparent',
                borderColor: nombreFocused ? accentColor : 'transparent',
                color: colors.textPrimary,
              }]}
              placeholder={scope === 'personal' ? '¿A qué estás apuntando?' : '¿Qué están ahorrando?'}
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
                borderColor: yaFocused ? accentColor : 'transparent',
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

        {scope === 'personal' && <PrivacyBadge />}

        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: accentColor, opacity: loading ? 0.6 : 1 }]}
          onPress={handleGuardar}
          disabled={loading}
          activeOpacity={0.8}
        >
          <RNText style={styles.saveBtnText}>
            {loading ? 'Creando...' : scope === 'personal' ? 'Crear objetivo personal' : 'Crear objetivo'}
          </RNText>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Aportar a objetivo ───────────────────────────────────────────────────────

function AportarObjetivo({
  id,
  nombre,
  montoObjetivo,
  montoActual,
  scope,
}: {
  id: string;
  nombre: string;
  montoObjetivo: number;
  montoActual: number;
  scope: Scope;
}) {
  const router = useRouter();
  const colors = useColors();
  const { aportar } = useObjetivos({ scope });

  const [monto, setMonto] = useState('');
  const [loading, setLoading] = useState(false);

  const faltan = Math.max(0, montoObjetivo - montoActual);
  const progreso = Math.min(Math.round((montoActual / montoObjetivo) * 100), 100);

  const handleAportar = async () => {
    const montoNum = parseFloat(monto.replace(',', '.'));
    if (isNaN(montoNum) || montoNum <= 0) {
      Alert.alert('Monto inválido', 'Ingresá un monto mayor a cero');
      return;
    }
    setLoading(true);
    try {
      await aportar(id, montoNum);
      router.back();
    } catch {
      Alert.alert('Error', 'No se pudo registrar el aporte');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.topBar, { backgroundColor: colors.background, borderBottomColor: colors.borderSubtle }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="close" size={22} color={colors.textSecondary} />
        </TouchableOpacity>
        <RNText style={[styles.topTitle, { color: colors.textPrimary }]}>Aportar</RNText>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        style={[styles.scroll, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Objetivo info */}
        <View style={[styles.objetivoInfo, { backgroundColor: 'rgba(90,122,72,0.06)', borderColor: 'rgba(90,122,72,0.2)' }]}>
          <RNText style={[styles.objetivoNombre, { color: colors.textPrimary }]}>{nombre}</RNText>
          <View style={[styles.progressTrack, { backgroundColor: 'rgba(90,122,72,0.15)' }]}>
            <View style={[styles.progressFill, { width: `${progreso}%` as `${number}%`, backgroundColor: colors.sage }]} />
          </View>
          <View style={styles.progressMeta}>
            <RNText style={[styles.progressText, { color: colors.textSecondary }]}>
              {formatMonto(montoActual)} de {formatMonto(montoObjetivo)}
            </RNText>
            <RNText style={[styles.progressPct, { color: colors.sage }]}>{progreso}%</RNText>
          </View>
          {faltan > 0 && (
            <RNText style={[styles.faltanText, { color: colors.textSecondary }]}>
              Faltan {formatMonto(faltan)}
            </RNText>
          )}
        </View>

        {/* Monto input */}
        <View style={[styles.montoCard, { backgroundColor: 'rgba(90,122,72,0.06)', borderColor: 'rgba(90,122,72,0.2)' }]}>
          <RNText style={[styles.montoLabel, { color: colors.sage }]}>APORTE</RNText>
          <View style={styles.montoRow}>
            <RNText style={[styles.montoSign, { color: colors.textSecondary }]}>$</RNText>
            <TextInput
              style={[styles.montoInput, { color: colors.textPrimary }]}
              placeholder="0"
              placeholderTextColor={colors.textSecondary}
              value={monto}
              onChangeText={setMonto}
              keyboardType="numeric"
              returnKeyType="done"
              onSubmitEditing={handleAportar}
              autoFocus
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: colors.sage, opacity: loading ? 0.6 : 1 }]}
          onPress={handleAportar}
          disabled={loading}
          activeOpacity={0.8}
        >
          <RNText style={styles.saveBtnText}>{loading ? 'Guardando...' : 'Confirmar aporte'}</RNText>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Entry point ──────────────────────────────────────────────────────────────

export default function ModalObjetivo() {
  const params = useLocalSearchParams<{
    id?: string;
    modo?: string;
    nombre?: string;
    montoObjetivo?: string;
    montoActual?: string;
    scope?: string;
  }>();

  if (params.modo === 'aportar' && params.id && params.nombre) {
    return (
      <AportarObjetivo
        id={params.id}
        nombre={params.nombre}
        montoObjetivo={parseFloat(params.montoObjetivo ?? '0')}
        montoActual={parseFloat(params.montoActual ?? '0')}
        scope={(params.scope as Scope) ?? 'hogar'}
      />
    );
  }

  return <CrearObjetivo />;
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 0.5 },
  topTitle: { fontFamily: 'Manrope_700Bold', fontSize: 13 },
  topSave: { fontFamily: 'Manrope_700Bold', fontSize: 13 },
  scroll: { flex: 1 },
  content: { padding: 16, gap: 14, paddingBottom: 60 },

  // Objetivo info (aportar mode)
  objetivoInfo: { borderRadius: 14, borderWidth: 0.5, padding: 16, gap: 10 },
  objetivoNombre: { fontFamily: 'Manrope_700Bold', fontSize: 14 },
  progressTrack: { height: 5, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: 5, borderRadius: 3 },
  progressMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressText: { fontFamily: 'Manrope_500Medium', fontSize: 10 },
  progressPct: { fontFamily: 'Manrope_700Bold', fontSize: 10 },
  faltanText: { fontFamily: 'Manrope_500Medium', fontSize: 9 },

  // Monto card
  montoCard: { borderRadius: 14, borderWidth: 0.5, padding: 16, alignItems: 'center', gap: 6 },
  montoLabel: { fontFamily: 'Manrope_700Bold', fontSize: 8, letterSpacing: 0.8 },
  montoRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  montoSign: { fontFamily: 'Manrope_700Bold', fontSize: 20 },
  montoInput: { fontFamily: 'Manrope_800ExtraBold', fontSize: 34, letterSpacing: -1, textAlign: 'center', minWidth: 80 },

  // Fields (crear mode)
  fieldsCard: { borderRadius: 14, borderWidth: 0.5, overflow: 'hidden' },
  fieldRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 4 },
  fieldLabel: { fontFamily: 'Manrope_600SemiBold', fontSize: 11, width: 100 },
  fieldInput: { flex: 1, fontFamily: 'Manrope_600SemiBold', fontSize: 11, paddingVertical: 10, paddingHorizontal: 8, borderRadius: 8, borderWidth: 0.5 },
  fieldSep: { height: 0.5, marginHorizontal: 14 },

  // Save button
  saveBtn: { borderRadius: 13, paddingVertical: 14, alignItems: 'center', marginTop: 4 },
  saveBtnText: { fontFamily: 'Manrope_700Bold', fontSize: 13, color: '#fff' },
});
