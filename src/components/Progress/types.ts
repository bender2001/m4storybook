import type { HTMLMotionProps } from "motion/react";
import type { ReactNode } from "react";

/**
 * Progress shape. M3 ships two indicator forms — `linear` (a
 * horizontal track + active indicator) and `circular` (a sweeping
 * arc on a circular track). See
 * https://m3.material.io/components/progress-indicators/specs.
 */
export type ProgressType = "linear" | "circular";

/**
 * Visual variant. M3 progress doesn't ship five archetypes the way
 * Button does, but the MUI Progress contract requires a `variant`
 * axis, so we map onto four token-driven looks:
 *
 *   - filled    : primary active indicator on a primary-container
 *                 track (M3 default — high contrast).
 *   - tonal     : primary active indicator on a secondary-container
 *                 track (softer veil for low-emphasis surfaces).
 *   - outlined  : primary active indicator with a transparent track +
 *                 1dp outline border (used over busy surfaces).
 *   - text      : primary active indicator only — transparent track,
 *                 no border (minimal footprint, used inline).
 */
export type ProgressVariant = "filled" | "tonal" | "outlined" | "text";

/**
 * Density / thickness. Drives the M3 expressive thickness scale:
 *
 *   linear: sm 4dp / md 8dp (M3 default) / lg 12dp.
 *   circular: sm 24dp / md 48dp (M3 default) / lg 64dp diameter,
 *             stroke 3dp / 4dp / 6dp.
 */
export type ProgressSize = "sm" | "md" | "lg";

/**
 * Corner shape. Linear progress defaults to `full` (M3 Expressive
 * pill-shaped active indicator). Circular ignores shape but accepts
 * the prop for API parity with the rest of the slice.
 */
export type ProgressShape =
  | "none"
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "full";

/**
 * Determinate vs. indeterminate. M3 Expressive draws a wavy track for
 * indeterminate; we approximate with a sweeping bar/arc that
 * respects reduced-motion.
 */
export type ProgressMode = "determinate" | "indeterminate";

type ProgressOwnKey =
  | "type"
  | "variant"
  | "size"
  | "shape"
  | "mode"
  | "value"
  | "valueMin"
  | "valueMax"
  | "label"
  | "leadingIcon"
  | "trailingIcon"
  | "showStop"
  | "disabled"
  | "error"
  | "children";

export interface ProgressProps
  extends Omit<HTMLMotionProps<"div">, "ref" | ProgressOwnKey> {
  /** Indicator shape. Default `linear`. */
  type?: ProgressType;
  /** Visual variant. Default `filled`. */
  variant?: ProgressVariant;
  /** Density (drives thickness/diameter). Default `md`. */
  size?: ProgressSize;
  /** Corner shape token. Default `full` (linear) — ignored for circular. */
  shape?: ProgressShape;
  /** Determinate vs indeterminate. Default `determinate`. */
  mode?: ProgressMode;
  /** Determinate value 0..100 (clamped to [valueMin, valueMax]). */
  value?: number;
  /** Determinate range minimum. Default 0. */
  valueMin?: number;
  /** Determinate range maximum. Default 100. */
  valueMax?: number;
  /** Optional textual label rendered alongside the track. */
  label?: ReactNode;
  /** Leading icon slot (rendered before the track / before the label). */
  leadingIcon?: ReactNode;
  /** Trailing icon slot (rendered after the track / after the label). */
  trailingIcon?: ReactNode;
  /**
   * Render the M3 Expressive stop indicator — a 4dp dot at the end
   * of the linear track. Defaults to true for linear, ignored for
   * circular.
   */
  showStop?: boolean;
  /** Disabled wash (0.38 opacity per M3 disabled state). */
  disabled?: boolean;
  /** Paint the active indicator with the error color role. */
  error?: boolean;
  /** Optional children — used by slot-rich stories (label/value). */
  children?: ReactNode;
}
