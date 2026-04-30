import type {
  TransitionsShape,
  TransitionsSize,
  TransitionsVariant,
} from "./types";

/**
 * Transitions anatomy + M3 token bindings.
 *
 * MUI's transition primitives (Fade / Grow / Slide / Zoom / Collapse —
 * https://mui.com/material-ui/transitions/) wrap arbitrary children and
 * play an enter / exit animation. M3 has no direct equivalent — motion
 * is described as a set of tokens (easings + durations + spring
 * presets) rather than a component. Transitions binds the MUI
 * primitives onto the M3 motion-token surface so callers get a single
 * variant-driven animator that uses the right easing / duration for
 * the kind of motion being expressed.
 *
 * Token bindings:
 *   - container   : surface roles per variant × state matrix
 *   - shape       : full M3 7-token corner scale
 *   - typography  : title-* + body-* roles for the optional label slot
 *   - motion      : `medium2` (300ms) duration on the `emphasized` /
 *                   `standard` easing per variant; size scales the
 *                   duration to short4 (200ms) / medium2 (300ms) /
 *                   long1 (450ms)
 *   - state-layer : focus ring on the wrapper for keyboard parity
 *
 * Spec sources:
 *   - MUI Transitions  https://mui.com/material-ui/transitions/
 *   - M3 motion        https://m3.material.io/styles/motion/easing-and-duration/tokens-specs
 *   - M3 surface roles https://m3.material.io/styles/color/the-color-system/color-roles
 *   - M3 elevation     https://m3.material.io/styles/elevation/tokens
 *   - M3 type scale    https://m3.material.io/styles/typography/type-scale-tokens
 */
export const anatomy = {
  /**
   * Outer wrapper — paints the host surface around the transitioning
   * children, drives the focus ring, and routes container property
   * transitions through the M3 emphasized tween.
   */
  root: [
    "relative isolate inline-flex w-full flex-col",
    "outline-none",
    "transition-[box-shadow,background-color,border-color,color]",
    "duration-medium2 ease-emphasized",
    "focus-visible:ring-2 focus-visible:ring-primary",
    "focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
  ].join(" "),
  /** Disabled wash. */
  disabled: "cursor-not-allowed",
  /** Header row — leading icon + label + trailing icon. */
  header: [
    "relative z-[1] flex w-full items-center gap-3",
    "font-medium leading-snug",
  ].join(" "),
  /** 24dp icon slot. */
  icon: [
    "inline-flex h-6 w-6 shrink-0 items-center justify-center",
  ].join(" "),
  /** Body slot the transition animates. */
  body: "relative z-[1] w-full",
  /** Pending fallback slot — rendered while `in` is false. */
  fallback: [
    "relative z-[1] flex w-full items-center text-on-surface-variant",
  ].join(" "),
  /** Collapse needs `overflow-hidden` while animating so the height
   *  clip stays clean. */
  collapseClip: "overflow-hidden",
} as const;

type ColorBlock = {
  rest: string;
  selected: string;
  error: string;
  border: string;
  elevation: string;
  iconColor: string;
};

export const variantClasses: Record<TransitionsVariant, ColorBlock> = {
  fade: {
    rest: "bg-transparent text-on-surface",
    selected: "bg-secondary-container text-on-secondary-container",
    error: "bg-error-container text-on-error-container",
    border: "border border-transparent",
    elevation: "shadow-elevation-0",
    iconColor: "text-on-surface-variant",
  },
  grow: {
    rest: "bg-surface text-on-surface",
    selected: "bg-secondary-container text-on-secondary-container",
    error: "bg-error-container text-on-error-container",
    border: "border border-transparent",
    elevation: "shadow-elevation-1",
    iconColor: "text-on-surface-variant",
  },
  slide: {
    rest: "bg-surface-container text-on-surface",
    selected: "bg-secondary-container text-on-secondary-container",
    error: "bg-error-container text-on-error-container",
    border: "border border-transparent",
    elevation: "shadow-elevation-1",
    iconColor: "text-on-surface-variant",
  },
  zoom: {
    rest: "bg-surface-container-low text-on-surface",
    selected: "bg-secondary-container text-on-secondary-container",
    error: "bg-error-container text-on-error-container",
    border: "border border-transparent",
    elevation: "shadow-elevation-2",
    iconColor: "text-on-surface-variant",
  },
  collapse: {
    rest: "bg-surface text-on-surface",
    selected: "bg-secondary-container text-on-secondary-container",
    error: "bg-error-container text-on-error-container",
    border: "border border-outline-variant",
    elevation: "shadow-elevation-0",
    iconColor: "text-on-surface-variant",
  },
};

type SizeBlock = {
  pad: string;
  gap: string;
  minH: string;
  bodyType: string;
  headerType: string;
  durationMs: number;
  durationLabel: string;
};

/**
 * Density × motion-duration matrix. The duration scale follows the M3
 * motion-token tiers — short4 (200ms) for compact dense transitions,
 * medium2 (300ms) as the default, long1 (450ms) for large surfaces.
 */
export const sizeClasses: Record<TransitionsSize, SizeBlock> = {
  sm: {
    pad: "p-3",
    gap: "gap-2",
    minH: "min-h-[48px]",
    bodyType: "text-body-s leading-[20px]",
    headerType: "text-title-s",
    durationMs: 200,
    durationLabel: "short4",
  },
  md: {
    pad: "p-6",
    gap: "gap-3",
    minH: "min-h-[64px]",
    bodyType: "text-body-m leading-[20px]",
    headerType: "text-title-m",
    durationMs: 300,
    durationLabel: "medium2",
  },
  lg: {
    pad: "p-10",
    gap: "gap-4",
    minH: "min-h-[80px]",
    bodyType: "text-body-l leading-[24px]",
    headerType: "text-title-l",
    durationMs: 450,
    durationLabel: "long1",
  },
};

export const shapeClasses: Record<TransitionsShape, string> = {
  none: "rounded-shape-none",
  xs: "rounded-shape-xs",
  sm: "rounded-shape-sm",
  md: "rounded-shape-md",
  lg: "rounded-shape-lg",
  xl: "rounded-shape-xl",
  full: "rounded-shape-full",
};

/**
 * Easing token map → cubic-bezier curve. Keeps the motion vocabulary
 * aligned with `src/tokens/motion.ts` so the playwright spec can
 * assert the exact curve.
 */
export const easingCurves = {
  standard: [0.2, 0, 0, 1] as [number, number, number, number],
  emphasized: [0.2, 0, 0, 1] as [number, number, number, number],
  "emphasized-decelerate": [0.05, 0.7, 0.1, 1] as [number, number, number, number],
  "emphasized-accelerate": [0.3, 0, 0.8, 0.15] as [number, number, number, number],
} as const;
