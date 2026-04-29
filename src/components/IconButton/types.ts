import type { ReactNode } from "react";
import type { HTMLMotionProps } from "motion/react";

/**
 * M3 Expressive Icon Button variants. Spec:
 * https://m3.material.io/components/icon-buttons/specs
 *
 * - filled    → primary container, on-primary content (high emphasis)
 * - tonal     → secondary-container, on-secondary-container content
 * - outlined  → transparent container, outline border, primary content
 * - standard  → transparent container, on-surface-variant content
 */
export type IconButtonVariant = "filled" | "tonal" | "outlined" | "standard";

/**
 * Icon Button sizes. M3 Expressive defines five sizes; we collapse the
 * extras into our usual three-step scale to match the rest of the
 * library:
 *
 * - sm  → Small (32dp container, 18dp icon, shape-sm radius)
 * - md  → Default (40dp container, 24dp icon, shape-full / circular)
 * - lg  → Large (56dp container, 28dp icon, shape-lg radius)
 */
export type IconButtonSize = "sm" | "md" | "lg";

export interface IconButtonProps
  extends Omit<HTMLMotionProps<"button">, "ref" | "children" | "type"> {
  /** Visual variant — defaults to `standard` (transparent container). */
  variant?: IconButtonVariant;
  /** Container size — sm (32dp), md (40dp), lg (56dp). */
  size?: IconButtonSize;
  /** Icon node rendered inside the button (typically an SVG). */
  icon: ReactNode;
  /**
   * Toggle support. When defined, the button renders as a toggle and
   * exposes `aria-pressed`. M3 Expressive morphs the corner radius
   * when toggled — circle in the unselected state, squircle in the
   * selected state.
   */
  selected?: boolean;
  /** Disables interaction and fades the container per M3 spec. */
  disabled?: boolean;
  /** Native button type. Defaults to "button". */
  type?: "button" | "submit" | "reset";
  /** Accessible label (required — icon buttons have no visible text). */
  "aria-label": string;
}
