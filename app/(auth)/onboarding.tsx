import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Text as RNText,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Rect, Polygon } from 'react-native-svg';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useAuthStore } from '@/store/auth';
import { supabase } from '@/lib/supabase';
import { CATEGORIAS_DEFAULT } from '@/constants/categories';

type Paso = 'inicio' | 'crear-hogar' | 'unirse-hogar';

function CasaSVG() {
  return (
    <Svg width={64} height={56} viewBox="0 0 64 56">
      <Rect x="10" y="24" width="44" height="28" rx="5" fill="#EDD5C4" stroke="#6B2D3E" strokeWidth="1.2" />
      <Polygon points="32,4 6,26 58,26" fill="#6B2D3E" opacity={0.75} />
      <Rect x="26" y="36" width="12" height="16" rx="3" fill="#F5F0F2" stroke="#6B2D3E" strokeWidth="0.8" />
      <Rect x="14" y="30" width="10" height="8" rx="2" fill="#F5F0F2" stroke="#6B2D3E" strokeWidth="0.7" />
      <Rect x="40" y="30" width="10" height="8" rx="2" fill="#F5F0F2" stroke="#6B2D3E" strokeWidth="0.7" />
    </Svg>
  );
}

export default function OnboardingScreen() {
  const { session, cargarPerfil, perfil } = useAuthStore();
  const colors = useColors();
  const [paso, setPaso] = useState<Paso>('inicio');
  const [nombreHogar, setNombreHogar] = useState('');
  const [codigoHogar, setCodigoHogar] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hogarFocused, setHogarFocused] = useState(false);
  const [codigoFocused, setCodigoFocused] = useState(false);

  const resolverNombre = () =>
    perfil?.nombre ||
    (session?.user.user_metadata?.nombre as string | undefined) ||
    session?.user.email?.split('@')[0] ||
    'Usuario';

  const crearHogar = async () => {
    if (!nombreHogar.trim() || !session?.user) return;
    setLoading(true);
    setError('');
    try {
      const { data: hogar, error: hogarError } = await supabase
        .from('hogares').insert({ nombre: nombreHogar.trim() }).select().single();
      if (hogarError) throw hogarError;

      const { error: perfilError } = await supabase
        .from('perfiles').upsert({ id: session.user.id, nombre: resolverNombre(), hogar_id: hogar.id });
      if (perfilError) throw perfilError;

      await supabase.from('categorias').insert(
        CATEGORIAS_DEFAULT.map((c) => ({
          hogar_id: hogar.id, nombre: c.nombre, icono: c.icono, color: c.color, es_sistema: true,
        })),
      );
      await cargarPerfil();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error creando el hogar');
    } finally {
      setLoading(false);
    }
  };

  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  const unirseHogar = async () => {
    if (!codigoHogar.trim() || !session?.user) return;
    if (!UUID_REGEX.test(codigoHogar.trim())) {
      setError('El código no tiene el formato correcto.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { data: hogar, error: hogarError } = await supabase
        .from('hogares').select('id, nombre').eq('id', codigoHogar.trim()).single();
      if (hogarError || !hogar) {
        setError('No encontramos ese hogar. Verificá el código.');
        return;
      }
      const { error: perfilError } = await supabase
        .from('perfiles').upsert({ id: session.user.id, nombre: resolverNombre(), hogar_id: hogar.id });
      if (perfilError) throw perfilError;
      await cargarPerfil();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error uniéndose al hogar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      {/* Decorative circles */}
      <View style={styles.circle1} />
      <View style={styles.circle2} />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

          {paso === 'inicio' ? (
            <>
              <View style={styles.logoArea}>
                <CasaSVG />
                <RNText style={[styles.pageTitle, { color: colors.textPrimary }]}>
                  Tu hogar te espera
                </RNText>
                <RNText style={[styles.pageSubtitle, { color: colors.textSecondary }]}>
                  Creá un nuevo hogar o unite al de tu compañero/a
                </RNText>
              </View>

              <View style={styles.opciones}>
                <TouchableOpacity
                  style={[styles.opcion, { backgroundColor: colors.card, borderColor: colors.borderSubtle }]}
                  onPress={() => setPaso('crear-hogar')}
                  activeOpacity={0.8}
                >
                  <View style={[styles.opcionIcon, { backgroundColor: 'rgba(107,45,62,0.08)' }]}>
                    <MaterialCommunityIcons name="home-plus-outline" size={20} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <RNText style={[styles.opcionTitle, { color: colors.textPrimary }]}>Crear un hogar</RNText>
                    <RNText style={[styles.opcionSubtitle, { color: colors.textSecondary }]}>Empezá desde cero</RNText>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={18} color={colors.textSecondary} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.opcion, { backgroundColor: colors.card, borderColor: colors.borderSubtle }]}
                  onPress={() => setPaso('unirse-hogar')}
                  activeOpacity={0.8}
                >
                  <View style={[styles.opcionIcon, { backgroundColor: 'rgba(90,122,72,0.08)' }]}>
                    <MaterialCommunityIcons name="link-variant" size={20} color={colors.sage} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <RNText style={[styles.opcionTitle, { color: colors.textPrimary }]}>Unirse a un hogar</RNText>
                    <RNText style={[styles.opcionSubtitle, { color: colors.textSecondary }]}>Con el código de tu compañero/a</RNText>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </>

          ) : paso === 'crear-hogar' ? (
            <>
              <TouchableOpacity onPress={() => setPaso('inicio')} style={styles.back}>
                <MaterialCommunityIcons name="arrow-left" size={18} color={colors.primary} />
                <RNText style={[styles.backText, { color: colors.primary }]}>Volver</RNText>
              </TouchableOpacity>

              <View style={styles.logoArea}>
                <CasaSVG />
                <RNText style={[styles.pageTitle, { color: colors.textPrimary }]}>
                  ¿Cómo se llama tu hogar?
                </RNText>
                <RNText style={[styles.pageSubtitle, { color: colors.textSecondary }]}>
                  Lo van a ver los dos
                </RNText>
              </View>

              <View style={styles.form}>
                <TextInput
                  style={[styles.input, {
                    backgroundColor: hogarFocused ? 'rgba(255,255,255,0.85)' : colors.card,
                    borderColor: hogarFocused ? colors.primary : colors.borderSubtle,
                    color: colors.textPrimary,
                  }]}
                  placeholder="Ej: Nuestro Nido, Casa Rosada..."
                  placeholderTextColor={colors.textSecondary}
                  value={nombreHogar}
                  onChangeText={setNombreHogar}
                  autoFocus
                  returnKeyType="done"
                  onSubmitEditing={crearHogar}
                  onFocus={() => setHogarFocused(true)}
                  onBlur={() => setHogarFocused(false)}
                />
                {error ? <RNText style={[styles.errorText, { color: colors.danger }]}>{error}</RNText> : null}
                <TouchableOpacity
                  style={[styles.primaryBtn, { backgroundColor: colors.primary, opacity: loading ? 0.6 : 1 }]}
                  onPress={crearHogar}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  <RNText style={styles.primaryBtnText}>
                    {loading ? 'Creando...' : 'Este es nuestro hogar'}
                  </RNText>
                </TouchableOpacity>
              </View>
            </>

          ) : (
            <>
              <TouchableOpacity onPress={() => setPaso('inicio')} style={styles.back}>
                <MaterialCommunityIcons name="arrow-left" size={18} color={colors.primary} />
                <RNText style={[styles.backText, { color: colors.primary }]}>Volver</RNText>
              </TouchableOpacity>

              <View style={styles.logoArea}>
                <View style={[styles.linkIcon, { backgroundColor: colors.sageLight }]}>
                  <MaterialCommunityIcons name="link-variant" size={28} color={colors.sage} />
                </View>
                <RNText style={[styles.pageTitle, { color: colors.textPrimary }]}>
                  Unirse a un hogar
                </RNText>
                <RNText style={[styles.pageSubtitle, { color: colors.textSecondary }]}>
                  Tu compañero/a puede compartirte el código desde su perfil
                </RNText>
              </View>

              <View style={styles.form}>
                <TextInput
                  style={[styles.inputCode, {
                    backgroundColor: codigoFocused ? 'rgba(255,255,255,0.85)' : colors.card,
                    borderColor: codigoFocused ? colors.primary : colors.borderSubtle,
                    color: colors.textPrimary,
                  }]}
                  placeholder="Pegá el código aquí"
                  placeholderTextColor={colors.textSecondary}
                  value={codigoHogar}
                  onChangeText={setCodigoHogar}
                  autoCorrect={false}
                  autoCapitalize="none"
                  returnKeyType="done"
                  onSubmitEditing={unirseHogar}
                  onFocus={() => setCodigoFocused(true)}
                  onBlur={() => setCodigoFocused(false)}
                />
                {error ? <RNText style={[styles.errorText, { color: colors.danger }]}>{error}</RNText> : null}
                <TouchableOpacity
                  style={[styles.primaryBtn, { backgroundColor: colors.sage, opacity: loading ? 0.6 : 1 }]}
                  onPress={unirseHogar}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  <RNText style={styles.primaryBtnText}>
                    {loading ? 'Uniéndome...' : 'Unirme'}
                  </RNText>
                </TouchableOpacity>
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, overflow: 'hidden' },
  circle1: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(107,45,62,0.1)',
    position: 'absolute',
    top: -60,
    right: -60,
  },
  circle2: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(90,122,72,0.08)',
    position: 'absolute',
    bottom: 80,
    left: -40,
  },
  content: { flex: 1, padding: 24, gap: 32, justifyContent: 'center' },
  logoArea: { alignItems: 'center', gap: 12 },
  pageTitle: { fontFamily: 'Manrope_800ExtraBold', fontSize: 17, letterSpacing: -0.3, textAlign: 'center' },
  pageSubtitle: { fontFamily: 'Manrope_500Medium', fontSize: 11, textAlign: 'center', lineHeight: 16 },
  opciones: { gap: 10 },
  opcion: { flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 14, padding: 16, borderWidth: 0.5 },
  opcionIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  opcionTitle: { fontFamily: 'Manrope_700Bold', fontSize: 13 },
  opcionSubtitle: { fontFamily: 'Manrope_500Medium', fontSize: 10, marginTop: 1 },
  form: { gap: 14 },
  input: { borderRadius: 12, borderWidth: 0.5, paddingHorizontal: 13, paddingVertical: 12, fontFamily: 'Manrope_600SemiBold', fontSize: 13 },
  inputCode: { borderRadius: 12, borderWidth: 0.5, paddingHorizontal: 13, paddingVertical: 14, fontFamily: 'Manrope_800ExtraBold', fontSize: 14, letterSpacing: 1, textAlign: 'center' },
  primaryBtn: { borderRadius: 13, paddingVertical: 14, alignItems: 'center' },
  primaryBtnText: { fontFamily: 'Manrope_700Bold', fontSize: 13, color: '#fff' },
  errorText: { fontFamily: 'Manrope_500Medium', fontSize: 10 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  backText: { fontFamily: 'Manrope_600SemiBold', fontSize: 11 },
  linkIcon: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
});
