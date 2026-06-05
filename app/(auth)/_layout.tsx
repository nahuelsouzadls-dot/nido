import { Stack, Redirect, usePathname } from 'expo-router';
import { useAuthStore } from '@/store/auth';

export default function AuthLayout() {
  const { session, hogar } = useAuthStore();
  const pathname = usePathname();

  if (session && hogar) {
    return <Redirect href="/(tabs)" />;
  }

  // Si tiene sesión pero aún no tiene hogar y no está ya en onboarding,
  // redirigir a onboarding. Sin este check, el usuario queda en la
  // pantalla de login aunque esté autenticado (p.ej. después de confirmar email).
  if (session && !hogar && pathname !== '/onboarding') {
    return <Redirect href="/(auth)/onboarding" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
