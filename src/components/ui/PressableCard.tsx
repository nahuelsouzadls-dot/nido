import React from 'react';
import { Pressable, StyleProp, ViewStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { anim } from '@/theme/animations';
import { useMotion } from '@/hooks/useMotion';

interface Props {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}

export function PressableCard({ children, onPress, style, disabled }: Props) {
  const scale = useSharedValue(1);
  const { reduceMotion } = useMotion();

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPressIn={() => { if (!reduceMotion) anim.pressIn(scale); }}
      onPressOut={() => { if (!reduceMotion) anim.pressOut(scale); }}
      onPress={onPress}
      disabled={disabled}
    >
      <Animated.View style={[style, animStyle]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}
