import type { HTMLMotionProps } from "motion/react";
import type { ReactNode } from "react";

/**
 * M3 Icon. The inline-SVG wrapper that paints a glyph at a token-
 * driven size + color role. Distinct from `IconButton` (interactive
 * affordance with a state-layer) — `Icon` is the bare glyph container
 * used in any slot that takes a 24dp visual.
 *
 * https://m3.material.io/styles/icons/overview
 *
 * Color treatment:
 *  - standard  : on-surface (the M3 default)
 *  - primary   : primary
 *  - filled    : primary-container fill + on-primary-container glyph
 *  - tonal     : secondary-container fill + on-secondary-container glyph
 *  - outlined  : transparent + 1dp outline + on-surface glyph
 *  - error     : error role (paired with `state="error"`)
 */
export type IconVariant =
  | "standard"
  | "primary"
  | "filled"
  | "tonal"
  | "outlined"
  | "error";

/**
 * Icon size scale (matches M3 dense / standard / large icon sizes):
 *  - sm = 18dp glyph in a 24dp box
 *  - md = 24dp glyph in a 24dp box (M3 default)
 *  - lg = 40dp glyph in a 48dp box (used inside large surfaces)
 */
export type IconSize = "sm" | "md" | "lg";

/**
 * State token. `selected` paints the on-secondary-container role and
 * sets aria-pressed when the icon is interactive. `disabled` fades to
 * 0.38 opacity per the M3 disabled token. `error` swaps the glyph
 * color to the error role.
 */
export type IconState = "default" | "selected" | "disabled" | "error";

type IconOwnKey =
  | "variant"
  | "size"
  | "state"
  | "label"
  | "decorative"
  | "selected"
  | "disabled"
  | "leadingLabel"
  | "trailingLabel"
  | "interactive"
  | "onActivate"
  | "children"
  | "aria-label"
  | "aria-pressed";

export interface IconProps
  extends Omit<HTMLMotionProps<"span">, "ref" | IconOwnKey> {
  variant?: IconVariant;
  size?: IconSize;
  /** Visual state. */
  state?: IconState;
  /** Inline SVG (or any visual node) to render at the configured size. */
  children: ReactNode;
  /**
   * Accessible label. When set, the icon is announced as `role="img"`
   * with `aria-label`. When unset, the icon is treated as decorative
   * (`aria-hidden="true"`).
   */
  label?: string;
  /**
   * Force decorative even if `label` is set (useful for paired
   * leading/trailing layouts where the parent already labels it).
   */
  decorative?: boolean;
  /** Inline label rendered to the left of the glyph (label-l type). */
  leadingLabel?: ReactNode;
  /** Inline label rendered to the right of the glyph (label-l type). */
  trailingLabel?: ReactNode;
  /**
   * Promotes the wrapper to a focusable, keyboard-activatable button.
   * Used in toolbar slots where the glyph is the only affordance but
   * a full IconButton would be too heavy.
   */
  interactive?: boolean;
  /** Selected state. Implies `state="selected"` if not explicitly set. */
  selected?: boolean;
  /** Disabled state. Implies `state="disabled"` if not explicitly set. */
  disabled?: boolean;
  /** Activation handler (Enter/Space/click). Fires only when interactive. */
  onActivate?: () => void;
}
