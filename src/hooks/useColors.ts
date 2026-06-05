import { useColorScheme } from 'react-native';
import { LightColors, DarkColors } from '@/constants/theme';

export function useColors() {
  const scheme = useColorScheme();
  return scheme === 'dark' ? DarkColors : LightColors;
}
