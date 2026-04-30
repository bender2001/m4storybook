import type { HTMLMotionProps } from "motion/react";
import type {
  CSSProperties,
  ElementType,
  ImgHTMLAttributes,
  ReactNode,
  Ref,
} from "react";

/**
 * Surface variant. Re-skins MUI's ImageList host with the M3 surface
 * roles so the gallery can sit on a tinted/outlined/elevated container.
 *
 *   - text     : transparent host (default)
 *   - filled   : surface-container-highest
 *   - tonal    : secondary-container
 *   - outlined : transparent + 1dp outline-variant border
 *   - elevated : surface-container-low + elevation-1 host
 */
export type ImageListVariant =
  | "text"
  | "filled"
  | "tonal"
  | "outlined"
  | "elevated";

/**
 * MUI ImageList layout arrangement.
 *
 *   standard : uniform tiles laid out on a regular grid
 *   quilted  : variable-span tiles (use `cols` + `rows` on items)
 *   woven    : alternating size pattern via auto column-spans
 *   masonry  : column-based layout where rows flow independently
 */
export type ImageListArrangement =
  | "standard"
  | "quilted"
  | "woven"
  | "masonry";

/**
 * Density. Drives outer padding, default child gap, and the default
 * tile row height. M3 default is `md` (16dp pad / 8dp gap / 160dp tile).
 *
 *   sm : 8dp pad  / 4dp gap  / 120dp tile
 *   md : 16dp pad / 8dp gap  / 160dp tile (M3 default)
 *   lg : 24dp pad / 12dp gap / 200dp tile
 */
export type ImageListSize = "sm" | "md" | "lg";

/** M3 corner shape token applied to host AND each tile. */
export type ImageListShape =
  | "none"
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "full";

/** M3 elevation level. Only meaningful on the `elevated` variant. */
export type ImageListElevation = 0 | 1 | 2 | 3 | 4 | 5;

/** Gap scale shared with Stack/Grid. */
export type ImageListSpacing =
  | "none"
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl";

/** Column / row span tokens for individual tiles (1..6 + auto). */
export type ImageListSpan = "auto" | 1 | 2 | 3 | 4 | 5 | 6;

type ImageListOwnKey =
  | "as"
  | "variant"
  | "arrangement"
  | "size"
  | "shape"
  | "elevation"
  | "cols"
  | "spacing"
  | "rowHeight"
  | "selected"
  | "disabled"
  | "error"
  | "leadingIcon"
  | "trailingIcon"
  | "label"
  | "children"
  | "aria-label"
  | "ref";

export interface ImageListProps
  extends Omit<HTMLMotionProps<"ul">, ImageListOwnKey> {
  /** Polymorphic render element. Defaults to `"ul"`. */
  as?: ElementType;
  /** Forwarded ref. */
  ref?: Ref<HTMLElement>;
  /** Visual variant. Defaults to `text` (transparent host). */
  variant?: ImageListVariant;
  /** Layout arrangement. Defaults to `standard`. */
  arrangement?: ImageListArrangement;
  /** Density. Defaults to `md`. */
  size?: ImageListSize;
  /** Corner shape token applied to host AND tiles. Defaults to `md`. */
  shape?: ImageListShape;
  /** Elevation level. Only paints when `variant="elevated"`. */
  elevation?: ImageListElevation;
  /** Column count. Defaults to 3. Ignored by the masonry arrangement. */
  cols?: number;
  /** Tile row height in px. Defaults to the size token. Use `"auto"` to let content size. */
  rowHeight?: number | "auto";
  /** Gap between tiles. Falls back to the size default. */
  spacing?: ImageListSpacing;
  /** Selected state on the host (paints secondary-container). */
  selected?: boolean;
  /** Block all interaction; reads as aria-disabled. */
  disabled?: boolean;
  /** Error treatment: paints the host in error-container. */
  error?: boolean;
  /** Optional leading icon rendered alongside the label slot. */
  leadingIcon?: ReactNode;
  /** Optional trailing icon rendered alongside the label slot. */
  trailingIcon?: ReactNode;
  /** Optional label slot — renders in the host header above the grid. */
  label?: ReactNode;
  /** Tile children — typically `<ImageListItem>` instances. */
  children?: ReactNode;
  /** Accessible label override (forwarded to the gallery role). */
  "aria-label"?: string;
}

type ImageListItemOwnKey =
  | "as"
  | "cols"
  | "rows"
  | "shape"
  | "selected"
  | "disabled"
  | "interactive"
  | "src"
  | "alt"
  | "imgProps"
  | "children"
  | "aria-label"
  | "ref";

export interface ImageListItemProps
  extends Omit<HTMLMotionProps<"li">, ImageListItemOwnKey> {
  /** Polymorphic render element. Defaults to `"li"`. */
  as?: ElementType;
  /** Forwarded ref. */
  ref?: Ref<HTMLElement>;
  /** Column span (1..6) within the parent grid. Defaults to 1. */
  cols?: ImageListSpan;
  /** Row span (1..6) within the parent grid. Defaults to 1. */
  rows?: ImageListSpan;
  /** Corner shape token. Inherits from the host when omitted. */
  shape?: ImageListShape;
  /** Selected state — paints the M3 selected wash + aria-selected. */
  selected?: boolean;
  /** Disabled state — dims to opacity 0.38 + blocks pointer events. */
  disabled?: boolean;
  /**
   * Interactive tile: paints the M3 state layer at hover/focus/pressed
   * opacities, exposes role="button" + tabIndex=0 + Enter/Space
   * activation, and morphs the corner shape one notch up while
   * hovered/focused/pressed (M3 Expressive shape morph).
   */
  interactive?: boolean;
  /** Image source. When omitted, render `children` instead. */
  src?: string;
  /** Image alt text. Required when `src` is provided. */
  alt?: string;
  /** Extra props forwarded to the `<img>` element. */
  imgProps?: ImgHTMLAttributes<HTMLImageElement>;
  /** Tile content (image, ImageListItemBar, custom node). */
  children?: ReactNode;
  /** Accessible label override (only used when interactive). */
  "aria-label"?: string;
}

type ImageListItemBarOwnKey =
  | "title"
  | "subtitle"
  | "actionIcon"
  | "actionPosition"
  | "position"
  | "children"
  | "ref";

export interface ImageListItemBarProps
  extends Omit<HTMLMotionProps<"div">, ImageListItemBarOwnKey> {
  /** Forwarded ref. */
  ref?: Ref<HTMLDivElement>;
  /** Primary text. */
  title?: ReactNode;
  /** Secondary text rendered below the title. */
  subtitle?: ReactNode;
  /** Action icon node — typically an icon button. */
  actionIcon?: ReactNode;
  /** Where the action icon sits horizontally. Defaults to `"right"`. */
  actionPosition?: "left" | "right";
  /** Where the bar attaches vertically. Defaults to `"bottom"`. */
  position?: "top" | "bottom" | "below";
  /** Custom children (overrides title/subtitle). */
  children?: ReactNode;
  /** Optional inline style override. */
  style?: CSSProperties;
}
