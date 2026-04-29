import type {
  AccordionShape,
  AccordionSize,
  AccordionVariant,
} from "./types";

/**
 * Accordion anatomy + token bindings.
 *
 * M3 Expressive spec: https://m3.material.io/components/expansion-panels
 *  - container shape : 12dp (medium) — `shape-md`
 *  - header role     : title-m (16px / 24 line / weight 500)
 *  - subhead role    : body-m / on-surface-variant
 *  - panel content   : body-m / on-surface-variant
 *  - header heights  : 48 / 56 / 72 px for sm / md / lg
 *  - container colors:
 *      elevated  -> surface-container-low + elevation-1 (resting)
 *                                          + elevation-2 (hover)
 *      filled    -> surface-container-highest, no elevation
 *      outlined  -> surface + 1dp outline-variant border
 *  - state-layer opacities: hover 0.08, focus 0.10, pressed 0.10
 *  - chevron motion  : 180deg rotation, emphasized easing /
 *                      medium2 (300ms) duration
 *  - panel motion    : height auto + opacity, emphasized / medium2
 */
export const anatomy = {
  /** Outer container — stack of accordion items. */
  root: "flex flex-col w-full",
  /** Single accordion item — the surface that owns shape + variant. */
  item: [
    "relative isolate flex flex-col w-full overflow-hidden",
    "transition-[box-shadow,background-color,border-color,color]",
    "duration-medium2 ease-emphasized",
  ].join(" "),
  /** Header button row. */
  header: [
    "relative z-[1] flex w-full items-center text-left",
    "outline-none cursor-pointer",
    "transition-colors duration-medium2 ease-emphasized",
    "focus-visible:ring-2 focus-visible:ring-primary",
    "focus-visible:ring-inset",
    "bg-transparent",
  ].join(" "),
  headerDisabled:
    "opacity-[0.38] cursor-not-allowed pointer-events-none",
  /** State-layer wash — paints the M3 hover/focus/pressed overlay. */
  stateLayer: [
    "pointer-events-none absolute inset-0 z-0 rounded-[inherit]",
    "transition-opacity duration-short4 ease-standard",
  ].join(" "),
  /** Leading + trailing icon slots. */
  leading:
    "relative z-[1] flex items-center justify-center text-on-surface-variant shrink-0",
  trailing:
    "relative z-[1] ml-auto flex items-center justify-center text-on-surface-variant shrink-0",
  /** Wraps title + subhead so they stack vertically. */
  text: "relative z-[1] flex min-w-0 flex-1 flex-col",
  title: "text-title-m text-on-surface truncate",
  subhead: "text-body-m text-on-surface-variant truncate",
  /** Collapsible panel + interior content padding. */
  panel: "relative z-[1] overflow-hidden",
  panelContent: "text-body-m text-on-surface-variant",
} as const;

/**
 * Variant matrix. Mirrors Card so the surface treatment stays
 * coherent across M3 surfaces (Paper / Card / Accordion).
 */
export const variantClasses: Record<
  AccordionVariant,
  {
    /** Resting fill + on-color (text). */
    rest: string;
    /** Hover-only utilities — elevated lifts to elevation-2. */
    hover: string;
    /** Resting box-shadow (only the elevated variant emits one). */
    elevation: string;
    /** State-layer color (paints through `bg`). */
    stateLayer: string;
  }
> = {
  elevated: {
    rest: "bg-surface-container-low text-on-surface",
    hover: "hover:shadow-elevation-2",
    elevation: "shadow-elevation-1",
    stateLayer: "bg-on-surface",
  },
  filled: {
    rest: "bg-surface-container-highest text-on-surface",
    hover: "",
    elevation: "",
    stateLayer: "bg-on-surface",
  },
  outlined: {
    rest: "bg-surface text-on-surface border border-outline-variant",
    hover: "",
    elevation: "",
    stateLayer: "bg-on-surface",
  },
};

/**
 * Density scale. M3 expansion panels expose 48 / 56 / 72 px header
 * heights for sm / md / lg respectively, matched to the M3 list-item
 * density tokens.
 */
export const sizeClasses: Record<
  AccordionSize,
  {
    /** Header gutter — horizontal padding + inter-slot gap. */
    headerPadding: string;
    /** Panel interior padding (already excludes header padding). */
    contentPadding: string;
    /** Min header height (drives the touch-target). */
    height: string;
    /** Icon box size. */
    iconSize: string;
  }
> = {
  sm: {
    headerPadding: "px-3 gap-2",
    contentPadding: "px-3 pb-3 pt-1",
    height: "min-h-[48px]",
    iconSize: "h-5 w-5",
  },
  md: {
    headerPadding: "px-4 gap-3",
    contentPadding: "px-4 pb-4 pt-1",
    height: "min-h-[56px]",
    iconSize: "h-6 w-6",
  },
  lg: {
    headerPadding: "px-6 gap-4",
    contentPadding: "px-6 pb-6 pt-2",
    height: "min-h-[72px]",
    iconSize: "h-7 w-7",
  },
};

/**
 * Shape map. Defaults to `md` (12dp) per the M3 expansion-panel spec.
 */
export const shapeClasses: Record<AccordionShape, string> = {
  none: "rounded-shape-none",
  xs: "rounded-shape-xs",
  sm: "rounded-shape-sm",
  md: "rounded-shape-md",
  lg: "rounded-shape-lg",
  xl: "rounded-shape-xl",
  full: "rounded-shape-full",
};
