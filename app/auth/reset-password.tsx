import { useEffect, useState } from 'react';
import {
  View, StyleSheet, TouchableOpacity, Text as RNText, TextInput,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { supabase } from '@/lib/supabase';

export default function ResetPasswordScreen() {
  const colors = useColors();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState(false);
  const [passFocused, setPassFocused] = useState(false);
  const [confirmFocused, setConfirmFocused] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace('/(auth)/login');
      } else {
        setSessionReady(true);
      }
    });
  }, []);

  const handleSubmit = async () => {
    setError('');
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden');
      return;
    }
    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (updateError) {
      setError('No se pudo actualizar la contraseña. El link puede haber expirado.');
      return;
    }
    setExito(true);
  };

  if (!sessionReady) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (exito) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
        <View style={styles.exitoContainer}>
          <View style={[styles.exitoIcon, { backgroundColor: colors.sageLight }]}>
            <MaterialCommunityIcons name="check" size={32} color={colors.sage} />
          </View>
          <RNText style={[styles.exitoTitle, { color: colors.textPrimary }]}>
            Contraseña actualizada
          </RNText>
          <RNText style={[styles.exitoSubtitle, { color: colors.textSecondary }]}>
            Podés ingresar con tu nueva contraseña
          </RNText>
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.replace('/(tabs)')}
            activeOpacity={0.8}
          >
            <RNText style={styles.primaryBtnText}>Ir al inicio</RNText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={styles.circle1} />
      <View style={styles.circle2} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.topBar}>
            <View style={[styles.isotipoBox, { backgroundColor: colors.primary }]}>
              <RNText style={styles.isotipoText}>N</RNText>
            </View>
            <RNText style={[styles.brand, { color: colors.textPrimary }]}>nido</RNText>
          </View>

          <View style={styles.titleArea}>
            <RNText style={[styles.pageTitle, { color: colors.textPrimary }]}>
              Nueva contraseña
            </RNText>
            <RNText style={[styles.pageSubtitle, { color: colors.textSecondary }]}>
              Elegí una contraseña de al menos 6 caracteres
            </RNText>
          </View>

          <View style={[styles.fieldsCard, { backgroundColor: colors.card, borderColor: colors.borderSubtle }]}>
            <TextInput
              style={[styles.input, {
                backgroundColor: passFocused ? 'rgba(255,255,255,0.85)' : colors.card,
                borderColor: passFocused ? colors.primary : colors.borderSubtle,
                color: colors.textPrimary,
              }]}
              placeholder="Nueva contraseña"
              placeholderTextColor={colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              returnKeyType="next"
              autoFocus
              onFocus={() => setPassFocused(true)}
              onBlur={() => setPassFocused(false)}
            />
            <View style={[styles.fieldSep, { backgroundColor: colors.borderSubtle }]} />
            <TextInput
              style={[styles.input, {
                backgroundColor: confirmFocused ? 'rgba(255,255,255,0.85)' : colors.card,
                borderColor: confirmFocused ? colors.primary : colors.borderSubtle,
                color: colors.textPrimary,
              }]}
              placeholder="Confirmá la contraseña"
              placeholderTextColor={colors.textSecondary}
              value={confirm}
              onChangeText={setConfirm}
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
              onFocus={() => setConfirmFocused(true)}
              onBlur={() => setConfirmFocused(false)}
            />
          </View>

          {error ? (
            <RNText style={[styles.errorText, { color: colors.danger }]}>{error}</RNText>
          ) : null}

          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: colors.primary, opacity: loading ? 0.6 : 1 }]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            <RNText style={styles.primaryBtnText}>
              {loading ? 'Guardando...' : 'Guardar contraseña'}
            </RNText>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, overflow: 'hidden' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  circle1: {
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(107,45,62,0.1)',
    position: 'absolute', top: -60, right: -60,
  },
  circle2: {
    width: 140, height: 140, borderRadius: 70,
    backgroundColor: 'rgba(90,122,72,0.08)',
    position: 'absolute', bottom: 80, left: -40,
  },
  content: { flex: 1, padding: 24, gap: 24, justifyContent: 'center' },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  isotipoBox: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  isotipoText: { fontFamily: 'Manrope_800ExtraBold', fontSize: 14, color: '#F5F0F2' },
  brand: { fontFamily: 'Manrope_700Bold', fontSize: 15 },
  titleArea: { gap: 6 },
  pageTitle: { fontFamily: 'Manrope_800ExtraBold', fontSize: 20, letterSpacing: -0.4 },
  pageSubtitle: { fontFamily: 'Manrope_500Medium', fontSize: 11 },
  fieldsCard: { borderRadius: 14, borderWidth: 0.5, overflow: 'hidden' },
  input: {
    borderRadius: 12, borderWidth: 0.5,
    paddingHorizontal: 13, paddingVertical: 12,
    fontFamily: 'Manrope_600SemiBold', fontSize: 12,
    margin: 8,
  },
  fieldSep: { height: 0.5, marginHorizontal: 8 },
  errorText: { fontFamily: 'Manrope_500Medium', fontSize: 10, textAlign: 'center' },
  primaryBtn: { borderRadius: 13, paddingVertical: 14, alignItems: 'center' },
  primaryBtnText: { fontFamily: 'Manrope_700Bold', fontSize: 13, color: '#fff' },
  exitoContainer: { flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center', gap: 16 },
  exitoIcon: { width: 72, height: 72, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  exitoTitle: { fontFamily: 'Manrope_800ExtraBold', fontSize: 18, textAlign: 'center' },
  exitoSubtitle: { fontFamily: 'Manrope_500Medium', fontSize: 12, textAlign: 'center', lineHeight: 18 },
});
