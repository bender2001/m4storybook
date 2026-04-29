import type {
  SkeletonShape,
  SkeletonSize,
  SkeletonType,
  SkeletonVariant,
} from "./types";

/**
 * Skeleton anatomy + token bindings.
 *
 * M3 doesn't ship a Skeleton primitive, but its loading patterns
 * (https://m3.material.io/styles/motion/transitions/loading-indicators)
 * paint placeholders in the `surface-container-high` tonal step on a
 * `surface` host so the loading state reads as a tonal recess, not a
 * disabled control.
 *
 * Token bindings:
 *   - shape       : per-type default (text=sm / rectangular=none /
 *                   rounded=md / circular=full); full M3 scale exposed
 *                   via the `shape` prop.
 *   - container   : painted per `variant` (see colorMatrix).
 *   - typography  : the text-shaped skeleton inherits M3 typography
 *                   line metrics so it occupies the same vertical
 *                   space as the real content it masks.
 *   - motion      : pulse oscillates opacity 1 → 0.4; wave sweeps a
 *                   linear-gradient highlight. Both honor reduced
 *                   motion (collapse to a static placeholder).
 *   - state-layer : disabled = 0.38 opacity wash on the host.
 */
export const anatomy = {
  /**
   * Outer host. Layout depends on whether icon slots are present —
   * we use `inline-flex` so the skeleton aligns inline with adjacent
   * real content during partial-loading states.
   */
  root: [
    "relative inline-flex items-center gap-3",
    "outline-none",
    "transition-[opacity,background-color,border-color]",
    "duration-medium2 ease-emphasized",
    "focus-visible:outline-2 focus-visible:outline-offset-2",
    "focus-visible:outline-primary",
  ].join(" "),
  /** Disabled wash. */
  disabled: "cursor-not-allowed pointer-events-none",
  /**
   * Body: the placeholder rectangle. `relative overflow-hidden` so
   * the wave-mode shimmer can sweep clipped to the body bounds.
   */
  body: [
    "relative overflow-hidden block",
    "transform-gpu",
  ].join(" "),
  /**
   * Wave shimmer span. Painted as a linear-gradient that sweeps
   * left → right via motion/react. Pointer-events stay disabled so
   * the highlight never blocks clicks on stacked content.
   */
  wave: [
    "absolute inset-0 pointer-events-none",
  ].join(" "),
  /** Inline container that stacks multi-line text skeletons. */
  textStack: [
    "flex flex-col gap-2 w-full",
  ].join(" "),
  /** Icon slot — preserves a deterministic 1×1 cell. */
  icon: "shrink-0 inline-flex items-center justify-center",
  /** Centered children slot — masks real content beneath the placeholder. */
  children: [
    "relative z-[1] text-on-surface",
  ].join(" "),
} as const;

type ColorBlock = {
  /** Resting body background. */
  bg: string;
  /** Border. */
  border: string;
  /** Wave gradient — three colors, painted via inline style. */
  wave: string;
};

/**
 * Variant color matrix. Resolves to Tailwind utility classes that
 * paint via M3 tokens. The wave gradient is computed from CSS
 * variables at render time to stay token-driven across light/dark.
 */
export const colorMatrix: Record<SkeletonVariant, ColorBlock> = {
  filled: {
    bg: "bg-surface-container-high",
    border: "border-transparent",
    wave: "var(--md-sys-color-surface-container-highest)",
  },
  tonal: {
    bg: "bg-secondary-container",
    border: "border-transparent",
    wave: "var(--md-sys-color-surface-container-highest)",
  },
  outlined: {
    bg: "bg-transparent",
    border: "border border-outline",
    wave: "var(--md-sys-color-surface-variant)",
  },
  text: {
    bg: "bg-transparent",
    border: "border-transparent",
    wave: "var(--md-sys-color-surface-variant)",
  },
};

/** Error-state override — paints the placeholder body in M3 error. */
export const errorColors = {
  bg: "bg-error-container",
  border: "border-transparent",
  wave: "var(--md-sys-color-error)",
} as const;

type TypeMetrics = {
  /** Default body height. */
  height: string;
  /** Default body width (ignored for `text` which fills its host). */
  width: string;
};

/**
 * Per-type × per-size metrics. `circular` uses identical width/height
 * for a perfect circle; `text` lets the host stretch the width while
 * pinning the height to the M3 typography role.
 */
export const sizeMatrix: Record<SkeletonType, Record<SkeletonSize, TypeMetrics>> = {
  text: {
    sm: { height: "h-[12px]", width: "w-full" },
    md: { height: "h-[16px]", width: "w-full" },
    lg: { height: "h-[24px]", width: "w-full" },
  },
  rectangular: {
    sm: { height: "h-[64px]", width: "w-full" },
    md: { height: "h-[96px]", width: "w-full" },
    lg: { height: "h-[144px]", width: "w-full" },
  },
  rounded: {
    sm: { height: "h-[64px]", width: "w-full" },
    md: { height: "h-[96px]", width: "w-full" },
    lg: { height: "h-[144px]", width: "w-full" },
  },
  circular: {
    sm: { height: "h-[24px]", width: "w-[24px]" },
    md: { height: "h-[40px]", width: "w-[40px]" },
    lg: { height: "h-[56px]", width: "w-[56px]" },
  },
};

/** Shape token map. */
export const shapeClasses: Record<SkeletonShape, string> = {
  none: "rounded-shape-none",
  xs: "rounded-shape-xs",
  sm: "rounded-shape-sm",
  md: "rounded-shape-md",
  lg: "rounded-shape-lg",
  xl: "rounded-shape-xl",
  full: "rounded-shape-full",
};

/**
 * Default shape per type. `text` reads as a small pill, `rectangular`
 * stays sharp, `rounded` matches the M3 default surface radius (md),
 * `circular` is always `full`.
 */
export const defaultShapeFor: Record<SkeletonType, SkeletonShape> = {
  text: "sm",
  rectangular: "none",
  rounded: "md",
  circular: "full",
};
