import type { HTMLMotionProps } from "motion/react";
import type {
  ElementType,
  ReactNode,
  Ref,
} from "react";

/**
 * Surface variant. Re-skins MUI's Masonry host with the M3 surface roles
 * so the layout can sit on a tinted/outlined/elevated container.
 *
 *   - text     : transparent host (default)
 *   - filled   : surface-container-highest
 *   - tonal    : secondary-container
 *   - outlined : transparent + 1dp outline-variant border
 *   - elevated : surface-container-low + elevation-1 host
 */
export type MasonryVariant =
  | "text"
  | "filled"
  | "tonal"
  | "outlined"
  | "elevated";

/**
 * Density. Drives outer padding and the default child gap.
 *
 *   sm : 8dp pad  / 4dp gap
 *   md : 16dp pad / 8dp gap (M3 default)
 *   lg : 24dp pad / 12dp gap
 */
export type MasonrySize = "sm" | "md" | "lg";

/** M3 corner shape token applied to host AND each tile. */
export type MasonryShape =
  | "none"
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "full";

/** M3 elevation level. Only meaningful on the `elevated` variant. */
export type MasonryElevation = 0 | 1 | 2 | 3 | 4 | 5;

/** Gap scale shared with Stack/Grid/ImageList. */
export type MasonrySpacing =
  | "none"
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl";

/**
 * MUI Masonry packing strategy.
 *
 *   balanced   : items fill the shortest column (default — Pinterest)
 *   sequential : items fill columns left-to-right, breaking after each
 *                column hits the column count
 */
export type MasonryPacking = "balanced" | "sequential";

type MasonryOwnKey =
  | "as"
  | "variant"
  | "size"
  | "shape"
  | "elevation"
  | "columns"
  | "spacing"
  | "packing"
  | "selected"
  | "disabled"
  | "error"
  | "leadingIcon"
  | "trailingIcon"
  | "label"
  | "children"
  | "aria-label"
  | "ref";

export interface MasonryProps
  extends Omit<HTMLMotionProps<"div">, MasonryOwnKey> {
  /** Polymorphic render element. Defaults to `"div"`. */
  as?: ElementType;
  /** Forwarded ref. */
  ref?: Ref<HTMLElement>;
  /** Visual variant. Defaults to `text` (transparent host). */
  variant?: MasonryVariant;
  /** Density. Defaults to `md`. */
  size?: MasonrySize;
  /** Corner shape token applied to host AND tiles. Defaults to `md`. */
  shape?: MasonryShape;
  /** Elevation level. Only paints when `variant="elevated"`. */
  elevation?: MasonryElevation;
  /** Column count. Defaults to 3. */
  columns?: number;
  /** Gap between tiles. Falls back to the size default. */
  spacing?: MasonrySpacing;
  /** Item flow strategy. Defaults to `balanced` (MUI default). */
  packing?: MasonryPacking;
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
  /** Optional label slot — renders in the host header above the layout. */
  label?: ReactNode;
  /** Tile children — typically `<MasonryItem>` instances. */
  children?: ReactNode;
  /** Accessible label override (forwarded to the layout role). */
  "aria-label"?: string;
}

type MasonryItemOwnKey =
  | "as"
  | "shape"
  | "selected"
  | "disabled"
  | "interactive"
  | "children"
  | "aria-label"
  | "ref";

export interface MasonryItemProps
  extends Omit<HTMLMotionProps<"div">, MasonryItemOwnKey> {
  /** Polymorphic render element. Defaults to `"div"`. */
  as?: ElementType;
  /** Forwarded ref. */
  ref?: Ref<HTMLElement>;
  /** Corner shape token. Inherits from the host when omitted. */
  shape?: MasonryShape;
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
  /** Tile content. */
  children?: ReactNode;
  /** Accessible label override (only used when interactive). */
  "aria-label"?: string;
}
