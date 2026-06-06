import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text as RNText } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// El escaneo de recibos con cámara no está disponible en web.
// En la app móvil, esta pantalla usa expo-camera + OCR.
export default function ScanScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.iconBox}>
        <MaterialCommunityIcons name="camera-outline" size={32} color="rgba(255,255,255,0.7)" />
      </View>
      <RNText style={styles.titulo}>No disponible en web</RNText>
      <RNText style={styles.descripcion}>
        El escaneo de recibos está disponible en la app móvil
      </RNText>
      <TouchableOpacity style={styles.btn} onPress={() => router.back()}>
        <RNText style={styles.btnTexto}>Volver</RNText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E0A10',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 16,
  },
  iconBox: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  titulo: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 15,
    color: '#F5F0F2',
    textAlign: 'center',
  },
  descripcion: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 11,
    color: 'rgba(245,240,242,0.6)',
    textAlign: 'center',
    lineHeight: 16,
  },
  btn: {
    marginTop: 16,
    backgroundColor: '#6B2D3E',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 13,
  },
  btnTexto: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 13,
    color: '#fff',
  },
});
