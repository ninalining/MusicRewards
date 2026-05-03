# MusicRewards

A React Native + Expo app that rewards users with points for completing music listening challenges. Built as a Belong technical assessment.

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Install iOS pods
cd ios && pod install && cd ..

# Start development server
npx expo start

# Run on iOS simulator
npx expo run:ios

# Run tests
npm test

# Type check
npm run typecheck

# Lint
npm run lint

# Format
npm run format:check
```

## 📁 Project Structure

```
src/
├── app/                    # Expo Router screens (file-based navigation)
│   ├── _layout.tsx         # Root layout — TrackPlayer init
│   ├── (tabs)/             # Tab screens (Challenges, Profile)
│   └── (modals)/           # Modal screens (Player, Challenge Detail)
├── components/
│   ├── ui/                 # Glass design system (GlassCard, GlassButton, PointsCounter)
│   └── challenge/          # Domain components (ChallengeCard, PlayerControls, etc.)
├── hooks/                  # Business logic (useMusicPlayer, usePointsCounter, useChallenges)
├── stores/                 # Zustand stores (musicStore, userStore)
├── services/               # TrackPlayer setup + background playback service
├── constants/              # THEME tokens + sample challenge data
├── types/                  # Shared TypeScript interfaces
└── utils/                  # Accessibility helpers, formatting utilities
```

## 🎵 Features

- **Music Challenges** — stream tracks from AWS S3 and earn points by listening
- **Live Points** — points accumulate proportionally as playback progresses
- **90% Completion** — challenges complete when 90% of the track is heard
- **Background Playback** — audio continues when the app is backgrounded (iOS)
- **Audio Interruptions** — phone calls pause/resume playback intelligently
- **Glass UI** — blur + gradient design system with animated points counter
- **Persistence** — progress and points survive app restarts (AsyncStorage)

## �️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React Native + Expo ~54 |
| Navigation | Expo Router 6 |
| State | Zustand v5 + AsyncStorage |
| Audio | react-native-track-player ^4.1 |
| Testing | Jest + @testing-library/react-native |
| Language | TypeScript (strict mode) |

## 📐 Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed architecture documentation including data flow, state management patterns, audio lifecycle, and design decisions.

## 🧪 Testing

14 test suites, 111 tests covering stores, hooks, components, services, and utilities.

```bash
npm test                    # Run all tests
npm test -- --watch         # Watch mode
npm test -- --coverage      # With coverage report
```

## 📖 Reference

See [docs/README.md](./docs/README.md) for the full technical requirements specification.