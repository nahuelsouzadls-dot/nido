import { useEffect, useState } from 'react';
import { View, StyleSheet, Text as RNText, TouchableOpacity, Platform } from 'react-native';
import { ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/auth';
import { useColors } from '@/hooks/useColors';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  const router = useRouter();
  const { session, loading } = useAuthStore();
  const colors = useColors();
  const [error, setError] = useState('');
  const [intentando, setIntentando] = useState(true);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      setIntentando(false);
      return;
    }

    const url = new URL(window.location.href);
    const errorParam = url.searchParams.get('error');
    const errorDesc = url.searchParams.get('error_description');
    const code = url.searchParams.get('code');

    if (errorParam) {
      setError(errorDesc ?? 'No se pudo verificar el email.');
      setIntentando(false);
      return;
    }

    if (!code) {
      // No hay code en la URL — puede venir por hash fragment (flujo implícito).
      // detectSessionInUrl:true ya lo maneja; esperamos a que onAuthStateChange dispare.
      setIntentando(false);
      return;
    }

    // Flujo PKCE: intercambiamos el código explícitamente como respaldo,
    // en caso de que detectSessionInUrl no lo haya procesado todavía.
    supabase.auth
      .exchangeCodeForSession(code)
      .then(({ error: exchangeError }) => {
        if (exchangeError) {
          // Verificamos si ya hay una sesión activa (puede que detectSessionInUrl
          // lo haya procesado primero y el exchange falle por código ya usado).
          supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
              setError('El link de verificación expiró o ya fue utilizado.');
            }
            setIntentando(false);
          });
        } else {
          setIntentando(false);
        }
      })
      .catch(() => {
        setError('Ocurrió un error al verificar el email.');
        setIntentando(false);
      });
  }, []);

  useEffect(() => {
    if (loading || intentando || error) return;
    if (session) {
      router.replace('/(tabs)');
    } else {
      router.replace('/(auth)/login');
    }
  }, [session, loading, intentando, error]);

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.errorCard, { backgroundColor: colors.card, borderColor: colors.borderSubtle }]}>
          <RNText style={[styles.errorTitle, { color: colors.textPrimary }]}>
            Link inválido
          </RNText>
          <RNText style={[styles.errorText, { color: colors.textSecondary }]}>
            {error}
          </RNText>
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: colors.primary }]}
            onPress={() => router.replace('/(auth)/login')}
            activeOpacity={0.8}
          >
            <RNText style={styles.btnText}>Ir al inicio de sesión</RNText>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ActivityIndicator color={colors.primary} size="large" />
      <RNText style={[styles.label, { color: colors.textSecondary }]}>
        Verificando...
      </RNText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, padding: 24 },
  label: { fontFamily: 'Manrope_500Medium', fontSize: 11 },
  errorCard: {
    borderRadius: 14,
    borderWidth: 0.5,
    padding: 20,
    gap: 12,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  errorTitle: { fontFamily: 'Manrope_800ExtraBold', fontSize: 15, letterSpacing: -0.3 },
  errorText: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
  },
  btn: { borderRadius: 13, paddingVertical: 12, paddingHorizontal: 24, marginTop: 4 },
  btnText: { fontFamily: 'Manrope_700Bold', fontSize: 12, color: '#fff' },
});
