// Accessibility utilities — WCAG 2.1 Level AA compliance helpers

/**
 * Minimum touch target size in points (WCAG 2.1 Success Criterion 2.5.5).
 * Interactive elements smaller than this should use hitSlop to extend the
 * touchable area.
 */
export const MINIMUM_HIT_TARGET = 44;

interface HitSlopInsets {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

/**
 * Calculate the hitSlop insets needed to meet the minimum touch target size.
 *
 * Returns `{ top: 0, bottom: 0, left: 0, right: 0 }` when the element already
 * meets the minimum. The padding is applied symmetrically on all sides.
 *
 * @param elementSize — the actual width or height of the interactive element in points
 */
export const calculateHitSlop = (elementSize: number): HitSlopInsets => {
  const padding =
    elementSize >= MINIMUM_HIT_TARGET ? 0 : Math.ceil((MINIMUM_HIT_TARGET - elementSize) / 2);
  return { top: padding, bottom: padding, left: padding, right: padding };
};
