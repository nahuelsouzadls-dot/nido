import { useEffect } from 'react';
import { View, ActivityIndicator, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useColors } from '@/hooks/useColors';

// Supabase envía los emails de recovery a esta ruta porque el template
// tiene "/konfigurator/0" hardcodeado. Este componente lee el hash fragment
// (#access_token=...&type=recovery) y redirige al destino correcto.
export default function KonfiguratorRedirect() {
  const router = useRouter();
  const colors = useColors();

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') {
      router.replace('/(auth)/login');
      return;
    }

    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const type = hashParams.get('type');

    if (type === 'recovery') {
      // detectSessionInUrl ya procesó el token; _layout.tsx también
      // dispara PASSWORD_RECOVERY y navega a reset-password.
      // Esta redirección es el fallback explícito.
      router.replace('/auth/reset-password');
    } else {
      // Email confirmation u otro tipo de token
      router.replace('/auth/callback');
    }
  }, []);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
      <ActivityIndicator color={colors.primary} size="large" />
    </View>
  );
}
