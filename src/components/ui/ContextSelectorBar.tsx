import React, { useEffect, useRef, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Text as RNText, LayoutChangeEvent } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useColors } from '@/hooks/useColors';
import { useSpace } from '@/context/SpaceContext';
import { springs } from '@/theme/animations';
import { useMotion } from '@/hooks/useMotion';

export function ContextSelectorBar() {
  const colors = useColors();
  const { activeContext, setActiveContext } = useSpace();
  const { reduceMotion } = useMotion();
  const isPersonal = activeContext === 'personal';

  // Ancho de cada botón del toggle para posicionar el indicador
  const [btnWidth, setBtnWidth] = useState(0);
  const slideX = useSharedValue(0);

  useEffect(() => {
    if (btnWidth === 0) return;
    const target = isPersonal ? btnWidth : 0;
    if (reduceMotion) {
      slideX.value = target;
    } else {
      slideX.value = withSpring(target, springs.snappy);
    }
  }, [isPersonal, btnWidth, reduceMotion]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: slideX.value }],
  }));

  const onToggleLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0) setBtnWidth((w - 6) / 2); // 6 = padding*2 + gap
  };

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

      <View
        style={[styles.toggle, { backgroundColor: isPersonal ? colors.personalLight : 'rgba(30,10,16,0.07)' }]}
        onLayout={onToggleLayout}
      >
        {/* Indicador animado que se desliza */}
        {btnWidth > 0 && (
          <Animated.View
            style={[
              styles.indicator,
              indicatorStyle,
              {
                width: btnWidth,
                backgroundColor: isPersonal ? colors.personal : colors.primary,
              },
            ]}
          />
        )}
        <TouchableOpacity
          onPress={() => setActiveContext('hogar')}
          style={[styles.btn, { width: btnWidth || undefined }]}
          activeOpacity={0.8}
        >
          <RNText style={[styles.btnText, { color: !isPersonal ? '#fff' : colors.textSecondary }]}>
            Hogar
          </RNText>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveContext('personal')}
          style={[styles.btn, { width: btnWidth || undefined }]}
          activeOpacity={0.8}
        >
          <RNText style={[styles.btnText, { color: isPersonal ? '#fff' : colors.textSecondary }]}>
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
    borderRadius: 20,
    padding: 3,
    gap: 2,
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
    top: 3,
    left: 3,
    bottom: 3,
    borderRadius: 16,
    zIndex: 0,
  },
  btn: {
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    zIndex: 1,
    alignItems: 'center',
  },
  btnText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 8,
  },
});
