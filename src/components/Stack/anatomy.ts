import type {
  StackAlign,
  StackDirection,
  StackElevation,
  StackJustify,
  StackShape,
  StackSize,
  StackSpacing,
  StackVariant,
  StackWrap,
} from "./types";

/**
 * Stack anatomy + token bindings.
 *
 * M3 Expressive does not specify a "Stack" component — Stack is the
 * MUI layout primitive that arranges children along a single axis
 * with a configurable gap and optional dividers. The matrix below
 * re-skins it with the M3 surface / shape / elevation / motion
 * scales so the layout shell stays a token-aware <div>.
 *
 * Spec references:
 *   - surface roles    https://m3.material.io/styles/color/the-color-system/color-roles
 *   - elevation tokens https://m3.material.io/styles/elevation/tokens
 *   - shape scale      https://m3.material.io/styles/shape/shape-scale-tokens
 *   - state layers     https://m3.material.io/foundations/interaction/states
 */
export const anatomy = {
  /** Outer flex container. */
  root: [
    "relative isolate text-left",
    "transition-[box-shadow,background-color,border-color,color]",
    "duration-medium2 ease-emphasized",
  ].join(" "),
  /** Interactive affordance: focus ring + pointer cursor. */
  rootInteractive: [
    "cursor-pointer outline-none",
    "focus-visible:ring-2 focus-visible:ring-primary",
    "focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
  ].join(" "),
  /** Disabled wash. */
  rootDisabled: "opacity-[0.38] cursor-not-allowed pointer-events-none",
  /** State layer overlay — paints the M3 hover/focus/pressed wash. */
  stateLayer: [
    "pointer-events-none absolute inset-0 z-0 rounded-[inherit]",
    "transition-opacity duration-short4 ease-standard",
  ].join(" "),
  /**
   * Header row — leading icon + label + trailing icon. Sits above
   * the stacked children regardless of stacking axis.
   */
  header: [
    "relative z-[1] flex w-full items-center gap-3",
    "text-title-m font-medium leading-snug",
  ].join(" "),
  /** 24dp icon slot. */
  icon: [
    "inline-flex h-6 w-6 shrink-0 items-center justify-center",
    "text-on-surface-variant",
  ].join(" "),
  /** Inner flex track that holds the children + dividers. */
  track: "relative z-[1] flex min-w-0",
  /**
   * Divider wrapper. MUI parity: stretches across the cross-axis so
   * a custom divider node (Divider component, hr, span, …) renders
   * full-width / full-height.
   */
  divider:
    "relative z-[1] flex shrink-0 self-stretch items-center justify-center",
} as const;

type ColorBlock = {
  /** Resting fill + foreground. */
  rest: string;
  /** Selected fill + foreground (M3 secondary-container). */
  selected: string;
  /** Error fill + foreground (M3 error-container). */
  error: string;
  /** Optional border. */
  border: string;
  /** Default elevation token for this variant. */
  elevation: string;
  /** State-layer paint color. */
  stateLayer: string;
};

/**
 * Variant matrix. The `text` default keeps the host transparent so a
 * Stack acts as a pure layout container; the other variants paint M3
 * surface roles for tinted layout regions.
 */
export const variantClasses: Record<StackVariant, ColorBlock> = {
  text: {
    rest: "bg-transparent text-on-surface",
    selected: "bg-secondary-container text-on-secondary-container",
    error: "bg-error-container text-on-error-container",
    border: "border border-transparent",
    elevation: "shadow-elevation-0",
    stateLayer: "bg-on-surface",
  },
  filled: {
    rest: "bg-surface-container-highest text-on-surface",
    selected: "bg-secondary-container text-on-secondary-container",
    error: "bg-error-container text-on-error-container",
    border: "border border-transparent",
    elevation: "shadow-elevation-0",
    stateLayer: "bg-on-surface",
  },
  tonal: {
    rest: "bg-secondary-container text-on-secondary-container",
    selected: "bg-secondary-container text-on-secondary-container",
    error: "bg-error-container text-on-error-container",
    border: "border border-transparent",
    elevation: "shadow-elevation-0",
    stateLayer: "bg-on-secondary-container",
  },
  outlined: {
    rest: "bg-transparent text-on-surface",
    selected: "bg-secondary-container text-on-secondary-container",
    error: "bg-error-container text-on-error-container",
    border: "border border-outline-variant",
    elevation: "shadow-elevation-0",
    stateLayer: "bg-on-surface",
  },
  elevated: {
    rest: "bg-surface-container-low text-on-surface",
    selected: "bg-secondary-container text-on-secondary-container",
    error: "bg-error-container text-on-error-container",
    border: "border border-transparent",
    elevation: "shadow-elevation-1",
    stateLayer: "bg-on-surface",
  },
};

