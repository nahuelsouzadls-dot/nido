import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text as RNText } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors, useTheme, type ThemeMode } from '@/context/ThemeContext';

type ThemeOption = {
  id: ThemeMode;
  label: string;
  swatches: string[];
  icono: keyof typeof MaterialCommunityIcons.glyphMap;
};

const OPCIONES: ThemeOption[] = [
  {
    id: 'claro',
    label: 'Claro',
    swatches: ['#F5F0F2', '#6B2D3E', '#5A7A48'],
    icono: 'white-balance-sunny',
  },
  {
    id: 'nocturno',
    label: 'Nocturno',
    swatches: ['#12090D', '#C4889A', '#7AB860'],
    icono: 'weather-night',
  },
];

export function ThemePickerCard() {
  const colors = useColors();
  const { themeMode, setThemeMode } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: 'rgba(107,45,62,0.07)', borderColor: 'rgba(107,45,62,0.18)' }]}>
      <RNText style={[styles.label, { color: colors.textSecondary }]}>APARIENCIA</RNText>

      <View style={styles.row}>
        {OPCIONES.map((op) => {
          const seleccionado = themeMode === op.id;
          return (
            <TouchableOpacity
              key={op.id}
              style={[
                styles.option,
                {
                  backgroundColor: seleccionado ? colors.surface : 'rgba(255,255,255,0.04)',
                  borderColor: seleccionado ? colors.primary : colors.borderSubtle,
                  borderWidth: seleccionado ? 1.5 : 0.5,
                },
              ]}
              onPress={() => setThemeMode(op.id)}
              activeOpacity={0.8}
            >
              {/* Swatches de color */}
              <View style={styles.swatchRow}>
                {op.swatches.map((color, i) => (
                  <View key={i} style={[styles.swatch, { backgroundColor: color }]} />
                ))}
              </View>

              {/* Label + check */}
              <View style={styles.labelRow}>
                <RNText style={[styles.optionLabel, { color: seleccionado ? colors.primary : colors.textSecondary }]}>
                  {op.label}
                </RNText>
                <View
                  style={[
                    styles.checkCircle,
                    {
                      borderColor: seleccionado ? colors.primary : colors.borderSubtle,
                      backgroundColor: seleccionado ? colors.primary : 'transparent',
                    },
                  ]}
                >
                  {seleccionado && (
                    <MaterialCommunityIcons name="check" size={8} color={colors.textOnDark} />
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 14, borderWidth: 0.5, padding: 14, gap: 10 },
  label: { fontFamily: 'Manrope_700Bold', fontSize: 8, letterSpacing: 0.8 },
  row: { flexDirection: 'row', gap: 8 },
  option: {
    flex: 1,
    borderRadius: 10,
    padding: 9,
    gap: 8,
  },
  swatchRow: { flexDirection: 'row', gap: 3 },
  swatch: { width: 12, height: 12, borderRadius: 3 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  optionLabel: { fontFamily: 'Manrope_700Bold', fontSize: 9 },
  checkCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: { fontFamily: 'Manrope_500Medium', fontSize: 9, lineHeight: 13 },
});
