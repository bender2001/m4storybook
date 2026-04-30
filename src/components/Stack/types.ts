import type { HTMLMotionProps } from "motion/react";
import type { ElementType, ReactNode, Ref } from "react";

/**
 * Stack variants. M3 does not specify a "Stack" component (it is a
 * MUI layout primitive that arranges its children along a single
 * axis). The matrix below re-skins MUI's Stack with the M3 surface
 * roles. Default is `text` (transparent host) so the primitive stays
 * a pure layout container.
 *
 *   - text     : transparent host
 *   - filled   : surface-container-highest
 *   - tonal    : secondary-container
 *   - outlined : transparent + 1dp outline-variant border
 *   - elevated : surface-container-low + elevation-1 host
 */
export type StackVariant =
  | "text"
  | "filled"
  | "tonal"
  | "outlined"
  | "elevated";

/**
 * Density. Drives outer padding, default child gap, and minimum
 * cross-axis size.
 *
 *   sm : 8dp pad / 8dp default gap  / 32dp min-cross
 *   md : 16dp pad / 16dp default gap / 48dp min-cross  (M3 default)
 *   lg : 24dp pad / 24dp default gap / 64dp min-cross
 */
export type StackSize = "sm" | "md" | "lg";

/** M3 corner shape token. Default `none` (Stack is layout-only). */
export type StackShape =
  | "none"
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "full";

/** M3 elevation level. Only meaningful on the `elevated` variant. */
export type StackElevation = 0 | 1 | 2 | 3 | 4 | 5;

/** Stacking axis. Mirrors MUI Stack `direction`. */
export type StackDirection =
  | "column"
  | "row"
  | "column-reverse"
  | "row-reverse";

/**
 * Spacing scale that drives the CSS gap between children. `none`
 * removes the gap; the other tokens map onto the M3 4dp spacing
 * rhythm.
 *
 *   none : 0px
 *   xs   : 4dp
 *   sm   : 8dp
 *   md   : 16dp  (M3 default)
 *   lg   : 24dp
 *   xl   : 32dp
 */
export type StackSpacing =
  | "none"
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl";

/** Cross-axis alignment (Tailwind `items-*`). */
export type StackAlign =
  | "start"
  | "center"
  | "end"
  | "stretch"
  | "baseline";

/** Main-axis distribution (Tailwind `justify-*`). */
export type StackJustify =
  | "start"
  | "center"
  | "end"
  | "between"
  | "around"
  | "evenly";

/** Wrap behaviour. Mirrors CSS `flex-wrap`. */
export type StackWrap = "nowrap" | "wrap" | "wrap-reverse";

type StackOwnKey =
  | "as"
  | "variant"
  | "size"
  | "shape"
  | "elevation"
  | "direction"
  | "spacing"
  | "align"
  | "justify"
  | "wrap"
  | "divider"
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

export interface StackProps
  extends Omit<HTMLMotionProps<"div">, StackOwnKey> {
  /** Polymorphic render element. Defaults to `"div"`. */
  as?: ElementType;
  /** Forwarded ref (typed loosely so polymorphic consumers compile). */
  ref?: Ref<HTMLElement>;
  /** Visual variant. Defaults to `text` (transparent layout host). */
  variant?: StackVariant;
  /** Density. Defaults to `md`. */
  size?: StackSize;
  /** Corner shape token. Defaults to `none`. */
  shape?: StackShape;
  /** Elevation level. Only paints when `variant="elevated"`. */
  elevation?: StackElevation;
  /** Stacking axis. Defaults to `column` (MUI parity). */
  direction?: StackDirection;
  /** Gap between children. Falls back to the size default. */
  spacing?: StackSpacing;
  /** Cross-axis alignment. Defaults to `stretch`. */
  align?: StackAlign;
  /** Main-axis distribution. Defaults to `start`. */
  justify?: StackJustify;
  /** Flex-wrap behaviour. Defaults to `nowrap`. */
  wrap?: StackWrap;
  /**
   * Optional divider rendered between every pair of stacked children.
   * MUI parity. Hidden from the accessibility tree (role="presentation").
   */
  divider?: ReactNode;
  /**
   * Interactive Stack: paints the M3 state layer at hover/focus/pressed
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
  /** Stacked children. */
  children?: ReactNode;
  /** Accessible label override (only used when interactive). */
  "aria-label"?: string;
}
