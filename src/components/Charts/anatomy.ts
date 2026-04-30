import type {
  ChartsSeriesColor,
  ChartsShape,
  ChartsSize,
  ChartsVariant,
} from "./types";

/**
 * Charts anatomy + token bindings.
 *
 * MUI X-Charts has no M3 Expressive component, so we re-skin the
 * surface chrome with M3 tokens:
 *
 *   - card host paints surface roles per variant
 *   - data series paint primary / secondary / tertiary / error
 *   - axis + grid paint `outline-variant`
 *   - title uses title-l/m/s per density
 *   - legend chips paint the M3 chip recipe
 *   - container transitions ride medium2 (300ms) on the emphasized
 *     easing — same envelope as Box / Breadcrumbs
 */
export const anatomy = {
  /** Card host. Owns variant + shape + elevation. */
  root: [
    "relative isolate inline-flex w-full max-w-full flex-col",
    "transition-[box-shadow,background-color,border-color,color]",
    "duration-medium2 ease-emphasized",
  ].join(" "),
  /** Disabled wash. */
  rootDisabled:
    "opacity-[0.38] cursor-not-allowed pointer-events-none",
  /** Header row (title + icons). */
  header: [
    "flex items-center gap-2",
  ].join(" "),
  /** Title text element. */
  title: [
    "min-w-0 flex-1 truncate text-on-surface",
  ].join(" "),
  /** Header icon slot. */
  icon: [
    "inline-flex shrink-0 items-center justify-center text-on-surface-variant",
  ].join(" "),
  /** Plot container. Holds the SVG. */
  plot: [
    "relative isolate w-full",
  ].join(" "),
  /** SVG element. */
  svg: [
    "block h-full w-full overflow-visible",
  ].join(" "),
  /** Loading skeleton overlay. */
  loading: [
    "absolute inset-0 rounded-shape-md",
    "bg-surface-container-high",
    "animate-pulse",
  ].join(" "),
  /** Empty state container. */
  empty: [
    "flex h-full w-full items-center justify-center",
    "text-on-surface-variant text-body-m",
  ].join(" "),
  /** Legend row. */
  legend: [
    "flex flex-wrap items-center",
  ].join(" "),
  /** Single legend chip. */
  legendItem: [
    "inline-flex items-center gap-1.5",
    "rounded-shape-full bg-surface-container-low",
    "border border-outline-variant",
    "text-on-surface text-label-m",
    "px-2 py-1",
  ].join(" "),
  /** Legend dot — paints the series color. */
  legendDot: [
    "h-2 w-2 shrink-0 rounded-shape-full",
  ].join(" "),
} as const;

type VariantBlock = {
  rest: string;
  border: string;
  elevation: string;
};

/**
 * Variant matrix for the card host. The default `filled` variant
 * paints a `surface-container-highest` card so the chart pops from a
 * surface background; `text` keeps the host transparent so the plot
 * can sit inline.
 */
export const variantClasses: Record<ChartsVariant, VariantBlock> = {
  text: {
    rest: "bg-transparent text-on-surface",
    border: "border border-transparent",
    elevation: "shadow-elevation-0",
  },
  filled: {
    rest: "bg-surface-container-highest text-on-surface",
    border: "border border-transparent",
    elevation: "shadow-elevation-0",
  },
  tonal: {
    rest: "bg-secondary-container text-on-secondary-container",
    border: "border border-transparent",
    elevation: "shadow-elevation-0",
  },
  outlined: {
    rest: "bg-transparent text-on-surface",
    border: "border border-outline-variant",
    elevation: "shadow-elevation-0",
  },
  elevated: {
    rest: "bg-surface-container-low text-on-surface",
    border: "border border-transparent",
    elevation: "shadow-elevation-1",
  },
};

type SizeBlock = {
  /** Plot height in px. */
  plotHeight: number;
  /** Card padding utility. */
  pad: string;
  /** Header bottom margin utility. */
  headerGap: string;
  /** Title type role. */
  titleType: string;
  /** Icon glyph size. */
  iconSize: string;
  /** Legend gap utility. */
  legendGap: string;
  /** Axis tick / label font size in px (used inside the SVG). */
  axisFontSize: number;
};

/** Density scale — drives plot height + title type. */
export const sizeClasses: Record<ChartsSize, SizeBlock> = {
  sm: {
    plotHeight: 160,
    pad: "p-3",
    headerGap: "mb-2",
    titleType: "text-title-s",
    iconSize: "h-4 w-4",
    legendGap: "gap-1.5 mt-2",
    axisFontSize: 10,
  },
  md: {
    plotHeight: 220,
    pad: "p-4",
    headerGap: "mb-3",
    titleType: "text-title-m",
    iconSize: "h-[18px] w-[18px]",
    legendGap: "gap-2 mt-3",
    axisFontSize: 11,
  },
  lg: {
    plotHeight: 300,
    pad: "p-6",
    headerGap: "mb-4",
    titleType: "text-title-l",
    iconSize: "h-5 w-5",
    legendGap: "gap-2 mt-4",
    axisFontSize: 12,
  },
};

/** Shape token map — drives the card host border-radius. */
export const shapeClasses: Record<ChartsShape, string> = {
  none: "rounded-shape-none",
  xs: "rounded-shape-xs",
  sm: "rounded-shape-sm",
  md: "rounded-shape-md",
  lg: "rounded-shape-lg",
  xl: "rounded-shape-xl",
  full: "rounded-shape-full",
};

/**
 * Series color matrix. Maps an M3 color role to:
 *   - the CSS `var()` lookup used as the SVG fill / stroke
 *   - the matching Tailwind background utility used for the legend dot
 *   - a longhand var lookup for use inside motion/react inline styles
 *
 * Using `var()` directly (rather than Tailwind utilities) inside SVG
 * `fill` / `stroke` is necessary because Tailwind v3 cannot scan
 * computed `fill-${role}` attributes.
 */
export const seriesColors: Record<
  ChartsSeriesColor,
  { fill: string; bg: string; cssVar: string }
> = {
  primary: {
    fill: "var(--md-sys-color-primary)",
    bg: "bg-primary",
    cssVar: "--md-sys-color-primary",
  },
  secondary: {
    fill: "var(--md-sys-color-secondary)",
    bg: "bg-secondary",
    cssVar: "--md-sys-color-secondary",
  },
  tertiary: {
    fill: "var(--md-sys-color-tertiary)",
    bg: "bg-tertiary",
    cssVar: "--md-sys-color-tertiary",
  },
  error: {
    fill: "var(--md-sys-color-error)",
    bg: "bg-error",
    cssVar: "--md-sys-color-error",
  },
};

/** Axis + grid stroke color (bound to outline-variant). */
export const AXIS_STROKE = "var(--md-sys-color-outline-variant)";
/** Axis tick label color. */
export const AXIS_TEXT = "var(--md-sys-color-on-surface-variant)";
