// Tab layout for main navigation
import { Tabs } from 'expo-router';
import { Text, StyleSheet } from 'react-native';
import { THEME } from '../../constants/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: THEME.colors.primary,
        tabBarInactiveTintColor: THEME.colors.text.secondary,
        tabBarStyle: {
          backgroundColor: THEME.colors.background,
          borderTopColor: THEME.colors.border,
        },
        headerStyle: {
          backgroundColor: THEME.colors.background,
        },
        headerTintColor: THEME.colors.text.primary,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Challenges',
          tabBarIcon: ({ color }) => <Text style={[tabStyles.icon, { color }]}>🎵</Text>,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Text style={[tabStyles.icon, { color }]}>👤</Text>,
        }}
      />
    </Tabs>
  );
}

const tabStyles = StyleSheet.create({
  icon: {
    fontSize: THEME.fonts.sizes.lg,
  },
});
