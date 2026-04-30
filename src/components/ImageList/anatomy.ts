import type {
  ImageListArrangement,
  ImageListElevation,
  ImageListShape,
  ImageListSize,
  ImageListSpacing,
  ImageListSpan,
  ImageListVariant,
} from "./types";

/**
 * ImageList anatomy + token bindings.
 *
 * MUI ships ImageList as a 2D gallery of image tiles with four
 * arrangements: standard, quilted, woven, and masonry. M3 does not
 * specify an Image List component, so this implementation re-skins
 * MUI's primitive with the M3 surface / shape / elevation / motion
 * scales: the host paints an M3 surface variant, every tile rounds
 * to the M3 shape token, interactive tiles paint the M3 state-layer
 * + morph the corner shape one notch up on hover/focus/press, and
 * the optional `<ImageListItemBar>` overlay paints a scrim-tinted
 * surface so labels stay legible over imagery.
 *
 * Spec references:
 *   - surface roles    https://m3.material.io/styles/color/the-color-system/color-roles
 *   - elevation tokens https://m3.material.io/styles/elevation/tokens
 *   - shape scale      https://m3.material.io/styles/shape/shape-scale-tokens
 *   - state layers     https://m3.material.io/foundations/interaction/states
 */
export const anatomy = {
  /** Outer host that wraps the gallery + optional header. */
  root: [
    "relative isolate text-left",
    "transition-[box-shadow,background-color,border-color,color]",
    "duration-medium2 ease-emphasized",
  ].join(" "),
  /** Disabled wash. */
  rootDisabled: "opacity-[0.38] cursor-not-allowed pointer-events-none",
  /**
   * Inner gallery — a CSS grid (or column layout for masonry) that
   * tracks tile placement. Sits above the state-layer.
   */
  list: [
    "relative z-[1] m-0 list-none p-0",
    "w-full",
  ].join(" "),
  /** Standard / quilted / woven arrangements share the same grid base. */
  listGrid: "grid",
  /** Masonry uses CSS multi-columns so rows flow independently. */
  listMasonry: "block [column-fill:_balance]",
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
  /** Tile root — every ImageListItem renders as this. */
  tile: [
    "relative isolate overflow-hidden",
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
  /**
   * Image inside a tile — fills + covers the cell. The masonry CSS
   * rule in `src/index.css` overrides `height` to `auto` so masonry
   * tiles flow at their natural height inside CSS multi-columns.
   */
  image: "block h-full w-full object-cover",
  /** Bar overlay — solid surface tint that sits over the image. */
  bar: [
    "absolute left-0 right-0 z-[3] flex items-center gap-2",
    "px-3 py-2",
    "bg-surface-container-highest/80 text-on-surface",
    "backdrop-blur-sm",
  ].join(" "),
  barTop: "top-0",
  barBottom: "bottom-0",
  /** Below position renders below the image, not over it. */
  barBelow:
    "relative z-[3] flex items-center gap-2 px-3 py-2 bg-transparent text-on-surface",
  barTextWrap: "min-w-0 flex-1",
  barTitle: "block truncate text-title-s font-medium leading-tight",
  barSubtitle: "block truncate text-body-s text-on-surface-variant leading-tight",
  barAction: "inline-flex shrink-0 items-center justify-center",
  barActionLeft: "order-first",
  barActionRight: "order-last ml-auto",
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
 * Variant matrix for the host. Default is `text` (transparent) so
 * the gallery sits flush against the page.
 */
export const variantClasses: Record<ImageListVariant, ColorBlock> = {
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
  gap: ImageListSpacing;
  /** Outer padding around the gallery. */
  pad: string;
  /** Default tile row height in pixels (used when `rowHeight` omitted). */
  rowHeight: number;
  /** Default column count when `cols` is omitted. */
  cols: number;
};

/** Density scale. M3 default is `md` (16dp pad / 8dp gap / 160dp tile). */
export const sizeClasses: Record<ImageListSize, SizeBlock> = {
  sm: { gap: "xs", pad: "p-2", rowHeight: 120, cols: 4 },
  md: { gap: "sm", pad: "p-4", rowHeight: 160, cols: 3 },
  lg: { gap: "md", pad: "p-6", rowHeight: 200, cols: 2 },
};

/** Shape token map — applied to host AND tiles. */
export const shapeClasses: Record<ImageListShape, string> = {
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
export const morphTarget: Record<ImageListShape, string> = {
  none: "rounded-shape-none",
  xs: "rounded-shape-sm",
  sm: "rounded-shape-md",
  md: "rounded-shape-lg",
  lg: "rounded-shape-xl",
  xl: "rounded-shape-xl",
  full: "rounded-shape-full",
};

/** M3 elevation 0..5 utilities. */
export const elevationClasses: Record<ImageListElevation, string> = {
  0: "shadow-elevation-0",
  1: "shadow-elevation-1",
  2: "shadow-elevation-2",
  3: "shadow-elevation-3",
  4: "shadow-elevation-4",
  5: "shadow-elevation-5",
};

/** Gap utilities (Tailwind `gap-*`). */
export const spacingClasses: Record<ImageListSpacing, string> = {
  none: "gap-0",
  xs: "gap-1",
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
  xl: "gap-8",
};

/** Spacing token → pixel size used in data-* attributes for tests. */
export const spacingPixels: Record<ImageListSpacing, number> = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

/**
 * Convert a span token (`auto` | 1..6) to a CSS `span N` (or `auto`).
 * Used for both `grid-column` and `grid-row` placement on tiles.
 */
export function spanToCss(span: ImageListSpan): string {
  return span === "auto" ? "auto" : `span ${span}`;
}

/**
 * Arrangement → ARIA role-description mapping. The gallery announces
 * its arrangement so AT users get the right mental model.
 */
export const arrangementDescription: Record<ImageListArrangement, string> = {
  standard: "image gallery",
  quilted: "quilted image gallery",
  woven: "woven image gallery",
  masonry: "masonry image gallery",
};
