import { Stack } from 'expo-router';
import { useTheme } from '../../hooks/useTheme';

export default function ModalLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.surfacePrimary,
        },
        headerTintColor: colors.textPrimary,
        presentation: 'modal',
      }}
    >
      <Stack.Screen
        name="player"
        options={{
          title: 'Now Playing',
          headerBackTitle: 'Close',
        }}
      />
      <Stack.Screen
        name="challenge-detail"
        options={{
          title: 'Challenge Details',
          headerBackTitle: 'Close',
        }}
      />
    </Stack>
  );
}
