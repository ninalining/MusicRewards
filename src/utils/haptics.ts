// Haptic feedback utilities — thin wrapper around expo-haptics
import * as Haptics from 'expo-haptics';

/** Light tap — use on button presses and minor interactions. */
export const hapticLight = (): void => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {
    // Silently ignore on unsupported devices (e.g. simulator without haptics)
  });
};

/** Success notification — use on challenge completion or achievement unlock. */
export const hapticSuccess = (): void => {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
};

/** Error notification — use on failures that need user attention. */
export const hapticError = (): void => {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
};
