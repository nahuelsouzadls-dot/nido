import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ScrollView,
  Text as RNText,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
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
  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);
  const [nombreFocused, setNombreFocused] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      if (esRegistro) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { nombre: nombre.trim() } },
        });
        if (signUpError) throw signUpError;
        if (data.user && !data.session) {
          setConfirmacionPendiente(true);
          setLoading(false);
          return;
        }
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
          <View style={[styles.confirmIcon, { backgroundColor: 'rgba(107,45,62,0.08)' }]}>
            <MaterialCommunityIcons name="email-outline" size={28} color={colors.primary} />
          </View>
          <RNText style={[styles.confirmTitle, { color: colors.textPrimary }]}>
            Revisá tu email
          </RNText>
          <RNText style={[styles.confirmSubtitle, { color: colors.textSecondary }]} >
            Te enviamos un link de confirmación a{'\n'}
            <RNText style={[styles.confirmEmail, { color: colors.textPrimary }]}>{email}</RNText>
          </RNText>
          <RNText style={[styles.confirmHint, { color: colors.textSecondary }]}>
            Una vez confirmado, podés ingresar desde esta pantalla.
          </RNText>
          <TouchableOpacity onPress={() => { setConfirmacionPendiente(false); setEsRegistro(false); }}>
            <RNText style={[styles.link, { color: colors.primary }]}>
              Volver al inicio de sesión
            </RNText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      {/* Decorative circles */}
      <View style={styles.circle1} />
      <View style={styles.circle2} />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {/* Top bar */}
          <View style={styles.topBar}>
            <View style={[styles.isotipoBox, { backgroundColor: colors.primary }]}>
              <RNText style={styles.isotipoText}>N</RNText>
            </View>
            <RNText style={[styles.brand, { color: colors.textPrimary }]}>nido</RNText>
          </View>

          {/* Title */}
          <View style={styles.titleArea}>
            <RNText style={[styles.pageTitle, { color: colors.textPrimary }]}>
              {esRegistro ? '¿Cómo te llamás?' : 'Hola, bienvenido/a'}
            </RNText>
            <RNText style={[styles.pageSubtitle, { color: colors.textSecondary }]}>
              {esRegistro
                ? 'Así te verá tu compañero/a en el hogar'
                : 'Ingresá para ver cómo va tu hogar'}
            </RNText>
          </View>

          {/* Fields card */}
          <View style={[styles.fieldsCard, { backgroundColor: colors.card, borderColor: colors.borderSubtle }]}>
            {esRegistro && (
              <>
                <TextInput
                  style={[styles.input, {
                    backgroundColor: nombreFocused ? 'rgba(255,255,255,0.85)' : colors.card,
                    borderColor: nombreFocused ? colors.primary : colors.borderSubtle,
                    color: colors.textPrimary,
                  }]}
                  placeholder="Tu nombre"
                  placeholderTextColor={colors.textSecondary}
                  value={nombre}
                  onChangeText={setNombre}
                  autoCapitalize="words"
                  returnKeyType="next"
                  onFocus={() => setNombreFocused(true)}
                  onBlur={() => setNombreFocused(false)}
                  autoFocus
                />
                <View style={[styles.fieldSep, { backgroundColor: colors.borderSubtle }]} />
              </>
            )}
            <TextInput
              style={[styles.input, {
                backgroundColor: emailFocused ? 'rgba(255,255,255,0.85)' : colors.card,
                borderColor: emailFocused ? colors.primary : colors.borderSubtle,
                color: colors.textPrimary,
              }]}
              placeholder="Email"
              placeholderTextColor={colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
            />
            <View style={[styles.fieldSep, { backgroundColor: colors.borderSubtle }]} />
            <View>
              <TextInput
                style={[styles.input, {
                  backgroundColor: passFocused ? 'rgba(255,255,255,0.85)' : colors.card,
                  borderColor: passFocused ? colors.primary : colors.borderSubtle,
                  color: colors.textPrimary,
                }]}
                placeholder="Contraseña"
                placeholderTextColor={colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
                onFocus={() => setPassFocused(true)}
                onBlur={() => setPassFocused(false)}
              />
              {!esRegistro && (
                <TouchableOpacity style={styles.forgotRow}>
                  <RNText style={[styles.forgotText, { color: colors.primary }]}>
                    Olvidé mi contraseña
                  </RNText>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {error ? (
            <RNText style={[styles.errorText, { color: colors.danger }]}>{error}</RNText>
          ) : null}

          {/* Primary button */}
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: colors.primary, opacity: loading ? 0.6 : 1 }]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            <RNText style={styles.primaryBtnText}>
              {loading ? 'Cargando...' : esRegistro ? 'Continuar' : 'Entrar al hogar'}
            </RNText>
          </TouchableOpacity>

          {/* Toggle */}
          <TouchableOpacity onPress={() => { setEsRegistro(!esRegistro); setError(''); }}>
            <RNText style={[styles.toggleText, { color: colors.primary }]} >
              {esRegistro ? '¿Ya tenés cuenta? Ingresá' : '¿Primera vez? Creá una cuenta'}
            </RNText>
          </TouchableOpacity>
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
  content: { flex: 1, padding: 24, gap: 24, justifyContent: 'center' },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  isotipoBox: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  isotipoText: { fontFamily: 'Manrope_800ExtraBold', fontSize: 14, color: '#F5F0F2' },
  brand: { fontFamily: 'Manrope_700Bold', fontSize: 15 },
  titleArea: { gap: 6 },
  pageTitle: { fontFamily: 'Manrope_800ExtraBold', fontSize: 20, letterSpacing: -0.4 },
  pageSubtitle: { fontFamily: 'Manrope_500Medium', fontSize: 11 },
  fieldsCard: {
    borderRadius: 14,
    borderWidth: 0.5,
    overflow: 'hidden',
    gap: 0,
  },
  input: {
    borderRadius: 12,
    borderWidth: 0.5,
    paddingHorizontal: 13,
    paddingVertical: 12,
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 12,
    margin: 8,
  },
  fieldSep: { height: 0.5, marginHorizontal: 8 },
  forgotRow: { paddingHorizontal: 16, paddingBottom: 8, alignItems: 'flex-end' },
  forgotText: { fontFamily: 'Manrope_600SemiBold', fontSize: 10 },
  errorText: { fontFamily: 'Manrope_500Medium', fontSize: 10, textAlign: 'center' },
  primaryBtn: { borderRadius: 13, paddingVertical: 14, alignItems: 'center' },
  primaryBtnText: { fontFamily: 'Manrope_700Bold', fontSize: 13, color: '#fff' },
  toggleText: { fontFamily: 'Manrope_600SemiBold', fontSize: 11, textAlign: 'center' },
  confirmacion: { flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center', gap: 16 },
  confirmIcon: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  confirmTitle: { fontFamily: 'Manrope_800ExtraBold', fontSize: 17, textAlign: 'center' },
  confirmSubtitle: { fontFamily: 'Manrope_500Medium', fontSize: 12, textAlign: 'center', lineHeight: 18 },
  confirmEmail: { fontFamily: 'Manrope_700Bold', fontSize: 12 },
  confirmHint: { fontFamily: 'Manrope_500Medium', fontSize: 10, textAlign: 'center' },
  link: { fontFamily: 'Manrope_600SemiBold', fontSize: 12 },
});
