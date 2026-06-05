import React from 'react';
import { Tabs, Redirect } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useAuthStore } from '@/store/auth';
import { Text } from '@/components/ui/Text';

type TabIconProps = {
  emoji: string;
  focused: boolean;
};

function TabIcon({ emoji, focused }: TabIconProps) {
  const colors = useColors();
  return (
    <View style={[styles.tabIcon, focused && { backgroundColor: colors.primaryLight }]}>
      <Text style={styles.emoji}>{emoji}</Text>
    </View>
  );
}

export default function TabsLayout() {
  const { session, loading, hogar } = useAuthStore();
  const colors = useColors();

  if (!loading && !session) {
    return <Redirect href="/(auth)/login" />;
  }

  if (!loading && session && !hogar) {
    return <Redirect href="/(auth)/onboarding" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingTop: 8,
          height: 88,
          paddingBottom: 24,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ focused }: { focused: boolean }) => <TabIcon emoji="🏡" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="facturas"
        options={{
          title: 'Facturas',
          tabBarIcon: ({ focused }: { focused: boolean }) => <TabIcon emoji="🧾" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="balance"
        options={{
          title: 'Balance',
          tabBarIcon: ({ focused }: { focused: boolean }) => <TabIcon emoji="⚖️" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ focused }: { focused: boolean }) => <TabIcon emoji="👤" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  tabIcon: {
    width: 40,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  emoji: {
    fontSize: 20,
  },
});
