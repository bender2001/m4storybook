import type { HTMLMotionProps } from "motion/react";
import type { ReactNode } from "react";

/**
 * M3 surface variants. Paper is the foundational Surface primitive
 * that Card / AppBar / Dialog / Menu sit on top of. M3 Expressive
 * defines three primary container treatments:
 *   - elevated  : surface-container-low + elevation-1 (resting),
 *                 elevation-2 on hover/focus
 *   - filled    : surface-container-highest, no elevation
 *   - outlined  : transparent + 1dp outline-variant border
 *
 * MUI's Paper additionally exposes a tonal variant that maps to the
 * M3 secondary-container role for low-emphasis surfaces.
 */
export type PaperVariant = "elevated" | "filled" | "tonal" | "outlined";

/**
 * Paper density. `sm` = 8dp interior padding, `md` = 16dp, `lg` = 24dp.
 * Mirrors the M3 surface density scale (compact / default / spacious).
 */
export type PaperSize = "sm" | "md" | "lg";

/**
 * M3 corner shape scale. `xs..xl` map to the shape tokens; `full`
 * draws a pill. Defaults to `md` (12dp) per the M3 spec for medium
 * surfaces.
 */
export type PaperShape = "none" | "xs" | "sm" | "md" | "lg" | "xl" | "full";

/**
 * Elevation level when the elevated variant is in use. Matches M3
 * elevation 0..5. Resting elevation defaults to 1; hover bumps to 2.
 */
export type PaperElevation = 0 | 1 | 2 | 3 | 4 | 5;

type PaperOwnKey =
  | "variant"
  | "size"
  | "shape"
  | "elevation"
  | "interactive"
  | "selected"
  | "disabled"
  | "leadingIcon"
  | "trailingIcon"
  | "label"
  | "children"
  | "aria-label";

export interface PaperProps
  extends Omit<HTMLMotionProps<"div">, "ref" | PaperOwnKey> {
  variant?: PaperVariant;
  size?: PaperSize;
  shape?: PaperShape;
  /** Resting elevation level for the `elevated` variant. */
  elevation?: PaperElevation;
  /** Renders the surface as a focusable, clickable affordance with a
   *  state layer + M3 Expressive shape morph + lift on hover. */
  interactive?: boolean;
  /** Marks the surface as selected (secondary-container fill + aria). */
  selected?: boolean;
  /** Block all interaction; reads as aria-disabled. */
  disabled?: boolean;
  /** Optional leading icon rendered alongside the label slot. */
  leadingIcon?: ReactNode;
  /** Optional trailing icon rendered alongside the label slot. */
  trailingIcon?: ReactNode;
  /** Optional label slot — renders inline with the icon slots. */
  label?: ReactNode;
  /** Body content. Falls back to label when provided. */
  children?: ReactNode;
  /** Accessible label override (only used when interactive). */
  "aria-label"?: string;
}
