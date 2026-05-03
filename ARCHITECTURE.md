# MusicRewards — Architecture

> A Belong technical assessment app that rewards users with points for completing music listening challenges.

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | React Native + Expo | ~54, SDK 54 |
| Navigation | Expo Router (file-based) | 6.0 |
| Language | TypeScript (strict mode) | ~5.9 |
| State | Zustand + AsyncStorage persistence | v5 |
| Audio | react-native-track-player | ^4.1 |
| UI Effects | expo-blur, expo-linear-gradient | ~15.0 |
| Testing | Jest + @testing-library/react-native | 29 / 13 |
| Package Manager | npm | — |

---

## Project Structure

```
index.js                      # Entry point — registers playback service at module level
src/
├── app/
│   ├── _layout.tsx           # Root Stack — TrackPlayer init + cleanup
│   ├── (tabs)/
│   │   ├── _layout.tsx       # Tab bar (Challenges + Profile)
│   │   ├── index.tsx         # Home — challenge list with play buttons
│   │   └── profile.tsx       # Profile — points, completions, achievements
│   └── (modals)/
│       ├── _layout.tsx       # Modal stack
│       ├── player.tsx        # Full-screen audio player + live points
│       └── challenge-detail.tsx
├── components/
│   ├── ui/
│   │   ├── GlassCard.tsx
│   │   ├── GlassButton.tsx
│   │   ├── IconButton.tsx
│   │   ├── PointsCounter.tsx
│   │   ├── ThemeProvider.tsx
│   │   ├── Toast.tsx
│   │   └── ErrorBoundary.tsx
│   └── challenge/
│       ├── ChallengeCard.tsx
│       ├── ChallengeList.tsx
│       ├── ChallengeStatusCard.tsx
│       ├── PlayerControls.tsx
│       ├── PlayerProgress.tsx
│       └── TrackInfoCard.tsx
├── hooks/
│   ├── useMusicPlayer.ts
│   ├── usePointsCounter.ts
│   ├── useChallenges.ts
│   ├── useTheme.ts
│   └── useToast.ts
├── stores/
│   ├── musicStore.ts
│   ├── userStore.ts
│   ├── themeStore.ts
│   └── toastStore.ts
├── services/
│   ├── audioService.ts
│   └── playbackService.ts
├── constants/
│   └── theme.ts
├── types/
│   ├── index.ts
│   ├── theme.ts
│   └── toast.ts
└── utils/
    ├── accessibility.ts
    ├── challenge.ts
    └── haptics.ts
```

---

## Data Flow

```
┌─────────────┐      ┌──────────────┐      ┌──────────────┐
│  Screens    │─────▶│   Hooks      │─────▶│   Stores     │
│  (app/)     │      │              │      │  (Zustand)   │
└─────────────┘      └──────┬───────┘      └──────────────┘
                            │                      │
                            ▼                      │
                     ┌──────────────┐              │
                     │ TrackPlayer  │◀─────────────┘
                     │ (native)     │    reads state
                     └──────────────┘
```

**Screens** never call TrackPlayer directly — all audio goes through `useMusicPlayer`.

**Stores** are the single source of truth:
- `musicStore` — challenge data, current track, playback state
- `userStore` — total points, completed challenge IDs
- `themeStore` — user theme preference (dark/light/system)
- `toastStore` — toast message queue

**Hooks** coordinate between stores and native APIs:
- `useMusicPlayer` — wraps TrackPlayer, syncs playback state to musicStore, fires completion at 90%
- `usePointsCounter` — awards points proportionally on each progress tick (delta-based)
- `useChallenges` — reads from both stores, provides refresh and complete actions
- `useTheme` — combines themeStore preference + system colorScheme, returns colors and resolvedTheme
- `useToast` — exposes `showToast(message, type)` for in-app notifications

---

## State Management

### Store Pattern

Every store follows the `State` / `Store` type split:

```typescript
type MusicState = { challenges: MusicChallenge[]; currentTrack: ... };
type MusicStore = MusicState & { loadChallenges: () => void; ... };
```

### Persistence

Both stores persist to AsyncStorage via `zustand/middleware`:
- `musicStore` uses `partialize` — only persists `challenges`, not playback state
- `userStore` persists everything (`totalPoints`, `completedChallenges`)
- `themeStore` persists theme preference

### Selector Rules

- Single property: `useStore(s => s.prop)` (no wrapper needed)
- Multiple properties: `useShallow(s => ({ a: s.a, b: s.b }))`
- Derived values: computed in selectors, never stored as state
- Functional `set((s) => ...)` when new state depends on current state

---

## Audio Architecture

### Initialization Sequence

```
1. index.js (module level)
   └── TrackPlayer.registerPlaybackService(() => playbackService)

2. RootLayout useEffect
   └── setupTrackPlayer() — singleton, idempotent

3. useMusicPlayer.play(track)
   └── setupTrackPlayer() → reset() → add(track) → play()
```