type SizeBlock = {
  /** Default gap between stacked children. */
  gap: StackSpacing;
  /** Outer padding. */
  pad: string;
  /** Min cross-axis size token. */
  minCross: string;
};

/** Density scale. M3 default is `md` (16dp padding, 16dp gap, 48dp min-cross). */
export const sizeClasses: Record<StackSize, SizeBlock> = {
  sm: { gap: "sm", pad: "p-2", minCross: "min-h-[32px] min-w-[32px]" },
  md: { gap: "md", pad: "p-4", minCross: "min-h-[48px] min-w-[48px]" },
  lg: { gap: "lg", pad: "p-6", minCross: "min-h-[64px] min-w-[64px]" },
};

/** Shape token map. Default `none` (Stack is a layout primitive). */
export const shapeClasses: Record<StackShape, string> = {
  none: "rounded-shape-none",
  xs: "rounded-shape-xs",
  sm: "rounded-shape-sm",
  md: "rounded-shape-md",
  lg: "rounded-shape-lg",
  xl: "rounded-shape-xl",
  full: "rounded-shape-full",
};

/**
 * M3 Expressive shape morph. Interactive Stacks morph one shape step
 * up while hovered/focused/pressed (capped at `xl`). `none` and
 * `full` keep their resting shape.
 */
export const morphTarget: Record<StackShape, string> = {
  none: "rounded-shape-none",
  xs: "rounded-shape-sm",
  sm: "rounded-shape-md",
  md: "rounded-shape-lg",
  lg: "rounded-shape-xl",
  xl: "rounded-shape-xl",
  full: "rounded-shape-full",
};

/** M3 elevation 0..5 utilities. */
export const elevationClasses: Record<StackElevation, string> = {
  0: "shadow-elevation-0",
  1: "shadow-elevation-1",
  2: "shadow-elevation-2",
  3: "shadow-elevation-3",
  4: "shadow-elevation-4",
  5: "shadow-elevation-5",
};

/** Stacking axis utilities. */
export const directionClasses: Record<StackDirection, string> = {
  column: "flex-col",
  row: "flex-row",
  "column-reverse": "flex-col-reverse",
  "row-reverse": "flex-row-reverse",
};

/** Gap utilities. */
export const spacingClasses: Record<StackSpacing, string> = {
  none: "gap-0",
  xs: "gap-1",
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
  xl: "gap-8",
};

/** Spacing token → pixel size used in data-* attributes for tests. */
export const spacingPixels: Record<StackSpacing, number> = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

/** Cross-axis alignment (Tailwind `items-*`). */
export const alignClasses: Record<StackAlign, string> = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
  baseline: "items-baseline",
};

/** Main-axis distribution (Tailwind `justify-*`). */
export const justifyClasses: Record<StackJustify, string> = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
  around: "justify-around",
  evenly: "justify-evenly",
};

/** Flex-wrap utilities. */
export const wrapClasses: Record<StackWrap, string> = {
  nowrap: "flex-nowrap",
  wrap: "flex-wrap",
  "wrap-reverse": "flex-wrap-reverse",
};

/**
 * Stack direction → ARIA orientation mapping. MUI Stack does not set
 * `aria-orientation`; we set it on the inner track when a divider is
 * supplied so screen readers can announce a horizontal vs vertical
 * group.
 */
export const orientationFor: Record<StackDirection, "horizontal" | "vertical"> = {
  column: "vertical",
  row: "horizontal",
  "column-reverse": "vertical",
  "row-reverse": "horizontal",
};
