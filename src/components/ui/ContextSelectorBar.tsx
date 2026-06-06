import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text as RNText } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useSpace } from '@/context/SpaceContext';

export function ContextSelectorBar() {
  const colors = useColors();
  const { activeContext, setActiveContext } = useSpace();
  const isPersonal = activeContext === 'personal';

  return (
    <View style={[
      styles.bar,
      {
        backgroundColor: colors.card,
        borderColor: isPersonal ? colors.personalBorder : colors.borderSubtle,
      },
    ]}>
      <RNText style={[
        styles.label,
        { color: isPersonal ? colors.personal : colors.textSecondary },
      ]}>
        {isPersonal ? 'ESPACIO PERSONAL' : 'ESPACIO HOGAR'}
      </RNText>
      <View style={styles.toggle}>
        <TouchableOpacity
          onPress={() => setActiveContext('hogar')}
          style={[styles.btn, !isPersonal && { backgroundColor: '#1E0A10' }]}
          activeOpacity={0.8}
        >
          <RNText style={[styles.btnText, { color: !isPersonal ? '#F5F0F2' : colors.textSecondary }]}>
            Hogar
          </RNText>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveContext('personal')}
          style={[styles.btn, isPersonal && { backgroundColor: colors.personal }]}
          activeOpacity={0.8}
        >
          <RNText style={[styles.btnText, { color: isPersonal ? '#F5F0F2' : colors.textSecondary }]}>
            Personal
          </RNText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 0.5,
    marginBottom: 12,
  },
  label: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 8,
    letterSpacing: 0.6,
  },
  toggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(30,10,16,0.07)',
    borderRadius: 20,
    padding: 3,
    gap: 2,
  },
  btn: {
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  btnText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 8,
  },
});
