import React from 'react';
import { Tabs, Redirect } from 'expo-router';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/auth';
import { Text } from '@/components/ui/Text';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

type Tab = {
  name: string;
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  isSage?: boolean;
};

const TABS: Tab[] = [
  { name: 'index',    label: 'Hogar',    icon: 'home-outline' },
  { name: 'facturas', label: 'Facturas', icon: 'file-document-outline' },
  { name: 'objetivos',label: 'Objetivos',icon: 'target',         isSage: true },
  { name: 'balance',  label: 'Balance',  icon: 'scale-balance' },
  { name: 'perfil',   label: 'Perfil',   icon: 'account-circle-outline' },
];

function NidoTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom + 12 }]}>
      {TABS.map((tab, index) => {
        const isFocused = state.index === index;
        const dotColor = tab.isSage ? '#5A7A48' : '#6B2D3E';

        return (
          <TouchableOpacity
            key={tab.name}
            style={[styles.item, { opacity: isFocused ? 1 : 0.3 }]}
            onPress={() => navigation.navigate(tab.name)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name={tab.icon}
              size={22}
              color="#F5F0F2"
            />
            {isFocused && (
              <View style={[styles.dot, { backgroundColor: dotColor }]} />
            )}
            <Text style={styles.label}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function TabsLayout() {
  const { session, loading, hogar } = useAuthStore();

  if (!loading && !session) {
    return <Redirect href="/(auth)/login" />;
  }

  if (!loading && session && !hogar) {
    return <Redirect href="/(auth)/onboarding" />;
  }

  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <NidoTabBar {...props} />}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="facturas" />
      <Tabs.Screen name="objetivos" />
      <Tabs.Screen name="balance" />
      <Tabs.Screen name="perfil" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: '#1E0A10',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 8,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    marginTop: 1,
  },
  label: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 7,
    color: '#F5F0F2',
  },
});
