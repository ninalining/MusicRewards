// Register the playback service for react-native-track-player
import { AppRegistry } from 'react-native';
import TrackPlayer from 'react-native-track-player';

// Expo Router manages the root App component — import via the standard entry point
import { App } from 'expo-router/build/qualified-entry';

// Register the main application
AppRegistry.registerComponent('main', () => App);

// Register the playback service
TrackPlayer.registerPlaybackService(() => require('./src/services/playbackService').playbackService);