import type { HTMLMotionProps } from "motion/react";
import type { ElementType, ReactNode, Ref } from "react";

/**
 * Grid variants. M3 does not specify a "Grid" component (it is a MUI
 * concept), so the matrix re-skins MUI's Grid surface with M3 surface
 * roles. Default is `text` (transparent host) so the primitive stays
 * a pure layout container.
 *
 *   - text     : transparent host
 *   - filled   : surface-container-highest
 *   - tonal    : secondary-container
 *   - outlined : transparent + 1dp outline-variant border
 *   - elevated : surface-container-low + elevation-1 host
 */
export type GridVariant =
  | "text"
  | "filled"
  | "tonal"
  | "outlined"
  | "elevated";

/**
 * Density. Drives default gap, padding, and minimum row height.
 *   sm : 8dp gap  / 8dp pad  / 32dp min-row
 *   md : 16dp gap / 16dp pad / 48dp min-row (M3 default)
 *   lg : 24dp gap / 24dp pad / 64dp min-row
 */
export type GridSize = "sm" | "md" | "lg";

/** M3 corner shape token. Default `none` (Grid is layout-only). */
export type GridShape =
  | "none"
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "full";

/** M3 elevation level. Only meaningful on the `elevated` variant. */
export type GridElevation = 0 | 1 | 2 | 3 | 4 | 5;

/**
 * Track count. Mirrors MUI Grid's 12-column system. Honoured for
 * `1..12`; consumers can also drop child columns via `<GridItem span>`.
 */
export type GridColumns =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12;

/**
 * Spacing scale that drives the CSS gap. `none` removes the gap; the
 * other tokens map onto the M3 4dp spacing rhythm.
 *
 *   none : 0px   (no gap)
 *   xs   : 4dp
 *   sm   : 8dp
 *   md   : 16dp  (M3 default)
 *   lg   : 24dp
 *   xl   : 32dp
 */
export type GridSpacing =
  | "none"
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl";

/**
 * Auto-flow direction. Mirrors CSS grid `grid-auto-flow`. `dense`
 * variants pack items to fill earlier holes (M3 layout flexibility).
 */
export type GridFlow = "row" | "column" | "row-dense" | "column-dense";

/** Cross-axis alignment. */
export type GridAlign = "start" | "center" | "end" | "stretch" | "baseline";

/** Main-axis distribution. */
export type GridJustify =
  | "start"
  | "center"
  | "end"
  | "between"
  | "around"
  | "evenly";

/**
 * Column / row span for a `<GridItem>`. `auto` lets the browser size
 * the cell from its content; `full` spans every column.
 */
export type GridSpan =
  | "auto"
  | "full"
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12;

/** Column / row start line. Mirrors MUI Grid `gridColumnStart`. */
export type GridStart =
  | "auto"
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13;

type GridOwnKey =
  | "as"
  | "variant"
  | "size"
  | "shape"
  | "elevation"
  | "columns"
  | "spacing"
  | "rowSpacing"
  | "columnSpacing"
  | "flow"
  | "align"
  | "justify"
  | "interactive"
  | "selected"
  | "disabled"
  | "error"
  | "leadingIcon"
  | "trailingIcon"
  | "label"
  | "children"
  | "aria-label"
  | "ref";

export interface GridProps
  extends Omit<HTMLMotionProps<"div">, GridOwnKey> {
  /** Polymorphic render element. Defaults to `"div"`. */
  as?: ElementType;
  /** Forwarded ref (typed loosely so polymorphic consumers compile). */
  ref?: Ref<HTMLElement>;
  /** Visual variant. Defaults to `text` (transparent layout host). */
  variant?: GridVariant;
  /** Density. Defaults to `md`. */
  size?: GridSize;
  /** Corner shape token. Defaults to `none`. */
  shape?: GridShape;
  /** Elevation level. Only paints when `variant="elevated"`. */
  elevation?: GridElevation;
  /** Number of explicit columns. Defaults to `12` (MUI parity). */
  columns?: GridColumns;
  /** Gap between rows + columns. Falls back to the size default. */
  spacing?: GridSpacing;
  /** Row gap override. Wins over `spacing` when supplied. */
  rowSpacing?: GridSpacing;
  /** Column gap override. Wins over `spacing` when supplied. */
  columnSpacing?: GridSpacing;
  /** Auto-flow direction. Defaults to `row`. */
  flow?: GridFlow;
  /** Cross-axis alignment. Defaults to `stretch`. */
  align?: GridAlign;
  /** Main-axis distribution. Defaults to `start`. */
  justify?: GridJustify;
  /**
   * Interactive Grid: paints the M3 state layer at hover/focus/pressed
   * opacities, exposes role="button" + tabIndex=0 + Enter/Space
   * activation, and morphs the corner shape one notch up while
   * hovered/focused/pressed (M3 Expressive shape morph).
   */
  interactive?: boolean;
  /** Selected state (secondary-container fill + aria-selected). */
  selected?: boolean;
  /** Block all interaction; reads as aria-disabled. */
  disabled?: boolean;
  /** Error treatment: paints the host in error-container. */
  error?: boolean;
  /** Optional leading icon rendered alongside the label slot. */
  leadingIcon?: ReactNode;
  /** Optional trailing icon rendered alongside the label slot. */
  trailingIcon?: ReactNode;
  /** Optional label slot — renders inline with the icon slots. */
  label?: ReactNode;
  /** Grid items / arbitrary children. */
  children?: ReactNode;
  /** Accessible label override (only used when interactive). */
  "aria-label"?: string;
}

type GridItemOwnKey =
  | "as"
  | "span"
  | "start"
  | "rowSpan"
  | "rowStart"
  | "variant"
  | "shape"
  | "selected"
  | "disabled"
  | "error"
  | "children"
  | "ref";

export interface GridItemProps
  extends Omit<HTMLMotionProps<"div">, GridItemOwnKey> {
  /** Polymorphic render element. Defaults to `"div"`. */
  as?: ElementType;
  /** Forwarded ref. */
  ref?: Ref<HTMLElement>;
  /** Column span. Defaults to `auto` (sized by content). */
  span?: GridSpan;
  /** Column start line. Defaults to `auto`. */
  start?: GridStart;
  /** Row span. Defaults to `auto`. */
  rowSpan?: GridSpan;
  /** Row start line. Defaults to `auto`. */
  rowStart?: GridStart;
  /** Optional surface variant for the cell. Defaults to `text`. */
  variant?: GridVariant;
  /** Optional corner shape for the cell. Defaults to `none`. */
  shape?: GridShape;
  /** Selected cell paint (secondary-container + aria). */
  selected?: boolean;
  /** Disabled cell wash (opacity 0.38 + pointer-events:none). */
  disabled?: boolean;
  /** Error cell paint (error-container + aria-invalid). */
  error?: boolean;
  /** Cell content. */
  children?: ReactNode;
}
