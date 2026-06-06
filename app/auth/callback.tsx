import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Text as RNText } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/auth';
import { useColors } from '@/hooks/useColors';

// Supabase email-confirmation links redirect here (e.g. /auth/callback?code=…).
// supabase.ts has detectSessionInUrl:true, so the SDK automatically exchanges
// the code / reads the token fragment before onAuthStateChange fires.
// _layout.tsx listens to onAuthStateChange and sets session + calls cargarPerfil().
// This screen waits for loading:false then routes to the right place.
export default function AuthCallback() {
  const router = useRouter();
  const { session, loading } = useAuthStore();
  const colors = useColors();

  useEffect(() => {
    if (loading) return;
    if (session) {
      router.replace('/(tabs)');
    } else {
      router.replace('/(auth)/login');
    }
  }, [session, loading]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ActivityIndicator color={colors.primary} size="large" />
      <RNText style={[styles.label, { color: colors.textSecondary }]}>
        Verificando…
      </RNText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 },
  label: { fontFamily: 'Manrope_500Medium', fontSize: 11 },
});
