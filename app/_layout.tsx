import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { useFonts } from 'expo-font';
import {
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth';
import { ThemeProvider, useColors, useTheme } from '@/context/ThemeContext';
import { SpaceProvider } from '@/context/SpaceContext';
import { registrarPushToken } from '@/services/notificaciones';

// Componente interno que consume el contexto de tema
function AppContent() {
  const { setSession, setLoading, cargarPerfil, perfil, loading } = useAuthStore();
  const colors = useColors();
  const { isDark } = useTheme();

  const [fontsLoaded] = useFonts({
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'TOKEN_REFRESHED') {
        setSession(session);
        return;
      }
      setSession(session);
      if (session) {
        cargarPerfil();
      } else {
        setLoading(false);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (perfil?.id) {
      registrarPushToken(perfil.id);
    }
  }, [perfil?.id]);

  if (loading || !fontsLoaded) {
    return (
      <GestureHandlerRootView style={styles.root}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <View style={[styles.splash, { backgroundColor: colors.background }]}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <SpaceProvider>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="modal/gasto" options={{ presentation: 'modal', headerShown: false }} />
          <Stack.Screen name="modal/factura" options={{ presentation: 'modal', headerShown: false }} />
          <Stack.Screen name="modal/objetivo" options={{ presentation: 'modal', headerShown: false }} />
          <Stack.Screen name="modal/ingreso" options={{ presentation: 'modal', headerShown: false }} />
          <Stack.Screen name="modal/scan" options={{ presentation: 'fullScreenModal', headerShown: false }} />
        </Stack>
      </SpaceProvider>
    </GestureHandlerRootView>
  );
}

// ThemeProvider va afuera para que AppContent pueda consumirlo
export default function RootLayout() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  splash: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
