// Tab layout for main navigation
import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';

export default function TabLayout(): React.ReactElement {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.brandPrimary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surfacePrimary,
          borderTopColor: colors.border,
        },
        headerStyle: {
          backgroundColor: colors.surfacePrimary,
        },
        headerTintColor: colors.textPrimary,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Challenges',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="musical-notes" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
