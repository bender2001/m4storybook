import type { HTMLMotionProps } from "motion/react";
import type { ElementType, ReactNode, Ref } from "react";

/**
 * Box variants. M3 does not specify a "Box" component (it is a MUI
 * concept), so the matrix re-skins MUI's Box surface modes with M3
 * tokens. Default is `text` (transparent host) so the primitive can
 * be used as a pure layout container without painting a surface.
 *
 *   - text     : transparent host, on-surface label (M3 layout default)
 *   - filled   : surface-container-highest, on-surface label
 *   - tonal    : secondary-container, on-secondary-container label
 *   - outlined : transparent + 1dp outline-variant border
 *   - elevated : surface-container-low + elevation-1 host
 */
export type BoxVariant =
  | "text"
  | "filled"
  | "tonal"
  | "outlined"
  | "elevated";

/**
 * Density. Drives interior padding, gap, and min-height.
 *   sm : 8dp pad / 8dp gap  / 32dp min-height (compact rows)
 *   md : 16dp pad / 12dp gap / 48dp min-height (M3 default)
 *   lg : 24dp pad / 16dp gap / 64dp min-height (spacious sheets)
 */
export type BoxSize = "sm" | "md" | "lg";

/** M3 corner shape token. Default `none` (Box is layout-only). */
export type BoxShape = "none" | "xs" | "sm" | "md" | "lg" | "xl" | "full";

/** M3 elevation level. Only meaningful on the `elevated` variant. */
export type BoxElevation = 0 | 1 | 2 | 3 | 4 | 5;

/**
 * Layout display mode. Mirrors MUI Box `display` prop. Defaults to
 * `block` so a Box behaves like a plain div until otherwise told.
 */
export type BoxDisplay =
  | "block"
  | "inline"
  | "inline-block"
  | "flex"
  | "inline-flex"
  | "grid"
  | "inline-grid";

/** Flexbox/grid main-axis direction. */
export type BoxDirection = "row" | "column" | "row-reverse" | "column-reverse";

/** Cross-axis alignment. */
export type BoxAlign = "start" | "center" | "end" | "stretch" | "baseline";

/** Main-axis distribution. */
export type BoxJustify =
  | "start"
  | "center"
  | "end"
  | "between"
  | "around"
  | "evenly";

type BoxOwnKey =
  | "as"
  | "variant"
  | "size"
  | "shape"
  | "elevation"
  | "display"
  | "direction"
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

export interface BoxProps
  extends Omit<HTMLMotionProps<"div">, BoxOwnKey> {
  /** Polymorphic render element. Defaults to `"div"`. */
  as?: ElementType;
  /** Forwarded ref (typed loosely so polymorphic consumers compile). */
  ref?: Ref<HTMLElement>;
  /** Visual variant. Defaults to `text` (transparent layout host). */
  variant?: BoxVariant;
  /** Density. Defaults to `md`. */
  size?: BoxSize;
  /** Corner shape token. Defaults to `none`. */
  shape?: BoxShape;
  /** Elevation level. Only paints when `variant="elevated"`. */
  elevation?: BoxElevation;
  /** Layout display mode. Defaults to `block`. */
  display?: BoxDisplay;
  /** Flex/grid main-axis direction. Defaults to `row`. */
  direction?: BoxDirection;
  /** Cross-axis alignment. Defaults to `stretch`. */
  align?: BoxAlign;
  /** Main-axis distribution. Defaults to `start`. */
  justify?: BoxJustify;
  /**
   * Interactive Box: paints the M3 state layer at hover/focus/pressed
   * opacities, exposes role="button" + tabIndex=0 + Enter/Space
   * activation, and morphs the corner shape one notch up while
   * hovered/focused/pressed (M3 Expressive shape morph).
   */
  interactive?: boolean;
  /** Marks the Box as selected (secondary-container fill + aria). */
  selected?: boolean;
  /** Block all interaction; reads as aria-disabled. */
  disabled?: boolean;
  /** Error treatment: paints the host in error-container + on-error-container. */
  error?: boolean;
  /** Optional leading icon rendered alongside the label slot. */
  leadingIcon?: ReactNode;
  /** Optional trailing icon rendered alongside the label slot. */
  trailingIcon?: ReactNode;
  /** Optional label slot — renders inline with the icon slots. */
  label?: ReactNode;
  /** Body content. */
  children?: ReactNode;
  /** Accessible label override (only used when interactive). */
  "aria-label"?: string;
}
