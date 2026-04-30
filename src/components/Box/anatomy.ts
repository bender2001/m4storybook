import type {
  BoxAlign,
  BoxDirection,
  BoxDisplay,
  BoxElevation,
  BoxJustify,
  BoxShape,
  BoxSize,
  BoxVariant,
} from "./types";

/**
 * Box anatomy + token bindings.
 *
 * M3 Expressive does not specify a "Box" component — Box is a MUI
 * layout primitive. The matrix below re-skins it with M3 tokens
 * (surface roles, shape scale, elevation, motion easings), so a Box
 * acts as a token-aware <div> the rest of the library can compose.
 *
 * Spec references:
 *   - surface roles    https://m3.material.io/styles/color/the-color-system/color-roles
 *   - elevation tokens https://m3.material.io/styles/elevation/tokens
 *   - shape scale      https://m3.material.io/styles/shape/shape-scale-tokens
 *   - state layers     https://m3.material.io/foundations/interaction/states
 */
export const anatomy = {
  /**
   * Outer container. Layout defaults are applied via `display`/
   * `direction`/`align`/`justify` props rather than baked in here so
   * the Box stays a generic layout primitive.
   */
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
  rootDisabled:
    "opacity-[0.38] cursor-not-allowed pointer-events-none",
  /** State layer overlay — paints the M3 hover/focus/pressed wash. */
  stateLayer: [
    "pointer-events-none absolute inset-0 z-0 rounded-[inherit]",
    "transition-opacity duration-short4 ease-standard",
  ].join(" "),
  /** Header row — leading icon + label + trailing icon. */
  header: [
    "relative z-[1] flex w-full items-center gap-3",
    "text-title-m font-medium leading-snug",
  ].join(" "),
  /** 24dp icon slot. */
  icon: [
    "inline-flex h-6 w-6 shrink-0 items-center justify-center",
    "text-on-surface-variant",
  ].join(" "),
  /** Body slot — children render here, below the optional header. */
  body: "relative z-[1] w-full",
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
 * Variant matrix. The `text` default is a transparent host so a Box
 * can act as a pure layout container; the other variants paint M3
 * surface roles for tinted layout regions.
 */
export const variantClasses: Record<BoxVariant, ColorBlock> = {
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
  /** Outer padding. */
  pad: string;
  /** Gap between header items + body. */
  gap: string;
  /** Min-height token. */
  minH: string;
};

/** Density scale. M3 default is `md` (16dp padding, 48dp min-height). */
export const sizeClasses: Record<BoxSize, SizeBlock> = {
  sm: { pad: "p-2", gap: "gap-2", minH: "min-h-[32px]" },
  md: { pad: "p-4", gap: "gap-3", minH: "min-h-[48px]" },
  lg: { pad: "p-6", gap: "gap-4", minH: "min-h-[64px]" },
};

/** Shape token map. Default `none` (Box is a layout primitive). */
export const shapeClasses: Record<BoxShape, string> = {
  none: "rounded-shape-none",
  xs: "rounded-shape-xs",
  sm: "rounded-shape-sm",
  md: "rounded-shape-md",
  lg: "rounded-shape-lg",
  xl: "rounded-shape-xl",
  full: "rounded-shape-full",
};

/**
 * M3 Expressive shape morph. Interactive Boxes morph one shape step
 * up while hovered/focused/pressed (capped at `xl`). `none` and
 * `full` keep their resting shape.
 */
export const morphTarget: Record<BoxShape, string> = {
  none: "rounded-shape-none",
  xs: "rounded-shape-sm",
  sm: "rounded-shape-md",
  md: "rounded-shape-lg",
  lg: "rounded-shape-xl",
  xl: "rounded-shape-xl",
  full: "rounded-shape-full",
};

/** M3 elevation 0..5 utilities. */
export const elevationClasses: Record<BoxElevation, string> = {
  0: "shadow-elevation-0",
  1: "shadow-elevation-1",
  2: "shadow-elevation-2",
  3: "shadow-elevation-3",
  4: "shadow-elevation-4",
  5: "shadow-elevation-5",
};

/** Layout display modes. */
export const displayClasses: Record<BoxDisplay, string> = {
  block: "block",
  inline: "inline",
  "inline-block": "inline-block",
  flex: "flex",
  "inline-flex": "inline-flex",
  grid: "grid",
  "inline-grid": "inline-grid",
};

/** Flex / grid main-axis direction. */
export const directionClasses: Record<BoxDirection, string> = {
  row: "flex-row",
  column: "flex-col",
  "row-reverse": "flex-row-reverse",
  "column-reverse": "flex-col-reverse",
};

/** Cross-axis alignment (Tailwind `items-*`). */
export const alignClasses: Record<BoxAlign, string> = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
  baseline: "items-baseline",
};

/** Main-axis distribution (Tailwind `justify-*`). */
export const justifyClasses: Record<BoxJustify, string> = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
  around: "justify-around",
  evenly: "justify-evenly",
};
