import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Radii } from '@/constants/theme';
import { useColors } from '@/hooks/useColors';

type Props = {
  progress: number; // 0 a 1
  color?: string;
  height?: number;
};

export function ProgressBar({ progress, color, height = 8 }: Props) {
  const colors = useColors();
  const trackColor = color ?? colors.primary;
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(anim, {
      toValue: Math.min(Math.max(progress, 0), 1),
      useNativeDriver: false,
      tension: 50,
      friction: 8,
    }).start();
  }, [progress]);

  const width = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.track, { height, borderRadius: height / 2, backgroundColor: colors.border }]}>
      <Animated.View
        style={[
          styles.fill,
          { width, backgroundColor: trackColor, borderRadius: height / 2 },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    height: '100%',
  },
});
