import * as Haptics from 'expo-haptics';
import { hapticLight, hapticSuccess } from '../../src/utils/haptics';

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn().mockResolvedValue(undefined),
  notificationAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium', Heavy: 'Heavy' },
  NotificationFeedbackType: { Success: 'Success', Warning: 'Warning', Error: 'Error' },
}));

describe('haptics utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('hapticLight', () => {
    it('calls Haptics.impactAsync with Light style', () => {
      hapticLight();

      expect(Haptics.impactAsync).toHaveBeenCalledWith(
        Haptics.ImpactFeedbackStyle.Light,
      );
    });

    it('does not throw when haptics fails', () => {
      (Haptics.impactAsync as jest.Mock).mockRejectedValueOnce(
        new Error('Unsupported'),
      );

      expect(() => hapticLight()).not.toThrow();
    });
  });

  describe('hapticSuccess', () => {
    it('calls Haptics.notificationAsync with Success type', () => {
      hapticSuccess();

      expect(Haptics.notificationAsync).toHaveBeenCalledWith(
        Haptics.NotificationFeedbackType.Success,
      );
    });

    it('does not throw when haptics fails', () => {
      (Haptics.notificationAsync as jest.Mock).mockRejectedValueOnce(
        new Error('Unsupported'),
      );

      expect(() => hapticSuccess()).not.toThrow();
    });
  });
});
