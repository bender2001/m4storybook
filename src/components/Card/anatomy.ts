import type {
  CardElevation,
  CardShape,
  CardSize,
  CardVariant,
} from "./types";

/**
 * Card anatomy + token bindings.
 *
 * M3 Expressive spec: https://m3.material.io/components/cards/specs
 *  - container shape : 12dp (medium) — `shape-md`
 *  - title role      : title-l
 *  - subhead role    : body-m / on-surface-variant
 *  - body role       : body-m / on-surface-variant
 *  - actions row     : 8dp top padding, 8dp inter-button gap
 *  - container colors:
 *      elevated  -> surface-container-low + elevation-1 (resting)
 *                                          + elevation-2 (hover)
 *      filled    -> surface-container-highest, no elevation
 *      outlined  -> surface + 1dp outline-variant border
 *  - state-layer opacities: hover 0.08, focus 0.10, pressed 0.10
 */
export const anatomy = {
  /** Outer container — the card surface. */
  root: [
    "relative isolate flex flex-col text-left w-full",
    "transition-[box-shadow,background-color,border-color,color,transform]",
    "duration-medium2 ease-emphasized",
  ].join(" "),
  /** Interactive affordance — focus ring + cursor + outline reset. */
  rootInteractive: [
    "cursor-pointer outline-none",
    "focus-visible:ring-2 focus-visible:ring-primary",
    "focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
  ].join(" "),
  rootDisabled: "opacity-[0.38] cursor-not-allowed pointer-events-none",
  /** State-layer wash. `inherit` radius keeps the wash flush with
   *  the morphed container shape. */
  stateLayer: [
    "pointer-events-none absolute inset-0 z-0 rounded-[inherit]",
    "transition-opacity duration-short4 ease-standard",
  ].join(" "),
  /** Media slot — bleeds to the card edge, clipped by the root. */
  media: [
    "relative z-[1] w-full overflow-hidden",
    "[&>img]:block [&>img]:h-full [&>img]:w-full [&>img]:object-cover",
  ].join(" "),
  /** Header row that holds avatar + title block + trailing slot. */
  header: "relative z-[1] flex w-full items-start gap-3",
  avatar: [
    "inline-flex h-10 w-10 shrink-0 items-center justify-center",
    "rounded-shape-full bg-primary-container text-on-primary-container",
    "text-title-m font-medium",
  ].join(" "),
  /** Wraps title + subhead so they stack vertically. */
  headerText: "flex min-w-0 flex-1 flex-col",
  title: "text-title-l text-on-surface truncate",
  subhead: "text-body-m text-on-surface-variant truncate",
  trailing: [
    "ml-auto flex shrink-0 items-center justify-center",
    "text-on-surface-variant",
  ].join(" "),
  /** Supporting-text body. body-m + on-surface-variant per M3 spec. */
  body: "relative z-[1] text-body-m text-on-surface-variant",
  /** Actions row — buttons separated by 8dp per the M3 Card spec. */
  actions: [
    "relative z-[1] flex items-center justify-end gap-2",
  ].join(" "),
} as const;

/**
 * Variant matrix. M3 defines three card variants; each maps to a
 * distinct surface-color role per https://m3.material.io/components/cards.
 */
export const variantClasses: Record<
  CardVariant,
  {
    /** Resting fill + on-color (text). */
    rest: string;
    /** Hover-only utilities. Elevated variant lifts to elevation-2. */
    hover: string;
    /** Selected fill (M3 selected-card spec — secondary-container). */
    selected: string;
    /** State-layer color (paints through `bg`). */
    stateLayer: string;
    /** Border treatment — outlined only. */
    border: string;
    /** Error-state fill override. */
    error: string;
  }
> = {
  elevated: {
    rest: "bg-surface-container-low text-on-surface",
    hover: "hover:shadow-elevation-2",
    selected: "bg-secondary-container text-on-secondary-container",
    stateLayer: "bg-on-surface",
    border: "",
    error: "bg-error-container text-on-error-container",
  },
  filled: {
    rest: "bg-surface-container-highest text-on-surface",
    hover: "",
    selected: "bg-secondary-container text-on-secondary-container",
    stateLayer: "bg-on-surface",
    border: "",
    error: "bg-error-container text-on-error-container",
  },
  outlined: {
    rest: "bg-surface text-on-surface border border-outline-variant",
    hover: "",
    selected: "bg-secondary-container text-on-secondary-container",
    stateLayer: "bg-on-surface",
    border: "border border-outline-variant",
    error: "bg-surface text-on-error-container border border-error",
  },
};

/**
 * Density scale. Maps to interior padding + slot gap. `actionsPad`
 * is the bottom padding around the actions row.
 */
export const sizeClasses: Record<
  CardSize,
  { padding: string; gap: string; titleGap: string; mediaRadius: string }
> = {
  sm: { padding: "p-3", gap: "gap-2", titleGap: "gap-2", mediaRadius: "rounded-t-shape-md" },
  md: { padding: "p-4", gap: "gap-3", titleGap: "gap-3", mediaRadius: "rounded-t-shape-md" },
  lg: { padding: "p-6", gap: "gap-4", titleGap: "gap-4", mediaRadius: "rounded-t-shape-md" },
};

/**
 * Shape map. Cards default to `md` (12dp). Interactive cards morph
 * one step up on hover/focus to communicate the affordance per M3
 * Expressive shape-morph guidance.
 */
export const shapeClasses: Record<CardShape, string> = {
  none: "rounded-shape-none",
  xs: "rounded-shape-xs",
  sm: "rounded-shape-sm",
  md: "rounded-shape-md",
  lg: "rounded-shape-lg",
  xl: "rounded-shape-xl",
  full: "rounded-shape-full",
};

/**
 * Hover/focus shape morph target. `none` stays flat; everything
 * else bumps one notch up, capped at xl.
 */
export const morphTarget: Record<CardShape, string> = {
  none: "rounded-shape-none",
  xs: "rounded-shape-sm",
  sm: "rounded-shape-md",
  md: "rounded-shape-lg",
  lg: "rounded-shape-xl",
  xl: "rounded-shape-xl",
  full: "rounded-shape-full",
};

/**
 * M3 elevation utilities — used by the elevated variant only.
 * filled / outlined ignore the elevation prop.
 */
export const elevationClasses: Record<CardElevation, string> = {
  0: "shadow-elevation-0",
  1: "shadow-elevation-1",
  2: "shadow-elevation-2",
  3: "shadow-elevation-3",
  4: "shadow-elevation-4",
  5: "shadow-elevation-5",
};
