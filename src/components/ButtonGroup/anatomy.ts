import type {
  ButtonGroupSize,
  ButtonGroupVariant,
} from "./types";

/**
 * Button Group anatomy slot → Tailwind class string. M3 Expressive
 * does not specify Button Group as a separate component, so we follow
 * the standard M3 Button Group spec: a row of "connected" buttons
 * with shared borders, full outer radius (pill), and a thin inner gap
 * between adjacent items. The selected variant uses the secondary
 * container role for tonal emphasis.
 *
 * https://m3.material.io/components/button-groups/specs
 */
export const anatomy = {
  /** The group container: inline-flex with role="group". */
  root: [
    "relative inline-flex isolate select-none",
    "rounded-shape-full",
  ].join(" "),
  /** Each button slot — the gap between segments is the inner divider. */
  segment: [
    "relative inline-flex items-center justify-center",
    "outline-none cursor-pointer font-medium",
    "transition-[box-shadow,background-color,border-color,color]",
    "duration-medium2 ease-emphasized",
    "focus-visible:z-[2]",
    "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
    "focus-visible:ring-offset-surface",
    "disabled:cursor-not-allowed",
  ].join(" "),
  /** Persistent state-layer over each segment. */
  stateLayer: [
    "pointer-events-none absolute inset-0 rounded-[inherit]",
    "transition-opacity duration-short4 ease-standard",
  ].join(" "),
  label: "relative z-[1] inline-flex items-center",
  icon: "relative z-[1] inline-flex items-center",
} as const;

/** Container backgrounds per variant. */
export const variantContainerClasses: Record<ButtonGroupVariant, string> = {
  filled: "bg-transparent",
  tonal: "bg-transparent",
  outlined: "bg-transparent",
  text: "bg-transparent",
  elevated: "bg-transparent",
};

/**
 * Per-variant per-state segment classes. The `selected` row uses the
 * tonal/secondary-container role for visual emphasis, matching M3's
 * segmented-button-active treatment.
 */
export const segmentVariantClasses: Record<
  ButtonGroupVariant,
  { rest: string; selected: string; stateLayer: string }
> = {
  filled: {
    rest: [
      "bg-primary text-on-primary",
      "shadow-elevation-0 hover:shadow-elevation-1 active:shadow-elevation-0",
      "disabled:bg-on-surface/[0.12] disabled:text-on-surface/[0.38] disabled:shadow-elevation-0",
    ].join(" "),
    selected: [
      "bg-secondary text-on-secondary",
      "shadow-elevation-0 hover:shadow-elevation-1",
    ].join(" "),
    stateLayer: "bg-on-primary",
  },
  tonal: {
    rest: [
      "bg-secondary-container text-on-secondary-container",
      "shadow-elevation-0 hover:shadow-elevation-1 active:shadow-elevation-0",
      "disabled:bg-on-surface/[0.12] disabled:text-on-surface/[0.38]",
    ].join(" "),
    selected: [
      "bg-secondary text-on-secondary",
      "shadow-elevation-0 hover:shadow-elevation-1",
    ].join(" "),
    stateLayer: "bg-on-secondary-container",
  },
  outlined: {
    rest: [
      "bg-transparent text-on-surface border border-outline",
      "hover:border-primary",
      "disabled:text-on-surface/[0.38] disabled:border-on-surface/[0.12]",
    ].join(" "),
    selected: [
      "bg-secondary-container text-on-secondary-container border border-outline",
    ].join(" "),
    stateLayer: "bg-on-surface",
  },
  text: {
    rest: [
      "bg-transparent text-primary",
      "disabled:text-on-surface/[0.38]",
    ].join(" "),
    selected: ["bg-secondary-container text-on-secondary-container"].join(" "),
    stateLayer: "bg-primary",
  },
  elevated: {
    rest: [
      "bg-surface-container-low text-primary",
      "shadow-elevation-1 hover:shadow-elevation-2 active:shadow-elevation-1",
      "disabled:bg-on-surface/[0.12] disabled:text-on-surface/[0.38] disabled:shadow-elevation-0",
    ].join(" "),
    selected: [
      "bg-secondary-container text-on-secondary-container",
      "shadow-elevation-1",
    ].join(" "),
    stateLayer: "bg-primary",
  },
};

/**
 * Segment height + padding. M3 Button Group ships at the same heights
 * as the standalone Button: sm = 32dp, md = 40dp, lg = 56dp.
 */
export const segmentSizeClasses: Record<ButtonGroupSize, string> = {
  sm: "h-8 px-3 text-label-m gap-1.5",
  md: "h-10 px-6 text-label-l gap-2",
  lg: "h-14 px-8 text-title-m gap-2.5",
};

/**
 * The connected look: buttons share a 2px gap between segments, the
 * outer corners pick up the full pill radius, and inner corners are
 * squared off so the adjoining edges meet flush.
 */
export const segmentRadiusClasses = {
  horizontal: {
    only: "rounded-shape-full",
    first: "rounded-l-shape-full rounded-r-shape-xs",
    middle: "rounded-shape-xs",
    last: "rounded-r-shape-full rounded-l-shape-xs",
  },
  vertical: {
    only: "rounded-shape-full",
    first: "rounded-t-shape-full rounded-b-shape-xs",
    middle: "rounded-shape-xs",
    last: "rounded-b-shape-full rounded-t-shape-xs",
  },
} as const;

/** Inner spacing between segments — 2dp matches the M3 connected style. */
export const orientationGap: Record<"horizontal" | "vertical", string> = {
  horizontal: "flex-row gap-0.5",
  vertical: "flex-col gap-0.5",
};
