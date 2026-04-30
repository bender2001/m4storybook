import type {
  GridAlign,
  GridColumns,
  GridElevation,
  GridFlow,
  GridJustify,
  GridShape,
  GridSize,
  GridSpacing,
  GridSpan,
  GridStart,
  GridVariant,
} from "./types";

/**
 * Grid anatomy + token bindings.
 *
 * M3 Expressive does not specify a "Grid" component — Grid is the MUI
 * 12-column layout primitive. The matrix below re-skins it with the M3
 * surface / shape / elevation / motion scales so the layout shell stays
 * a token-aware <div>.
 *
 * Spec references:
 *   - surface roles    https://m3.material.io/styles/color/the-color-system/color-roles
 *   - elevation tokens https://m3.material.io/styles/elevation/tokens
 *   - shape scale      https://m3.material.io/styles/shape/shape-scale-tokens
 *   - state layers     https://m3.material.io/foundations/interaction/states
 */
export const anatomy = {
  /** Outer grid container. */
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
   * Header row — leading icon + label + trailing icon. Spans every
   * column so the header always reads above the grid items.
   */
  header: [
    "relative z-[1] col-span-full flex w-full items-center gap-3",
    "text-title-m font-medium leading-snug",
  ].join(" "),
  /** 24dp icon slot. */
  icon: [
    "inline-flex h-6 w-6 shrink-0 items-center justify-center",
    "text-on-surface-variant",
  ].join(" "),
  /** Cell wrapper — the GridItem element. */
  cell: [
    "relative isolate min-w-0",
    "transition-[box-shadow,background-color,border-color,color]",
    "duration-short4 ease-standard",
  ].join(" "),
  /** Disabled cell wash. */
  cellDisabled: "opacity-[0.38] pointer-events-none",
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
 * Grid acts as a pure layout container; the other variants paint M3
 * surface roles for tinted layout regions.
 */
export const variantClasses: Record<GridVariant, ColorBlock> = {
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
  /** Default gap. Drives both row + column gap when neither override is set. */
  gap: GridSpacing;
  /** Outer padding. */
  pad: string;
  /** Min-row height token. */
  minRow: string;
};

/** Density scale. M3 default is `md` (16dp gap, 16dp padding, 48dp rows). */
export const sizeClasses: Record<GridSize, SizeBlock> = {
  sm: { gap: "sm", pad: "p-2", minRow: "auto-rows-[minmax(32px,auto)]" },
  md: { gap: "md", pad: "p-4", minRow: "auto-rows-[minmax(48px,auto)]" },
  lg: { gap: "lg", pad: "p-6", minRow: "auto-rows-[minmax(64px,auto)]" },
};

/** Shape token map. Default `none` (Grid is a layout primitive). */
export const shapeClasses: Record<GridShape, string> = {
  none: "rounded-shape-none",
  xs: "rounded-shape-xs",
  sm: "rounded-shape-sm",
  md: "rounded-shape-md",
  lg: "rounded-shape-lg",
  xl: "rounded-shape-xl",
  full: "rounded-shape-full",
};

/**
 * M3 Expressive shape morph. Interactive Grids morph one shape step
 * up while hovered/focused/pressed (capped at `xl`). `none` and
 * `full` keep their resting shape.
 */
export const morphTarget: Record<GridShape, string> = {
  none: "rounded-shape-none",
  xs: "rounded-shape-sm",
  sm: "rounded-shape-md",
  md: "rounded-shape-lg",
  lg: "rounded-shape-xl",
  xl: "rounded-shape-xl",
  full: "rounded-shape-full",
};

/** M3 elevation 0..5 utilities. */
export const elevationClasses: Record<GridElevation, string> = {
  0: "shadow-elevation-0",
  1: "shadow-elevation-1",
  2: "shadow-elevation-2",
  3: "shadow-elevation-3",
  4: "shadow-elevation-4",
  5: "shadow-elevation-5",
};

/**
 * Track-count map. Tailwind's static-class scanner can't see template
 * literals (recorded in feedback memory), so every column count is
 * spelled out as a literal.
 */
export const columnsClasses: Record<GridColumns, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-6",
  7: "grid-cols-7",
  8: "grid-cols-8",
  9: "grid-cols-9",
  10: "grid-cols-10",
  11: "grid-cols-11",
  12: "grid-cols-12",
};

/** Gap utilities (applies to both axes). */
export const gapClasses: Record<GridSpacing, string> = {
  none: "gap-0",
  xs: "gap-1",
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
  xl: "gap-8",
};

/** Row-only gap utilities. */
export const rowGapClasses: Record<GridSpacing, string> = {
  none: "gap-y-0",
  xs: "gap-y-1",
  sm: "gap-y-2",
  md: "gap-y-4",
  lg: "gap-y-6",
  xl: "gap-y-8",
};

/** Column-only gap utilities. */
export const columnGapClasses: Record<GridSpacing, string> = {
  none: "gap-x-0",
  xs: "gap-x-1",
  sm: "gap-x-2",
  md: "gap-x-4",
  lg: "gap-x-6",
  xl: "gap-x-8",
};

/** Spacing token → pixel size used in data-* attributes for tests. */
export const spacingPixels: Record<GridSpacing, number> = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

/** Auto-flow direction. */
export const flowClasses: Record<GridFlow, string> = {
  row: "grid-flow-row",
  column: "grid-flow-col",
  "row-dense": "grid-flow-row-dense",
  "column-dense": "grid-flow-col-dense",
};

/** Cross-axis alignment (Tailwind `items-*`). */
export const alignClasses: Record<GridAlign, string> = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
  baseline: "items-baseline",
};

/** Main-axis distribution (Tailwind `justify-*`). */
export const justifyClasses: Record<GridJustify, string> = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
  around: "justify-around",
  evenly: "justify-evenly",
};

/**
 * Resolve a `GridSpan` to a CSS `grid-column` / `grid-row` value.
 * Inline styles let us cover spans up to 12 without needing Tailwind
 * to ship `row-span-7..12` (its default theme stops at 6) and avoid
 * the static-class-scan trap from feedback memory.
 */
export function spanToCss(span: GridSpan): string {
  if (span === "auto") return "auto";
  if (span === "full") return "1 / -1";
  return `span ${span} / span ${span}`;
}

/** Resolve a `GridStart` to a CSS `grid-column-start` / `grid-row-start`. */
export function startToCss(start: GridStart): string {
  if (start === "auto") return "auto";
  return String(start);
}
