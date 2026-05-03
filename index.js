import 'expo-router/entry';

// registerPlaybackService MUST be called at module level (never inside useEffect).
import TrackPlayer from 'react-native-track-player';
import { playbackService } from './src/services/playbackService';

TrackPlayer.registerPlaybackService(() => playbackService);
