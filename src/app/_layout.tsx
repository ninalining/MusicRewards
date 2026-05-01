// Root layout for Expo Router
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { setupTrackPlayer, cleanupTrackPlayer } from '../services/audioService';

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
  );
}
