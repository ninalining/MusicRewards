# MusicRewards

A React Native + Expo app that rewards users with points for completing music listening challenges. Built as a Belong technical assessment.

## 🚀 Getting Started

### Prerequisites

| Tool | Version | Check |
|------|---------|-------|
| Node.js | 18+ | `node -v` |
| npm | 9+ | `npm -v` |
| Xcode | 15+ (iOS) | `xcode-select -p` |
| Android SDK | API 24+ (Android) | `echo $ANDROID_HOME` |
| Java | 17+ (Android) | `java -version` |

### Install

```bash
npm install
```

### Run on iOS

```bash
cd ios && pod install && cd ..
npx expo run:ios
```

### Run on Android

```bash
adb devices
npx expo run:android
```

### After First Build

Once the native app is installed, you can start Metro only for faster JS iteration:

```bash
npx expo start
```

> ⚠️ **You cannot use Expo Go** — `react-native-track-player` is a native module that requires a development build. Always do `npx expo run:ios` or `npx expo run:android` for the initial build.

### Other Commands

```bash
npm test
npm run typecheck
npm run lint
npm run format:check
```

---

## 📁 Project Structure

```
src/
├── app/
│   ├── _layout.tsx
│   ├── (tabs)/
│   └── (modals)/
├── components/
│   ├── ui/
│   └── challenge/
├── hooks/
├── stores/
├── services/
├── constants/
├── types/
└── utils/
```

---

## 🎵 Features

- **Music Challenges** — stream tracks from AWS S3 and earn points by listening
- **Live Points** — points accumulate proportionally as playback progresses
- **90% Completion** — challenges complete when 90% of the track is heard
- **Background Playback** — audio continues when the app is backgrounded
- **Audio Interruptions** — phone calls pause/resume playback intelligently
- **Glass UI** — blur + gradient design system with animated points counter
- **Persistence** — progress and points survive app restarts (AsyncStorage)

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React Native + Expo ~54 |
| Navigation | Expo Router 6 |
| State | Zustand v5 + AsyncStorage |
| Audio | react-native-track-player ^4.1 |
| Testing | Jest + @testing-library/react-native |
| Language | TypeScript (strict mode) |

---

## 📐 Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed documentation on data flow, state management patterns, audio lifecycle, and design decisions.

---

## 🧪 Testing

```bash
npm test
npm test -- --watch
npm test -- --coverage
```

---

## 🐛 Troubleshooting

### Build & Environment

| Symptom | Cause | Fix |
|---------|-------|-----|
| `command not found: expo` | Expo CLI not globally installed | Use `npx expo run:android` (with npx prefix) |
| Kotlin error: `Bundle? vs Bundle` | RNTP 4.1.2 incompatible with Kotlin 2.x | Run `npm install` — `patch-package` auto-applies the fix |
| `Reanimated requires new architecture` | Leftover dependency | Ensure `react-native-reanimated` is not in `package.json` |
| iOS pods out of sync | Native dependency changed | `cd ios && pod install && cd ..` then rebuild |

### Android-Specific

| Symptom | Cause | Fix |
|---------|-------|-----|
| Emulator not detected | Emulator not fully booted | Wait for home screen, verify with `adb devices` |
| Red screen: `TrackPlayerModule` / TurboModule | New Architecture incompatible with RNTP | Ensure `newArchEnabled=false` in `android/gradle.properties` |
| App crashes immediately after install | Stale native build | Full rebuild: `npx expo run:android` |

### Runtime

| Symptom | Cause | Fix |
|---------|-------|-----|
| `Port 8081 already in use` | Another Metro instance running | `lsof -ti:8081 \| xargs kill -9` then retry |
| `registerPlaybackService` error | Called inside component or useEffect | Must be at module level in `index.js` |
| Audio doesn't play | TrackPlayer not initialized | Check `_layout.tsx` — `setupPlayer()` runs on mount |

---
