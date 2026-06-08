import React, { useEffect } from 'react';
import Animated, { useSharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { anim } from '@/theme/animations';
import { useMotion } from '@/hooks/useMotion';

interface Props {
  children: React.ReactNode;
  index?: number;
}

export function AnimatedListItem({ children, index = 0 }: Props) {
  const translateY = useSharedValue(18);
  const opacity    = useSharedValue(0);
  const { reduceMotion } = useMotion();

  useEffect(() => {
    if (reduceMotion) {
      translateY.value = 0;
      opacity.value    = 1;
    } else {
      anim.cardEnter(translateY, opacity, index * 60);
    }
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return <Animated.View style={animStyle}>{children}</Animated.View>;
}
