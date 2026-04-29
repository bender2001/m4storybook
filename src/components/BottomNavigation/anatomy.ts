import type {
  BottomNavigationShape,
  BottomNavigationSize,
  BottomNavigationVariant,
} from "./types";

/**
 * Bottom Navigation (M3 Navigation Bar) anatomy + token bindings.
 *
 * Spec: https://m3.material.io/components/navigation-bar/specs
 *
 *   - container shape  : `none` (full-bleed) by default
 *   - container fill   : `surface-container` (filled / default)
 *   - container height : 80dp at md density
 *   - active indicator : 64dp × 32dp pill (`shape-full`),
 *                        `secondary-container` fill, springy entry
 *   - icon size        : 24dp at md density
 *   - icon color       : `on-surface-variant` (rest)
 *                        / `on-secondary-container` (selected)
 *   - label role       : label-m, weight 500
 *   - label color      : `on-surface-variant` (rest)
 *                        / `on-surface` (selected)
 *   - state-layer      : hover 0.08, focus 0.10, pressed 0.10 — painted
 *                        inside the active-indicator footprint
 *   - destinations     : recommended 3-5 per M3 spec
 *   - motion           : springy active-indicator slide + decelerate
 *                        label/icon swap (M3 Expressive)
 */
export const anatomy = {
  /** Outer <nav> container. */
  root: [
    "relative isolate flex w-full items-stretch",
    "transition-[box-shadow,background-color,border-color]",
    "duration-medium2 ease-emphasized",
  ].join(" "),
  /** Top divider used by the outlined variant. */
  divider: "absolute inset-x-0 top-0 h-px bg-outline-variant pointer-events-none",
  /** Disabled wash. */
  disabled: "opacity-[0.38] cursor-not-allowed pointer-events-none",
  /** Per-destination button host. */
  item: [
    "group relative flex flex-1 flex-col items-center justify-center",
    "outline-none select-none",
    "min-w-0",
    "transition-[color] duration-short4 ease-emphasized",
    "focus-visible:outline-none",
  ].join(" "),
  /** Icon row — wraps the active-indicator + the icon. */
  iconWrap: [
    "relative flex items-center justify-center",
  ].join(" "),
  /**
   * Active-indicator pill. Sits behind the icon and morphs in via
   * motion/react. We pin its size with explicit pixel utilities so
   * the M3 64×32 (md) target survives Tailwind's class scan.
   */
  indicator: [
    "absolute left-1/2 top-1/2",
    "rounded-shape-full",
    "bg-secondary-container",
    "pointer-events-none",
  ].join(" "),
  /** State layer — sits inside the indicator footprint. */
  stateLayer: [
    "absolute left-1/2 top-1/2",
    "rounded-shape-full",
    "bg-on-surface",
    "pointer-events-none",
  ].join(" "),
  /** Icon glyph host. */
  icon: [
    "relative z-[1] inline-flex items-center justify-center",
    "transition-[color] duration-short4 ease-emphasized",
  ].join(" "),
  /** Badge anchor — positions a badge over the icon top-right corner. */
  badge: [
    "absolute z-[2]",
    "translate-x-1/2 -translate-y-1/2",
    "right-0 top-0",
    "pointer-events-none",
  ].join(" "),
  /** Label slot — label-m typography, color via state map. */
  label: [
    "relative z-[1] mt-1",
    "truncate max-w-full",
    "transition-[color,opacity,height] duration-short4 ease-emphasized",
  ].join(" "),
  /** Focus ring — painted on the indicator footprint. */
  focusRing: [
    "absolute left-1/2 top-1/2",
    "rounded-shape-full",
    "ring-2 ring-primary ring-offset-0",
    "pointer-events-none",
  ].join(" "),
} as const;

type VariantBlock = {
  /** Resting host fill. */
  rest: string;
  /** Elevation when `elevated` is true. */
  elevation: string;
  /** Whether to render the top divider. */
  showDivider: boolean;
};

/**
 * Variant matrix. M3 default uses `surface-container`; the tonal /
 * outlined / elevated treatments override the host fill (and elevated
 * also sets a default elevation-2).
 */
export const variantClasses: Record<BottomNavigationVariant, VariantBlock> = {
  filled: {
    rest: "bg-surface-container text-on-surface-variant",
    elevation: "shadow-elevation-2",
    showDivider: false,
  },
  tonal: {
    rest: "bg-secondary-container text-on-secondary-container",
    elevation: "shadow-elevation-2",
    showDivider: false,
  },
  outlined: {
    rest: "bg-surface text-on-surface-variant",
    elevation: "shadow-elevation-2",
    showDivider: true,
  },
  elevated: {
    rest: "bg-surface-container-low text-on-surface-variant",
    elevation: "shadow-elevation-2",
    showDivider: false,
  },
};

type SizeBlock = {
  /** Bar min-height in px. */
  height: number;
  /** Active indicator width × height (px). */
  indicator: { w: number; h: number };
  /** Icon size class. */
  iconSize: string;
  /** Icon container box (matches indicator height for hit target). */
  iconBox: number;
  /** Label typography role. */
  labelType: string;
  /** Vertical padding for the item column. */
  itemPad: string;
};

export const sizeClasses: Record<BottomNavigationSize, SizeBlock> = {
  sm: {
    height: 64,
    indicator: { w: 56, h: 24 },
    iconSize: "h-5 w-5",
    iconBox: 28,
    labelType: "text-label-s",
    itemPad: "py-2",
  },
  md: {
    height: 80,
    indicator: { w: 64, h: 32 },
    iconSize: "h-6 w-6",
    iconBox: 36,
    labelType: "text-label-m",
    itemPad: "py-3",
  },
  lg: {
    height: 96,
    indicator: { w: 72, h: 40 },
    iconSize: "h-7 w-7",
    iconBox: 44,
    labelType: "text-label-l",
    itemPad: "py-4",
  },
};

/** Shape token map — drives the host border-radius. */
export const shapeClasses: Record<BottomNavigationShape, string> = {
  none: "rounded-shape-none",
  xs: "rounded-shape-xs",
  sm: "rounded-shape-sm",
  md: "rounded-shape-md",
  lg: "rounded-shape-lg",
  xl: "rounded-shape-xl",
  full: "rounded-shape-full",
};

/**
 * Per-state icon/label color tokens. Selected destinations paint the
 * icon `on-secondary-container` (sits inside the indicator pill) and
 * the label `on-surface`; rest state uses `on-surface-variant`.
 */
export const stateColors = {
  iconRest: "text-on-surface-variant",
  iconSelected: "text-on-secondary-container",
  labelRest: "text-on-surface-variant",
  labelSelected: "text-on-surface font-medium",
} as const;
