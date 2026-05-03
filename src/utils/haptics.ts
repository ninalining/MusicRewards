import * as Haptics from 'expo-haptics';

export const hapticLight = (): void => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
};

export const hapticSuccess = (): void => {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
};

export const hapticError = (): void => {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
};
