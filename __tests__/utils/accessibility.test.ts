import { MINIMUM_HIT_TARGET, calculateHitSlop } from '../../src/utils/accessibility';

describe('accessibility utils', () => {
  describe('MINIMUM_HIT_TARGET', () => {
    it('is 44 points per WCAG 2.1', () => {
      expect(MINIMUM_HIT_TARGET).toBe(44);
    });
  });

  describe('calculateHitSlop', () => {
    it('returns zero insets when element meets the minimum', () => {
      const result = calculateHitSlop(44);
      expect(result).toEqual({ top: 0, bottom: 0, left: 0, right: 0 });
    });

    it('returns zero insets when element exceeds the minimum', () => {
      const result = calculateHitSlop(60);
      expect(result).toEqual({ top: 0, bottom: 0, left: 0, right: 0 });
    });

    it('returns symmetric padding for a small element', () => {
      // Element is 20pt → gap is 24pt → each side = ceil(12) = 12
      const result = calculateHitSlop(20);
      expect(result).toEqual({ top: 12, bottom: 12, left: 12, right: 12 });
    });

    it('rounds up for odd gaps', () => {
      // Element is 21pt → gap is 23pt → each side = ceil(11.5) = 12
      const result = calculateHitSlop(21);
      expect(result).toEqual({ top: 12, bottom: 12, left: 12, right: 12 });
    });

    it('handles zero-size element', () => {
      const result = calculateHitSlop(0);
      expect(result).toEqual({ top: 22, bottom: 22, left: 22, right: 22 });
    });
  });
});
