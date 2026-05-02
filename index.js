// Entry point for MusicRewards.
// Must be the "main" field in package.json so this file is actually evaluated.
//
// expo-router/entry is imported first — it bootstraps Expo Router and registers
// the root App component via AppRegistry internally.
import 'expo-router/entry';

// registerPlaybackService MUST be called at module level (never inside useEffect).
// Placing it here guarantees it runs before any audio session starts.
import TrackPlayer from 'react-native-track-player';
import { playbackService } from './src/services/playbackService';

TrackPlayer.registerPlaybackService(() => playbackService);
