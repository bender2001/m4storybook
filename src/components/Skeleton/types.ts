import type { HTMLMotionProps } from "motion/react";
import type { ReactNode } from "react";

/**
 * Skeleton geometry. M3 doesn't ship a Skeleton primitive on its own,
 * so we re-skin the MUI Skeleton contract onto the M3 surface system.
 *
 *   text        : a single line of text-shaped placeholder.
 *   rectangular : a sharp rectangle (cards, images).
 *   rounded     : a rectangle with shape-md radius (default M3 surface).
 *   circular    : a perfect circle (avatars, FABs).
 */
export type SkeletonType = "text" | "rectangular" | "rounded" | "circular";

/**
 * Visual variant. M3 doesn't define skeleton variants, but the slice
 * contract requires a four-archetype color axis. Each variant paints
 * the placeholder body and (optional) outline through M3 tokens:
 *
 *   - filled    : surface-container-high body — the M3 default
 *                 placeholder (matches surface tonal step).
 *   - tonal     : secondary-container body — a softer placeholder for
 *                 colored cards/sections.
 *   - outlined  : transparent body with a 1dp outline border — used
 *                 for skeleton wireframes / scaffolding views.
 *   - text      : transparent body, no border — minimal footprint
 *                 used inline (e.g. masking a single typography line
 *                 while preserving layout flow).
 */
export type SkeletonVariant = "filled" | "tonal" | "outlined" | "text";

/**
 * Density. Drives the height/diameter scale:
 *
 *   text:        sm 12px / md 16px / lg 24px (label-m / body-m / title-l)
 *   rectangular: sm 64px / md 96px / lg 144px height (default 100% width)
 *   rounded:     sm 64px / md 96px / lg 144px height (with shape radius)
 *   circular:    sm 24px / md 40px / lg 56px diameter (matches avatar/FAB)
 */
export type SkeletonSize = "sm" | "md" | "lg";

/**
 * Corner shape. Honors the full M3 shape token set so designers can
 * morph corners independent of the geometric type. `text` and
 * `rectangular` honor the prop directly; `rounded` defaults to `md`;
 * `circular` ignores the prop (always `full`).
 */
export type SkeletonShape =
  | "none"
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "full";

/**
 * Animation mode. Matches MUI's Skeleton API:
 *   - pulse : opacity oscillation (M3 emphasized tween).
 *   - wave  : sweeping shimmer left → right.
 *   - none  : static placeholder (respects reduced motion).
 */
export type SkeletonAnimation = "pulse" | "wave" | "none";

type SkeletonOwnKey =
  | "type"
  | "variant"
  | "size"
  | "shape"
  | "animation"
  | "width"
  | "height"
  | "lines"
  | "leadingIcon"
  | "trailingIcon"
  | "disabled"
  | "error"
  | "children";

export interface SkeletonProps
  extends Omit<HTMLMotionProps<"div">, "ref" | SkeletonOwnKey> {
  /** Geometric form. Default `text`. */
  type?: SkeletonType;
  /** Visual variant. Default `filled`. */
  variant?: SkeletonVariant;
  /** Density. Default `md`. */
  size?: SkeletonSize;
  /** Corner shape token. Default depends on `type`. */
  shape?: SkeletonShape;
  /** Animation mode. Default `pulse`. */
  animation?: SkeletonAnimation;
  /** Explicit pixel/auto width override. */
  width?: number | string;
  /** Explicit pixel/auto height override. */
  height?: number | string;
  /**
   * For `text` type: render N stacked lines (with the last one
   * tapering to 70% width per the MUI convention). Default 1.
   */
  lines?: number;
  /** Optional leading icon slot — paired placeholder (e.g. avatar + line). */
  leadingIcon?: ReactNode;
  /** Optional trailing icon slot. */
  trailingIcon?: ReactNode;
  /** Disabled wash (0.38 opacity per M3 disabled state). */
  disabled?: boolean;
  /** Paint the placeholder body with the M3 error color role. */
  error?: boolean;
  /**
   * Optional children rendered inside the placeholder. When provided,
   * the skeleton sizes itself to the children rather than using the
   * fixed size scale — useful for masking real content while loading.
   */
  children?: ReactNode;
}
