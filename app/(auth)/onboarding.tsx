import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Spacing, Radii } from '@/constants/theme';
import { useColors } from '@/hooks/useColors';
import { Text } from '@/components/ui/Text';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/auth';
import { supabase } from '@/lib/supabase';
import { CATEGORIAS_DEFAULT } from '@/constants/categories';

type Paso = 'inicio' | 'crear-hogar' | 'unirse-hogar';

export default function OnboardingScreen() {
  const { session, cargarPerfil, perfil } = useAuthStore();
  const colors = useColors();
  const [paso, setPaso] = useState<Paso>('inicio');
  const [nombreHogar, setNombreHogar] = useState('');
  const [codigoHogar, setCodigoHogar] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Nombre resuelto: usa el perfil ya cargado, o el metadata del signup, o el email
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
        .from('hogares')
        .insert({ nombre: nombreHogar.trim() })
        .select()
        .single();

      if (hogarError) throw hogarError;

      // upsert como red de seguridad: si el trigger falló y no existe la fila,
      // la crea ahora; si ya existe, actualiza solo hogar_id.
      const { error: perfilError } = await supabase
        .from('perfiles')
        .upsert({ id: session.user.id, nombre: resolverNombre(), hogar_id: hogar.id });

      if (perfilError) throw perfilError;

      await supabase.from('categorias').insert(
        CATEGORIAS_DEFAULT.map((c) => ({
          hogar_id: hogar.id,
          nombre: c.nombre,
          icono: c.icono,
          color: c.color,
          es_sistema: true,
        })),
      );

      await cargarPerfil();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error creando el hogar');
    } finally {
      setLoading(false);
    }
  };

  const unirseHogar = async () => {
    if (!codigoHogar.trim() || !session?.user) return;
    setLoading(true);
    setError('');

    try {
      const { data: hogar, error: hogarError } = await supabase
        .from('hogares')
        .select('id, nombre')
        .eq('id', codigoHogar.trim())
        .single();

      if (hogarError || !hogar) {
        setError('No encontramos ese hogar. Verificá el código.');
        return;
      }

      const { count } = await supabase
        .from('perfiles')
        .select('id', { count: 'exact', head: true })
        .eq('hogar_id', hogar.id);

      if ((count ?? 0) >= 2) {
        setError('Este hogar ya tiene 2 integrantes.');
        return;
      }

      const { error: perfilError } = await supabase
        .from('perfiles')
        .upsert({ id: session.user.id, nombre: resolverNombre(), hogar_id: hogar.id });

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
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {paso === 'inicio' ? (
            <>
              <View style={styles.logoArea}>
                <Text style={styles.logo}>🏡</Text>
                <Text variant="title1" style={{ fontWeight: '800' }} align="center">
                  Tu hogar te espera
                </Text>
                <Text variant="subhead" color={colors.textSecondary} align="center">
                  Creá un nuevo hogar o unite al de tu pareja
                </Text>
              </View>

              <View style={styles.opciones}>
                <TouchableOpacity
                  style={[styles.opcion, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => setPaso('crear-hogar')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.opcionEmoji}>✨</Text>
                  <View>
                    <Text variant="headline">Crear un hogar</Text>
                    <Text variant="caption" color={colors.textSecondary}>
                      Empezá desde cero
                    </Text>
                  </View>
                  <Text color={colors.textTertiary} style={{ marginLeft: 'auto' }}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.opcion, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => setPaso('unirse-hogar')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.opcionEmoji}>🔗</Text>
                  <View>
                    <Text variant="headline">Unirse a un hogar</Text>
                    <Text variant="caption" color={colors.textSecondary}>
                      Con el código de tu pareja
                    </Text>
                  </View>
                  <Text color={colors.textTertiary} style={{ marginLeft: 'auto' }}>›</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : paso === 'crear-hogar' ? (
            <>
              <TouchableOpacity onPress={() => setPaso('inicio')} style={styles.back}>
                <Text color={colors.primary}>← Volver</Text>
              </TouchableOpacity>

              <View style={styles.logoArea}>
                <Text style={styles.logo}>✨</Text>
                <Text variant="title2" style={{ fontWeight: '700' }} align="center">
                  Nombre del hogar
                </Text>
                <Text variant="subhead" color={colors.textSecondary} align="center">
                  ¿Cómo se llama su hogar compartido?
                </Text>
              </View>

              <View style={styles.form}>
                <Input
                  label="Nombre del hogar"
                  value={nombreHogar}
                  onChangeText={setNombreHogar}
                  placeholder="Ej: Nuestro Nido, Casa Rosada, El Depto..."
                  autoFocus
                  returnKeyType="done"
                  onSubmitEditing={crearHogar}
                />

                {error ? <Text variant="caption" color={colors.danger}>{error}</Text> : null}

                <Button
                  label="Crear hogar"
                  onPress={crearHogar}
                  loading={loading}
                  size="lg"
                  icon="🏡"
                />
              </View>
            </>
          ) : (
            <>
              <TouchableOpacity onPress={() => setPaso('inicio')} style={styles.back}>
                <Text color={colors.primary}>← Volver</Text>
              </TouchableOpacity>

              <View style={styles.logoArea}>
                <Text style={styles.logo}>🔗</Text>
                <Text variant="title2" style={{ fontWeight: '700' }} align="center">
                  Código del hogar
                </Text>
                <Text variant="subhead" color={colors.textSecondary} align="center">
                  Tu pareja puede compartirte el código desde su perfil
                </Text>
              </View>

              <View style={styles.form}>
                <Input
                  label="Código del hogar"
                  value={codigoHogar}
                  onChangeText={setCodigoHogar}
                  placeholder="Pegá el código aquí"
                  autoCorrect={false}
                  autoCapitalize="none"
                  returnKeyType="done"
                  onSubmitEditing={unirseHogar}
                />

                {error ? <Text variant="caption" color={colors.danger}>{error}</Text> : null}

                <Button
                  label="Unirse al hogar"
                  onPress={unirseHogar}
                  loading={loading}
                  size="lg"
                  icon="🔗"
                />
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { flex: 1, padding: Spacing.lg, gap: Spacing.xl, justifyContent: 'center' },
  logoArea: { alignItems: 'center', gap: 8 },
  logo: { fontSize: 56, marginBottom: 8 },
  opciones: { gap: 12 },
  opcion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: Radii.lg,
    padding: 20,
    borderWidth: 1,
  },
  opcionEmoji: { fontSize: 28 },
  form: { gap: 16 },
  back: { paddingBottom: 8 },
});
