import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, View, ActivityIndicator, useColorScheme } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth';
import { registrarPushToken } from '@/services/notificaciones';
import { useColors } from '@/hooks/useColors';

export default function RootLayout() {
  const { setSession, setLoading, cargarPerfil, perfil, loading } = useAuthStore();
  const scheme = useColorScheme();
  const colors = useColors();

  useEffect(() => {
    // onAuthStateChange dispara INITIAL_SESSION al registrarse con la sesión almacenada.
    // Es la fuente de verdad recomendada en Supabase v2 — no necesitamos getSession().
    // TOKEN_REFRESHED: el SDK refresca el token automáticamente; solo actualizamos el
    // objeto de sesión sin recargar datos de perfil (no cambiaron).
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

  if (loading) {
    return (
      <GestureHandlerRootView style={styles.root}>
        <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
        <View style={[styles.splash, { backgroundColor: colors.background }]}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="modal/gasto"
          options={{
            presentation: 'modal',
            headerShown: true,
            title: 'Registrar gasto',
            headerStyle: { backgroundColor: colors.card },
            headerTintColor: colors.textPrimary,
          }}
        />
        <Stack.Screen
          name="modal/factura"
          options={{
            presentation: 'modal',
            headerShown: true,
            title: 'Nueva factura',
            headerStyle: { backgroundColor: colors.card },
            headerTintColor: colors.textPrimary,
          }}
        />
        <Stack.Screen
          name="modal/objetivo"
          options={{
            presentation: 'modal',
            headerShown: true,
            title: 'Nuevo objetivo',
            headerStyle: { backgroundColor: colors.card },
            headerTintColor: colors.textPrimary,
          }}
        />
        <Stack.Screen
          name="modal/scan"
          options={{ presentation: 'fullScreenModal', headerShown: false }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
