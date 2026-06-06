import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text as RNText } from 'react-native';
import { useColors } from '@/hooks/useColors';
import type { Scope } from '@/types';

type Props = {
  value: Scope;
  onChange: (scope: Scope) => void;
};

type OptionProps = {
  label: string;
  sublabel: string;
  selected: boolean;
  onPress: () => void;
  selectedBg: string;
  selectedBorder: string;
  selectedText: string;
};

function ScopeOption({ label, sublabel, selected, onPress, selectedBg, selectedBorder, selectedText }: OptionProps) {
  const colors = useColors();
  return (
    <TouchableOpacity
      style={[
        styles.option,
        selected
          ? { backgroundColor: selectedBg, borderColor: selectedBorder }
          : styles.optionUnsel,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <RNText style={[styles.label, { color: selected ? selectedText : colors.textPrimary }]}>
        {label}
      </RNText>
      <RNText style={[styles.sublabel, { color: colors.textSecondary }]}>
        {sublabel}
      </RNText>
    </TouchableOpacity>
  );
}

export function ScopeSelector({ value, onChange }: Props) {
  const colors = useColors();
  return (
    <View style={styles.row}>
      <ScopeOption
        label="Hogar"
        sublabel="Lo ven todos"
        selected={value === 'hogar'}
        onPress={() => onChange('hogar')}
        selectedBg="rgba(107,45,62,0.08)"
        selectedBorder={colors.primary}
        selectedText={colors.primary}
      />
      <ScopeOption
        label="Personal"
        sublabel="Solo lo ves vos"
        selected={value === 'personal'}
        onPress={() => onChange('personal')}
        selectedBg={colors.personalLight}
        selectedBorder={colors.personal}
        selectedText={colors.personal}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  option: {
    flex: 1,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    borderWidth: 0.5,
    gap: 2,
  },
  optionUnsel: {
    backgroundColor: 'rgba(30,10,16,0.04)',
    borderColor: 'rgba(30,10,16,0.12)',
  },
  label: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 11,
  },
  sublabel: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 8,
  },
});
