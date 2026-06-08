import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Share,
  Text as RNText,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { Avatar } from '@/components/ui/Avatar';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/auth';
import { supabase } from '@/lib/supabase';
import { formatMes } from '@/utils/format';

export default function PerfilScreen() {
  const { perfil, companero, hogar, signOut, setPerfil } = useAuthStore();
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
      await supabase.storage.from('avatares').upload(fileName, blob, { upsert: true, contentType: 'image/jpeg' });
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

  if (!perfil) return null;

  const hogarDesde = hogar?.created_at
    ? formatMes(
        new Date(hogar.created_at).getMonth() + 1,
        new Date(hogar.created_at).getFullYear(),
      )
    : '';

  const CONFIG_ROWS = [
    { icon: 'bell-outline', label: 'Notificaciones' },
    { icon: 'tune-variant', label: 'Preferencias' },
    { icon: 'help-circle-outline', label: 'Ayuda' },
  ] as const;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <RNText style={[styles.title, { color: colors.textPrimary }]}>Perfil</RNText>

        {/* Perfil row */}
        <View style={[styles.perfilCard, { backgroundColor: colors.card, borderColor: colors.borderSubtle }]}>
          <TouchableOpacity onPress={handleCambiarFoto} activeOpacity={0.85}>
            <Avatar nombre={perfil.nombre} url={perfil.avatar_url} size={40} color={colors.primaryLight} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            {editandoNombre ? (
              <View style={styles.editRow}>
                <Input
                  value={nuevoNombre}
                  onChangeText={setNuevoNombre}
                  autoFocus
                  returnKeyType="done"
                  onSubmitEditing={handleGuardarNombre}
                  style={{ flex: 1 }}
                />
                <Button label="OK" size="sm" onPress={handleGuardarNombre} />
              </View>
            ) : (
              <>
                <RNText style={[styles.perfilNombre, { color: colors.textPrimary }]}>{perfil.nombre}</RNText>
                <RNText style={[styles.perfilEmail, { color: colors.textSecondary }]} numberOfLines={1}>
                  {perfil.id.slice(0, 12)}...
                </RNText>
              </>
            )}
          </View>
          {!editandoNombre && (
            <TouchableOpacity onPress={() => setEditandoNombre(true)} activeOpacity={0.7}>
              <RNText style={[styles.editarLink, { color: colors.primary }]}>Editar</RNText>
            </TouchableOpacity>
          )}
        </View>

        {/* HogarCard */}
        {hogar && (
          <View style={[styles.hogarCard, { backgroundColor: 'rgba(107,45,62,0.07)', borderColor: 'rgba(107,45,62,0.18)' }]}>
            <RNText style={[styles.hogarLabel, { color: colors.textSecondary }]}>TU HOGAR</RNText>
            <RNText style={[styles.hogarNombre, { color: colors.textPrimary }]}>{hogar.nombre}</RNText>
            {hogarDesde ? (
              <RNText style={[styles.hogarDesde, { color: colors.textSecondary }]}>
                Desde {hogarDesde}
              </RNText>
            ) : null}

            {/* Avatares */}
            <View style={styles.hogarAvatares}>
              <Avatar nombre={perfil.nombre} url={perfil.avatar_url} size={28} color={colors.primaryLight} />
              {companero ? (
                <View style={styles.hogarAvatarOverlap}>
                  <Avatar nombre={companero.nombre} url={companero.avatar_url} size={28} color={colors.primaryLight} />
                </View>
              ) : (
                <View style={[styles.hogarAvatarOverlap, styles.slotVacio]}>
                  <MaterialCommunityIcons name="plus" size={13} color={colors.textSecondary} />
                </View>
              )}
            </View>

            {companero ? (
              <RNText style={[styles.hogarMiembros, { color: colors.textSecondary }]}>
                {perfil.nombre.split(' ')[0]} · {companero.nombre.split(' ')[0]}
              </RNText>
            ) : (
              <>
                <RNText style={[styles.hogarMiembros, { color: colors.textSecondary }]}>
                  Solo vos por ahora
                </RNText>
                <TouchableOpacity
                  onPress={() => Share.share({ message: hogar.id, title: 'Código del hogar Nido' })}
                  activeOpacity={0.7}
                >
                  <RNText style={[styles.invitarLink, { color: colors.primary }]}>Invitar a alguien →</RNText>
                </TouchableOpacity>
              </>
            )}

            {/* Compartir código */}
            <View style={styles.compartirRow}>
              <RNText style={[styles.codigoText, { color: colors.textSecondary }]} numberOfLines={1} ellipsizeMode="middle">
                {hogar.id}
              </RNText>
              <TouchableOpacity
                style={[styles.compartirBtn, { backgroundColor: colors.primaryLight }]}
                onPress={() => Share.share({ message: hogar.id, title: 'Código del hogar Nido' })}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="share-variant" size={13} color={colors.primary} />
                <RNText style={[styles.compartirText, { color: colors.primary }]}>Compartir</RNText>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ConfigCard */}
        <View style={[styles.configCard, { backgroundColor: colors.card, borderColor: colors.borderSubtle }]}>
          {CONFIG_ROWS.map((row, i) => (
            <TouchableOpacity
              key={row.label}
              style={[
                styles.configRow,
                i > 0 && { borderTopWidth: 0.5, borderTopColor: colors.borderSubtle },
              ]}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name={row.icon} size={18} color={colors.textSecondary} />
              <RNText style={[styles.configLabel, { color: colors.textPrimary }]}>{row.label}</RNText>
              <MaterialCommunityIcons name="chevron-right" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign out */}
        <TouchableOpacity
          style={[styles.signOutBtn, { backgroundColor: 'rgba(30,10,16,0.07)' }]}
          onPress={handleSignOut}
          activeOpacity={0.8}
        >
          <RNText style={[styles.signOutText, { color: colors.textSecondary }]}>Cerrar sesión</RNText>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flex: 1 },
  content: { padding: 16, gap: 14, paddingBottom: 60 },
  title: { fontFamily: 'Manrope_800ExtraBold', fontSize: 17, letterSpacing: -0.3, paddingTop: 8 },

  // Perfil card (row)
  perfilCard: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 14, borderWidth: 0.5, padding: 14 },
  perfilNombre: { fontFamily: 'Manrope_700Bold', fontSize: 13 },
  perfilEmail: { fontFamily: 'Manrope_500Medium', fontSize: 9, marginTop: 2 },
  editarLink: { fontFamily: 'Manrope_600SemiBold', fontSize: 10 },
  editRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },

  // Hogar card
  hogarCard: { borderRadius: 14, borderWidth: 0.5, padding: 14, gap: 8 },
  hogarLabel: { fontFamily: 'Manrope_700Bold', fontSize: 8, letterSpacing: 0.8 },
  hogarNombre: { fontFamily: 'Manrope_800ExtraBold', fontSize: 17, letterSpacing: -0.3 },
  hogarDesde: { fontFamily: 'Manrope_500Medium', fontSize: 9 },
  hogarAvatares: { flexDirection: 'row', marginTop: 4 },
  hogarAvatarOverlap: { marginLeft: -6 },
  slotVacio: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(107,45,62,0.3)',
    backgroundColor: 'rgba(107,45,62,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hogarMiembros: { fontFamily: 'Manrope_500Medium', fontSize: 10 },
  invitarLink: { fontFamily: 'Manrope_700Bold', fontSize: 10 },
  compartirRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  codigoText: { fontFamily: 'Manrope_500Medium', fontSize: 9, flex: 1 },
  compartirBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  compartirText: { fontFamily: 'Manrope_700Bold', fontSize: 10 },

  // Config card
  configCard: { borderRadius: 14, borderWidth: 0.5, overflow: 'hidden' },
  configRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  configLabel: { fontFamily: 'Manrope_600SemiBold', fontSize: 11, flex: 1 },

  // Sign out
  signOutBtn: { borderRadius: 13, paddingVertical: 12, alignItems: 'center' },
  signOutText: { fontFamily: 'Manrope_700Bold', fontSize: 12 },
});
