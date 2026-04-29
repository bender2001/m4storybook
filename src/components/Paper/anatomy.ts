import type {
  PaperElevation,
  PaperShape,
  PaperSize,
  PaperVariant,
} from "./types";

/**
 * Paper anatomy.  Re-skinned MUI Paper using M3 surface roles so
 * Card / AppBar / Dialog / Menu can compose on top of it without
 * re-implementing the same elevated/filled/tonal/outlined matrix.
 *
 * M3 spec references:
 *   - surface roles      https://m3.material.io/styles/color/the-color-system/color-roles
 *   - elevation tokens   https://m3.material.io/styles/elevation/tokens
 *   - shape tokens       https://m3.material.io/styles/shape/shape-scale-tokens
 *   - state layer        https://m3.material.io/foundations/interaction/states
 */
export const anatomy = {
  root: [
    "relative isolate inline-flex flex-col text-left",
    "transition-[box-shadow,background-color,border-color,color,transform]",
    "duration-medium2 ease-emphasized",
  ].join(" "),
  rootBlock: "block w-full",
  rootInteractive: [
    "cursor-pointer outline-none",
    "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
    "focus-visible:ring-offset-surface",
  ].join(" "),
  rootDisabled: "opacity-[0.38] cursor-not-allowed pointer-events-none",
  /** State layer overlay — paints the M3 hover/focus/pressed wash. */
  stateLayer: [
    "pointer-events-none absolute inset-0 z-0 rounded-[inherit]",
    "transition-opacity duration-short4 ease-standard",
  ].join(" "),
  /** Header row that holds optional leading/trailing icons + label. */
  header: [
    "relative z-[1] flex w-full items-center gap-3",
    "text-title-m font-medium leading-snug",
  ].join(" "),
  icon: [
    "inline-flex h-6 w-6 shrink-0 items-center justify-center",
    "text-on-surface-variant",
  ].join(" "),
  /** Body slot — children render here, below the optional header. */
  body: "relative z-[1] flex w-full flex-col",
} as const;

/**
 * Variant matrix.
 *  - elevated : surface-container-low + elevation-1 (resting), hover
 *               lifts to elevation-2
 *  - filled   : surface-container-highest, no shadow
 *  - tonal    : secondary-container (low-emphasis surface)
 *  - outlined : transparent + 1dp outline-variant border
 */
export const variantClasses: Record<
  PaperVariant,
  {
    rest: string;
    hover: string;
    selected: string;
    stateLayer: string;
  }
> = {
  elevated: {
    rest: "bg-surface-container-low text-on-surface",
    hover: "hover:shadow-elevation-2",
    selected: "bg-secondary-container text-on-secondary-container",
    stateLayer: "bg-on-surface",
  },
  filled: {
    rest: "bg-surface-container-highest text-on-surface",
    hover: "",
    selected: "bg-secondary-container text-on-secondary-container",
    stateLayer: "bg-on-surface",
  },
  tonal: {
    rest: "bg-secondary-container text-on-secondary-container",
    hover: "",
    selected: "bg-secondary-container text-on-secondary-container",
    stateLayer: "bg-on-secondary-container",
  },
  outlined: {
    rest: "bg-transparent text-on-surface border border-outline-variant",
    hover: "",
    selected: "bg-secondary-container text-on-secondary-container",
    stateLayer: "bg-on-surface",
  },
};

/**
 * Density scale. Maps to padding + min-height so a Paper can host an
 * icon row without collapsing to a single text line.
 */
export const sizeClasses: Record<
  PaperSize,
  { padding: string; gap: string; minHeight: string }
> = {
  sm: { padding: "p-2", gap: "gap-2", minHeight: "min-h-[40px]" },
  md: { padding: "p-4", gap: "gap-3", minHeight: "min-h-[64px]" },
  lg: { padding: "p-6", gap: "gap-4", minHeight: "min-h-[88px]" },
};

/**
 * Shape map. Default `md` (12dp) matches the M3 medium-surface
 * recommendation. Interactive papers morph from `md` -> `lg` on
 * hover/focus to communicate the selectable affordance (Expressive
 * shape morphing).
 */
export const shapeClasses: Record<PaperShape, string> = {
  none: "rounded-shape-none",
  xs: "rounded-shape-xs",
  sm: "rounded-shape-sm",
  md: "rounded-shape-md",
  lg: "rounded-shape-lg",
  xl: "rounded-shape-xl",
  full: "rounded-shape-full",
};

/**
 * Hover/focus shape morph target. Bumps the radius up one notch,
 * capped at xl. `none` is a hard square so it stays square.
 */
export const morphTarget: Record<PaperShape, string> = {
  none: "rounded-shape-none",
  xs: "rounded-shape-sm",
  sm: "rounded-shape-md",
  md: "rounded-shape-lg",
  lg: "rounded-shape-xl",
  xl: "rounded-shape-xl",
  full: "rounded-shape-full",
};

/**
 * M3 elevation utilities, keyed by level. Used by the elevated
 * variant; other variants ignore the elevation prop (filled/tonal/
 * outlined have flat treatments).
 */
export const elevationClasses: Record<PaperElevation, string> = {
  0: "shadow-elevation-0",
  1: "shadow-elevation-1",
  2: "shadow-elevation-2",
  3: "shadow-elevation-3",
  4: "shadow-elevation-4",
  5: "shadow-elevation-5",
};
