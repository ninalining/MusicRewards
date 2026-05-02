// Root layout for Expo Router
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { setupTrackPlayer, cleanupTrackPlayer } from '../services/audioService';
import { ThemeProvider } from '../components/ui/ThemeProvider';
import { useTheme } from '../hooks/useTheme';

function RootNavigation(): React.ReactElement {
  const { resolvedTheme } = useTheme();

  return (
    <>
      <StatusBar style={resolvedTheme === 'dark' ? 'light' : 'dark'} />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="(modals)"
          options={{
            presentation: 'modal',
            headerShown: false,
          }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  useEffect(() => {
    // setupTrackPlayer initialises the player instance.
    // registerPlaybackService is called once at module level in index.js — never here.
    setupTrackPlayer().catch((error) => {
      if (__DEV__) {
        console.error('Failed to setup TrackPlayer:', error);
      }
    });

    // Release native TrackPlayer resources when root layout unmounts.
    // In production this only fires on app termination; during development
    // it runs on every hot-reload, allowing setupTrackPlayer to re-initialise cleanly.
    return () => {
      cleanupTrackPlayer().catch(() => {});
    };
  }, []);

  return (
    <ThemeProvider>
      <RootNavigation />
    </ThemeProvider>
  );
}
