import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Spacing } from '@/constants/theme';
import { useColors } from '@/hooks/useColors';
import { Text } from '@/components/ui/Text';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';

export default function LoginScreen() {
  const colors = useColors();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [esRegistro, setEsRegistro] = useState(false);
  const [nombre, setNombre] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmacionPendiente, setConfirmacionPendiente] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    try {
      if (esRegistro) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            // El trigger handle_new_user() lee este campo para crear el perfil
            // incluso cuando se requiere confirmación de email
            data: { nombre: nombre.trim() },
          },
        });

        if (signUpError) throw signUpError;

        if (data.user && !data.session) {
          // Supabase requiere confirmación de email.
          // El trigger ya creó la fila en perfiles; no se necesita insert aquí.
          setConfirmacionPendiente(true);
          setLoading(false);
          return;
        }
        // Si no requiere confirmación, onAuthStateChange dispara SIGNED_IN
        // y cargarPerfil() carga el perfil creado por el trigger.
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (signInError) throw signInError;
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error desconocido';
      if (msg.includes('Invalid login credentials')) {
        setError('Email o contraseña incorrectos');
      } else if (msg.includes('User already registered')) {
        setError('Ya existe una cuenta con este email');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  if (confirmacionPendiente) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
        <View style={styles.confirmacion}>
          <Text style={styles.logo}>📬</Text>
          <Text variant="title2" style={{ fontWeight: '700' }} align="center">
            Revisá tu email
          </Text>
          <Text variant="subhead" color={colors.textSecondary} align="center">
            Te enviamos un link de confirmación a{'\n'}
            <Text variant="subhead" style={{ fontWeight: '600' }}>{email}</Text>
          </Text>
          <Text variant="caption" color={colors.textTertiary} align="center">
            Una vez confirmado, podés ingresar desde esta pantalla.
          </Text>
          <TouchableOpacity onPress={() => { setConfirmacionPendiente(false); setEsRegistro(false); }}>
            <Text variant="subhead" color={colors.primary} align="center">
              Volver al inicio de sesión
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.logoArea}>
            <Text style={styles.logo}>🏡</Text>
            <Text variant="largeTitle" style={{ fontWeight: '800' }} align="center">
              Nido
            </Text>
            <Text variant="subhead" color={colors.textSecondary} align="center">
              El hogar en tus manos
            </Text>
          </View>

          <View style={styles.form}>
            {esRegistro ? (
              <Input
                label="Tu nombre"
                value={nombre}
                onChangeText={setNombre}
                placeholder="Ej: Matilde"
                autoCapitalize="words"
                returnKeyType="next"
              />
            ) : null}

            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="tu@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />

            <Input
              label="Contraseña"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
            />

            {error ? (
              <Text variant="footnote" color={colors.danger}>
                {error}
              </Text>
            ) : null}

            <Button
              label={esRegistro ? 'Crear cuenta' : 'Ingresar'}
              onPress={handleSubmit}
              loading={loading}
              size="lg"
              style={{ marginTop: 8 }}
            />
          </View>

          <TouchableOpacity onPress={() => { setEsRegistro(!esRegistro); setError(''); }}>
            <Text variant="subhead" color={colors.primary} align="center">
              {esRegistro ? '¿Ya tenés cuenta? Ingresá' : '¿Primera vez? Creá una cuenta'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
    justifyContent: 'center',
    gap: Spacing.xl,
  },
  logoArea: {
    alignItems: 'center',
    gap: 8,
  },
  logo: {
    fontSize: 64,
    marginBottom: 8,
  },
  form: {
    gap: 16,
  },
  confirmacion: {
    flex: 1,
    padding: Spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
});
