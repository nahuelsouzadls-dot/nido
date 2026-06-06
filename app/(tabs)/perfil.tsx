import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Radii, Spacing } from '@/constants/theme';
import { useColors } from '@/hooks/useColors';
import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ObjetivoCard } from '@/components/ObjetivoCard';
import { useAuthStore } from '@/store/auth';
import { useObjetivos } from '@/hooks/useObjetivos';
import { supabase } from '@/lib/supabase';

export default function PerfilScreen() {
  const { perfil, companero, hogar, signOut, setPerfil } = useAuthStore();
  const { objetivos } = useObjetivos();
  const colors = useColors();

  const [editandoNombre, setEditandoNombre] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState(perfil?.nombre ?? '');

  const handleGuardarNombre = async () => {
    if (!perfil || !nuevoNombre.trim()) return;
    await supabase.from('perfiles').update({ nombre: nuevoNombre.trim() }).eq('id', perfil.id);
    setPerfil({ ...perfil, nombre: nuevoNombre.trim() });
    setEditandoNombre(false);
  };

  const handleCambiarFoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images' as const,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      const fileName = `avatar_${perfil!.id}.jpg`;

      const response = await fetch(uri);
      const blob = await response.blob();

      await supabase.storage.from('avatares').upload(fileName, blob, {
        upsert: true,
        contentType: 'image/jpeg',
      });

      const { data } = supabase.storage.from('avatares').getPublicUrl(fileName);
      await supabase.from('perfiles').update({ avatar_url: data.publicUrl }).eq('id', perfil!.id);
      setPerfil({ ...perfil!, avatar_url: data.publicUrl });
    }
  };

  const handleSignOut = async () => {
    if (Platform.OS === 'web') {
      if (!window.confirm('¿Cerrar sesión?')) return;
      await signOut();
    } else {
      const { Alert } = await import('react-native');
      Alert.alert('Cerrar sesión', '¿Estás seguro?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Salir', style: 'destructive', onPress: signOut },
      ]);
    }
  };

  const objetivosCompletados = objetivos.filter((o) => o.completado);

  if (!perfil) return null;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text variant="largeTitle" style={{ fontWeight: '800', paddingTop: 8 }}>
          Perfil
        </Text>

        {/* Mi perfil */}
        <Card style={styles.perfilCard}>
          <TouchableOpacity style={styles.avatarContainer} onPress={handleCambiarFoto}>
            <Avatar nombre={perfil.nombre} url={perfil.avatar_url} size={72} />
            <View style={[styles.editarFoto, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={{ fontSize: 14 }}>📷</Text>
            </View>
          </TouchableOpacity>

          {editandoNombre ? (
            <View style={styles.editNombre}>
              <Input
                value={nuevoNombre}
                onChangeText={setNuevoNombre}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleGuardarNombre}
              />
              <View style={styles.editBtns}>
                <Button
                  label="Cancelar"
                  variant="ghost"
                  size="sm"
                  onPress={() => setEditandoNombre(false)}
                />
                <Button label="Guardar" size="sm" onPress={handleGuardarNombre} />
              </View>
            </View>
          ) : (
            <TouchableOpacity onPress={() => setEditandoNombre(true)}>
              <Text variant="title2" style={{ fontWeight: '700', textAlign: 'center' }}>
                {perfil.nombre}
              </Text>
              <Text variant="caption" color={colors.primary} align="center">
                Editar nombre
              </Text>
            </TouchableOpacity>
          )}

          <Text variant="caption" color={colors.textTertiary} align="center">
            {perfil.id.slice(0, 8)}...
          </Text>
        </Card>

        {/* Compañero */}
        {companero ? (
          <Card style={styles.companeroCard}>
            <Text variant="footnote" color={colors.textSecondary}>
              Comparte el hogar con
            </Text>
            <View style={styles.companeroRow}>
              <Avatar nombre={companero.nombre} url={companero.avatar_url} size={44} color="#FF9F0A" />
              <Text variant="headline">{companero.nombre}</Text>
            </View>
          </Card>
        ) : null}

        {/* Hogar + código para invitar */}
        {hogar ? (
          <Card style={{ gap: 10 }}>
            <Text variant="footnote" color={colors.textSecondary}>
              Hogar
            </Text>
            <Text variant="headline">{hogar.nombre}</Text>
            <View style={[styles.codigoRow, { backgroundColor: colors.background }]}>
              <Text
                variant="caption"
                color={colors.textTertiary}
                style={{ flex: 1 }}
                numberOfLines={1}
                ellipsizeMode="middle"
              >
                {hogar.id}
              </Text>
              <TouchableOpacity
                onPress={() => Share.share({ message: hogar.id, title: 'Código del hogar Nido' })}
                style={[styles.btnCompartir, { backgroundColor: colors.primaryLight }]}
                activeOpacity={0.7}
              >
                <Text variant="caption" color={colors.primary} style={{ fontWeight: '600' }}>
                  Compartir
                </Text>
              </TouchableOpacity>
            </View>
            <Text variant="caption" color={colors.textTertiary}>
              Tu pareja necesita este código para unirse al hogar
            </Text>
          </Card>
        ) : null}

        {/* Objetivos completados */}
        {objetivosCompletados.length > 0 ? (
          <View style={{ gap: 12 }}>
            <Text variant="title3">Objetivos completados</Text>
            {objetivosCompletados.map((o) => (
              <ObjetivoCard key={o.id} objetivo={o} />
            ))}
          </View>
        ) : null}

        {/* Cerrar sesión */}
        <Button
          label="Cerrar sesión"
          variant="ghost"
          onPress={handleSignOut}
          style={{ marginTop: 8 }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flex: 1 },
  content: { padding: Spacing.md, gap: Spacing.md, paddingBottom: 60 },
  perfilCard: { alignItems: 'center', gap: 12 },
  avatarContainer: { position: 'relative' },
  editarFoto: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderRadius: Radii.full,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  editNombre: { width: '100%', gap: 8 },
  editBtns: { flexDirection: 'row', gap: 8 },
  companeroCard: { gap: 8 },
  companeroRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  codigoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: Radii.sm,
    padding: 8,
  },
  btnCompartir: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radii.sm,
  },
});
