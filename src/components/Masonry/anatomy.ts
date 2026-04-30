import type {
  MasonryElevation,
  MasonryPacking,
  MasonryShape,
  MasonrySize,
  MasonrySpacing,
  MasonryVariant,
} from "./types";

/**
 * Masonry anatomy + token bindings.
 *
 * MUI ships Masonry as a Pinterest-style multi-column layout — items
 * flow into the shortest column (balanced) or sequentially across
 * columns (sequential). M3 does not specify a Masonry component, so
 * this implementation re-skins MUI's primitive with the M3 surface /
 * shape / elevation / motion scales: the host paints an M3 surface
 * variant, every tile rounds to the M3 shape token, interactive tiles
 * paint the M3 state-layer + morph the corner shape one notch up on
 * hover/focus/press.
 *
 * Spec references:
 *   - surface roles    https://m3.material.io/styles/color/the-color-system/color-roles
 *   - elevation tokens https://m3.material.io/styles/elevation/tokens
 *   - shape scale      https://m3.material.io/styles/shape/shape-scale-tokens
 *   - state layers     https://m3.material.io/foundations/interaction/states
 */
export const anatomy = {
  /** Outer host that wraps the layout + optional header. */
  root: [
    "relative isolate text-left",
    "transition-[box-shadow,background-color,border-color,color]",
    "duration-medium2 ease-emphasized",
  ].join(" "),
  /** Disabled wash. */
  rootDisabled: "opacity-[0.38] cursor-not-allowed pointer-events-none",
  /**
   * Inner layout — a CSS multi-column container. Each child becomes a
   * `break-inside: avoid` block so tiles never split across columns.
   */
  layout: [
    "relative z-[1] m-0 list-none p-0",
    "w-full block [column-fill:_balance]",
  ].join(" "),
  /** Header row — leading icon + label + trailing icon. */
  header: [
    "relative z-[1] flex w-full items-center gap-3 mb-3",
    "text-title-m font-medium leading-snug",
  ].join(" "),
  /** 24dp icon slot. */
  icon: [
    "inline-flex h-6 w-6 shrink-0 items-center justify-center",
    "text-on-surface-variant",
  ].join(" "),
  /** Tile root — every MasonryItem renders as this. */
  tile: [
    "relative isolate overflow-hidden",
    "block [break-inside:_avoid]",
    "transition-[box-shadow,background-color,border-color,transform]",
    "duration-medium2 ease-emphasized",
  ].join(" "),
  /** Tile resting fill (M3 surface-container-high). */
  tileRest: "bg-surface-container-high text-on-surface",
  /** Tile selected fill (M3 secondary-container). */
  tileSelected: "bg-secondary-container text-on-secondary-container",
  /** Interactive tile: focus ring + pointer cursor. */
  tileInteractive: [
    "cursor-pointer outline-none",
    "focus-visible:ring-2 focus-visible:ring-primary",
    "focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
  ].join(" "),
  /** Disabled tile wash. */
  tileDisabled: "opacity-[0.38] cursor-not-allowed pointer-events-none",
  /** Tile state layer (paints hover/focus/pressed wash). */
  tileStateLayer: [
    "pointer-events-none absolute inset-0 z-[2] rounded-[inherit]",
    "bg-on-surface",
    "transition-opacity duration-short4 ease-standard",
  ].join(" "),
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
};

/**
 * Variant matrix for the host. Default is `text` (transparent) so the
 * layout sits flush against the page.
 */
export const variantClasses: Record<MasonryVariant, ColorBlock> = {
  text: {
    rest: "bg-transparent text-on-surface",
    selected: "bg-secondary-container text-on-secondary-container",
    error: "bg-error-container text-on-error-container",
    border: "border border-transparent",
    elevation: "shadow-elevation-0",
  },
  filled: {
    rest: "bg-surface-container-highest text-on-surface",
    selected: "bg-secondary-container text-on-secondary-container",
    error: "bg-error-container text-on-error-container",
    border: "border border-transparent",
    elevation: "shadow-elevation-0",
  },
  tonal: {
    rest: "bg-secondary-container text-on-secondary-container",
    selected: "bg-secondary-container text-on-secondary-container",
    error: "bg-error-container text-on-error-container",
    border: "border border-transparent",
    elevation: "shadow-elevation-0",
  },
  outlined: {
    rest: "bg-transparent text-on-surface",
    selected: "bg-secondary-container text-on-secondary-container",
    error: "bg-error-container text-on-error-container",
    border: "border border-outline-variant",
    elevation: "shadow-elevation-0",
  },
  elevated: {
    rest: "bg-surface-container-low text-on-surface",
    selected: "bg-secondary-container text-on-secondary-container",
    error: "bg-error-container text-on-error-container",
    border: "border border-transparent",
    elevation: "shadow-elevation-1",
  },
};

type SizeBlock = {
  /** Default gap between tiles. */
  gap: MasonrySpacing;
  /** Outer padding around the layout. */
  pad: string;
};

/** Density scale. M3 default is `md` (16dp pad / 8dp gap). */
export const sizeClasses: Record<MasonrySize, SizeBlock> = {
  sm: { gap: "xs", pad: "p-2" },
  md: { gap: "sm", pad: "p-4" },
  lg: { gap: "md", pad: "p-6" },
};

/** Shape token map — applied to host AND tiles. */
export const shapeClasses: Record<MasonryShape, string> = {
  none: "rounded-shape-none",
  xs: "rounded-shape-xs",
  sm: "rounded-shape-sm",
  md: "rounded-shape-md",
  lg: "rounded-shape-lg",
  xl: "rounded-shape-xl",
  full: "rounded-shape-full",
};

/**
 * M3 Expressive shape morph. Interactive tiles morph one shape step
 * up while hovered/focused/pressed (capped at `xl`). `none` and
 * `full` keep their resting shape.
 */
export const morphTarget: Record<MasonryShape, string> = {
  none: "rounded-shape-none",
  xs: "rounded-shape-sm",
  sm: "rounded-shape-md",
  md: "rounded-shape-lg",
  lg: "rounded-shape-xl",
  xl: "rounded-shape-xl",
  full: "rounded-shape-full",
};

/** M3 elevation 0..5 utilities. */
export const elevationClasses: Record<MasonryElevation, string> = {
  0: "shadow-elevation-0",
  1: "shadow-elevation-1",
  2: "shadow-elevation-2",
  3: "shadow-elevation-3",
  4: "shadow-elevation-4",
  5: "shadow-elevation-5",
};

/** Spacing token → pixel size used in data-* attributes for tests. */
export const spacingPixels: Record<MasonrySpacing, number> = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

/**
 * Packing → ARIA role-description mapping. The layout announces its
 * packing strategy so AT users get the right mental model.
 */
export const packingDescription: Record<MasonryPacking, string> = {
  balanced: "masonry layout",
  sequential: "sequential masonry layout",
};
