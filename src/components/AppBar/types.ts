import type { HTMLAttributes, ReactNode } from "react";

/**
 * M3 Top App Bar variants per
 * https://m3.material.io/components/top-app-bar.
 *  - small         : 64dp height, title-l left-aligned
 *  - center-aligned: 64dp height, title-l centered
 *  - medium        : 112dp height (top), headline-s aligned bottom-left
 *  - large         : 152dp height (top), headline-m aligned bottom-left
 *  - bottom        : 80dp Bottom App Bar (M3 spec mirrors top role; uses
 *                    surface-container with optional FAB in the trailing
 *                    slot)
 */
export type AppBarVariant =
  | "small"
  | "center-aligned"
  | "medium"
  | "large"
  | "bottom";

/**
 * Density scale. The medium / large variants keep the M3-specified
 * top row height (64dp) — `size` only scales the title row, the
 * horizontal gutter, and the icon hit target so the same content
 * fits comfortably in a tablet vs mobile shell.
 *   - sm : 56dp top row / 12dp gutter / 20dp icon
 *   - md : 64dp top row / 16dp gutter / 24dp icon (default)
 *   - lg : 72dp top row / 24dp gutter / 28dp icon
 */
export type AppBarSize = "sm" | "md" | "lg";

/**
 * Corner shape scale. Top app bars are typically `none` (full-bleed)
 * but the docked / contextual variants accept `md` so the surface can
 * float inside a layout. Mirrors Card / Accordion / Paper.
 */
export type AppBarShape =
  | "none"
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "full";

type AppBarOwnKey =
  | "variant"
  | "size"
  | "shape"
  | "title"
  | "leading"
  | "trailing"
  | "scrolled"
  | "elevated"
  | "disabled"
  | "children";

export interface AppBarProps
  extends Omit<HTMLAttributes<HTMLElement>, AppBarOwnKey> {
  variant?: AppBarVariant;
  size?: AppBarSize;
  shape?: AppBarShape;
  /**
   * Title slot — typeset per the variant: title-l for small /
   * center-aligned, headline-s for medium, headline-m for large.
   */
  title?: ReactNode;
  /** Leading slot — typically a nav / menu icon-button. */
  leading?: ReactNode;
  /** Trailing slot — action icons (small/large) or a FAB (bottom). */
  trailing?: ReactNode;
  /**
   * Scroll state. When true, swaps the surface fill from `surface` to
   * `surface-container` per the M3 on-scroll guidance and lifts to
   * elevation-2 if `elevated` is also set.
   */
  scrolled?: boolean;
  /** Adds the elevation-2 shadow used by docked / floating app bars. */
  elevated?: boolean;
  /** Disables interaction + dims the surface to opacity 0.38. */
  disabled?: boolean;
  /**
   * Extra children rendered below the title row. Only used by the
   * medium / large variants where the title sits on its own row.
   */
  children?: ReactNode;
}
