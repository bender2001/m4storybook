import type {
  ProgressShape,
  ProgressSize,
  ProgressType,
  ProgressVariant,
} from "./types";

/**
 * Progress anatomy + token bindings.
 *
 * M3 spec: https://m3.material.io/components/progress-indicators/specs.
 *
 * Linear progress is a 4/8/12dp horizontal track with rounded ends
 * and a sweeping active indicator. Circular progress is a 24/48/64dp
 * SVG with a track ring and a sweeping arc.
 *
 * Token bindings:
 *   - shape         : `full` by default (pill); full scale exposed
 *                     via the `shape` prop for design experiments
 *   - container     : tracked + active indicator per `variant`
 *                     (see colorMatrix)
 *   - typography    : label-m for the inline label slot
 *   - motion        : indeterminate sweeps via motion/react with the
 *                     M3 emphasized tween; reduced motion collapses
 *                     the duration to 0
 *   - stop indicator: M3 Expressive 4dp dot painted in the active
 *                     indicator color, gapped 4dp from the bar end
 *   - state-layer   : disabled = 0.38, focus ring lives on the host
 */
export const anatomy = {
  /**
   * Outer container. Lays out leading icon + track + trailing icon
   * in a row; circular collapses to a single 1×1 cell.
   */
  root: [
    "relative inline-flex items-center gap-2",
    "outline-none",
    "transition-[opacity,color,background-color,border-color]",
    "duration-medium2 ease-emphasized",
    "focus-visible:outline-2 focus-visible:outline-offset-2",
    "focus-visible:outline-primary",
  ].join(" "),
  /** Disabled wash. */
  disabled: "cursor-not-allowed pointer-events-none",
  /** Track wrapper for linear progress. */
  linearTrack: [
    "relative overflow-hidden flex-1",
  ].join(" "),
  /** Active indicator for linear progress. */
  linearIndicator: [
    "absolute inset-y-0 left-0",
    "transition-[width] duration-medium2 ease-emphasized",
  ].join(" "),
  /** Stop indicator (M3 Expressive). */
  linearStop: [
    "absolute right-0 top-1/2 -translate-y-1/2",
    "rounded-full",
  ].join(" "),
  /** Circular SVG wrapper. */
  circularRoot: "relative inline-block shrink-0",
  /** Circular SVG track + indicator share these styles. */
  circularSvg: "block -rotate-90",
  /** Centered slot inside the circular indicator. */
  circularLabel: [
    "absolute inset-0 flex items-center justify-center",
    "text-label-m text-on-surface",
  ].join(" "),
  /** Inline label (linear). */
  label: "text-label-m text-on-surface-variant",
  /** Icon slot. */
  icon: "shrink-0 inline-flex items-center justify-center",
} as const;

type ColorBlock = {
  /** Active indicator (the sweep). */
  indicator: string;
  /** Track (the rest behind the sweep). */
  track: string;
  /** Border (used by `outlined`). */
  border: string;
  /** SVG fallbacks for indicator/track stroke colors. */
  indicatorStroke: string;
  trackStroke: string;
};

/**
 * Variant color matrix. Resolves to Tailwind utility classes that
 * paint via M3 tokens.
 */
export const colorMatrix: Record<ProgressVariant, ColorBlock> = {
  filled: {
    indicator: "bg-primary",
    track: "bg-primary-container",
    border: "border-transparent",
    indicatorStroke: "stroke-primary",
    trackStroke: "stroke-primary-container",
  },
  tonal: {
    indicator: "bg-primary",
    track: "bg-secondary-container",
    border: "border-transparent",
    indicatorStroke: "stroke-primary",
    trackStroke: "stroke-secondary-container",
  },
  outlined: {
    indicator: "bg-primary",
    track: "bg-transparent",
    border: "border border-outline",
    indicatorStroke: "stroke-primary",
    trackStroke: "stroke-outline",
  },
  text: {
    indicator: "bg-primary",
    track: "bg-transparent",
    border: "border-transparent",
    indicatorStroke: "stroke-primary",
    trackStroke: "stroke-transparent",
  },
};

/** Error-state overrides — flipped on by the `error` prop. */
export const errorColors = {
  indicator: "bg-error",
  indicatorStroke: "stroke-error",
} as const;

type LinearMetrics = {
  /** Track + indicator height. */
  height: string;
  /** Stop indicator diameter. */
  stop: string;
  /** Gap between the bar end and the stop dot (M3 4dp). */
  stopGap: string;
};

/** Linear thickness scale per M3 Expressive (4dp / 8dp / 12dp). */
export const linearSizeClasses: Record<ProgressSize, LinearMetrics> = {
  sm: { height: "h-[4px]", stop: "h-[4px] w-[4px]", stopGap: "right-1" },
  md: { height: "h-[8px]", stop: "h-[8px] w-[8px]", stopGap: "right-1" },
  lg: { height: "h-[12px]", stop: "h-[12px] w-[12px]", stopGap: "right-1" },
};

type CircularMetrics = {
  /** Outer SVG box (also the indicator diameter). */
  size: number;
  /** Stroke thickness. */
  stroke: number;
  /** Container Tailwind class for width/height. */
  container: string;
};

/** Circular diameter + stroke scale per M3 (24 / 48 / 64dp). */
export const circularSizeClasses: Record<ProgressSize, CircularMetrics> = {
  sm: { size: 24, stroke: 3, container: "h-[24px] w-[24px]" },
  md: { size: 48, stroke: 4, container: "h-[48px] w-[48px]" },
  lg: { size: 64, stroke: 6, container: "h-[64px] w-[64px]" },
};

/** Shape token map for the linear track corners. */
export const shapeClasses: Record<ProgressShape, string> = {
  none: "rounded-shape-none",
  xs: "rounded-shape-xs",
  sm: "rounded-shape-sm",
  md: "rounded-shape-md",
  lg: "rounded-shape-lg",
  xl: "rounded-shape-xl",
  full: "rounded-shape-full",
};

/**
 * Default shape per progress type — linear pill + circular n/a.
 * Stored centrally so types/stories/spec can all reference one
 * source of truth.
 */
export const defaultShapeFor: Record<ProgressType, ProgressShape> = {
  linear: "full",
  circular: "full",
};
