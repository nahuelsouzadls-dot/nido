import React from 'react';
import { View, StyleSheet, Text as RNText } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';

export function PrivacyBadge() {
  const colors = useColors();
  return (
    <View style={[styles.badge, { backgroundColor: colors.personalLight }]}>
      <MaterialCommunityIcons name="lock-outline" size={12} color={colors.personal} />
      <RNText style={[styles.text, { color: colors.personal }]}>
        Solo visible para vos
      </RNText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignSelf: 'center',
  },
  text: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 8,
  },
});