### Background Playback

- **iOS:** `UIBackgroundModes: ["audio"]` declared in `app.json` and `Info.plist`
- **Android:** `AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification`

### Audio Interruption Handling (RemoteDuck)

Phone calls and other audio apps trigger `Event.RemoteDuck`. The handler uses a module-level `wasPlayingBeforeDuck` flag:

| Event | Action |
|-------|--------|
| `event.permanent` | Stop playback, clear flag |
| `event.paused` (transient) | Record playing state, pause |
| Resume (neither) | Play only if was playing before |

Manual pauses (via RemotePause) clear the flag so interruptions don't override user intent.

### Completion Logic

- **Threshold:** 90% of track duration → challenge marked complete
- **Points:** Accumulated proportionally on each 250ms progress tick (delta-based, never lump sum)
- **Guard:** `useRef<Set>` prevents duplicate completion calls across ticks

---

## Component Architecture

### Glass Design System

All UI components use the `THEME` token system — no magic numbers or hardcoded colors.

| Component | Purpose | Key Features |
|-----------|---------|-------------|
| `GlassCard` | Container with blur effect | `BlurView` (iOS) / solid fallback (Android) + `LinearGradient` |
| `GlassButton` | Interactive button | Primary/secondary variants, loading spinner, disabled state |
| `IconButton` | Reusable icon button | Unified 56pt hit area, haptic feedback |
| `PointsCounter` | Animated points display | `Animated.timing` scale pulse + `requestAnimationFrame` count |
| `ThemeProvider` | Theme context provider | Wraps app, provides colors + resolvedTheme |
| `Toast` | In-app notification | Top slide-in animation, auto-dismiss, success/error/info types |
| `ErrorBoundary` | Crash recovery | Class component wrapping screens |

### Performance Patterns

- `React.memo` on list items and frequently re-rendered components
- `FlatList` with `keyExtractor` for scrollable lists (never `ScrollView` + `.map()`)
- `useCallback` on functions passed to children
- `useEffect` dependencies narrowed to primitives (e.g., `trackId` instead of `currentTrack`)

### Accessibility

- `accessibilityRole` + `accessibilityLabel` on all interactive elements
- `accessible={false}` on decorative elements (icons, dividers)
- Touch targets ≥ 44pt (WCAG 2.1 AA) with `calculateHitSlop` utility
- Loading indicators have `accessibilityRole="progressbar"`

---

## Navigation

Expo Router file-based routing with two navigation groups:

```
Tabs (permanent)                Modals (overlay)
├── Challenges (index)          ├── Player
└── Profile                     └── Challenge Detail
```

- Params: pass only IDs, look up full objects from stores at destination
- Navigation API: `useRouter()` and `useLocalSearchParams()` from `expo-router`

---

## Testing Strategy

23 test suites, 151 tests. All files in `__tests__/` mirroring `src/` structure.

| Layer | Approach |
|-------|----------|
| Stores | Direct `.getState()` calls, no rendering |
| Hooks | `renderHook` + `waitFor` |
| Components | `render` + `screen` queries by accessible role/text |
| Services | Mock TrackPlayer, fire event listeners directly |

External dependencies (TrackPlayer, AsyncStorage, navigation) are always mocked.

---

## Key Design Decisions

1. **No barrel exports** — all imports point directly to source files, avoiding circular dependency risks and improving tree-shaking.

2. **Named exports only** — except screen files in `src/app/` which use `export default` per Expo Router's requirement.

3. **TrackPlayer not reset on hook unmount** — `useMusicPlayer` is shared across HomeScreen and PlayerModal. Resetting on unmount would kill playback when closing the modal. Playback is paused on dismiss instead.

4. **Delta-based points** — `usePointsCounter` tracks `prevAwardedRef` and only calls `addPoints(delta)` on each tick, ensuring points accumulate proportionally and never double-count.

5. **Module-level playback service** — `registerPlaybackService()` is called in `index.js` at module evaluation time, never inside `useEffect`, ensuring background event handlers are registered before any audio session.

6. **Android compatibility** — Removed `react-native-reanimated` and `react-native-worklets` (conflict with RNTP on old architecture). RNTP 4.1.2 pinned with `patch-package` fixing Kotlin nullability (`originalItem!!`). `postinstall` auto-applies the patch.

7. **Theme system** — Dark/Light/System modes via `themeStore`. `useTheme` combines user preference with system `colorScheme`. All colors flow through `ColorPalette` type including platform-specific tokens (`androidGlassFallback`).

8. **Toast notifications** — Custom Toast system replacing system alerts. `toastStore` manages a message queue; `Toast` component animates top slide-in/out with auto-dismiss.

9. **Haptic feedback** — `expo-haptics` on key interactions (button press, challenge completion) via `utils/haptics.ts`.

---

