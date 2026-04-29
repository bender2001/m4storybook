import type { HTMLMotionProps } from "motion/react";
import type { ReactNode } from "react";

/**
 * MUI-fallback Badge re-skinned with M3 Expressive tokens. Color matrix:
 *   - filled    : error / on-error (M3 default badge color)
 *   - tonal     : secondary-container / on-secondary-container
 *   - outlined  : transparent + 1dp outline, on-surface text
 *   - elevated  : surface-container-high + elevation-1, on-surface text
 */
export type BadgeVariant = "filled" | "tonal" | "outlined" | "elevated";

/**
 * Density. M3 Expressive defines a small (dot) and large (label) pair;
 * we expose three sizes to mirror the rest of the library:
 *   - sm  : 8dp dot (no label)
 *   - md  : 16dp pill (single char / count)
 *   - lg  : 24dp pill (multi-char / icons + label)
 */
export type BadgeSize = "sm" | "md" | "lg";

export type BadgeAnchorOrigin =
  | "top-right"
  | "top-left"
  | "bottom-right"
  | "bottom-left";

/** Adjusts the anchor offset for a circular (e.g. avatar) vs rectangular target. */
export type BadgeOverlap = "rectangular" | "circular";

type BadgeOwnKey =
  | "variant"
  | "size"
  | "content"
  | "max"
  | "showZero"
  | "invisible"
  | "standalone"
  | "anchorOrigin"
  | "overlap"
  | "leadingIcon"
  | "trailingIcon"
  | "interactive"
  | "disabled"
  | "selected"
  | "children"
  | "aria-label";

export interface BadgeProps
  extends Omit<HTMLMotionProps<"span">, "ref" | BadgeOwnKey> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  /** Badge content (number or text). Numeric content respects `max`. */
  content?: ReactNode;
  /** Clamp numeric `content` to `${max}+` when exceeded. Default 99. */
  max?: number;
  /** Show a zero count (default: hidden). */
  showZero?: boolean;
  /** Force-hide the badge (M3 entrance/exit transition). */
  invisible?: boolean;
  /** Render the badge inline (no anchored child). */
  standalone?: boolean;
  /** Corner anchor when wrapping a target. Default `top-right`. */
  anchorOrigin?: BadgeAnchorOrigin;
  /** Adjusts the anchor offset for circular vs rectangular targets. */
  overlap?: BadgeOverlap;
  /** Optional leading icon slot (large badge only). */
  leadingIcon?: ReactNode;
  /** Optional trailing icon slot (large badge only). */
  trailingIcon?: ReactNode;
  /** Renders the badge as a focusable button with state layer. */
  interactive?: boolean;
  /** Block all interaction; reads as aria-disabled. */
  disabled?: boolean;
  /** Selected state — swaps the badge to the inverse role pair. */
  selected?: boolean;
  /** Anchored target to wrap. When omitted, falls back to standalone. */
  children?: ReactNode;
  /** Accessible label override (defaults to derived content). */
  "aria-label"?: string;
}
