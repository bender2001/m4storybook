import type { HTMLMotionProps } from "motion/react";
import type { ElementType, ReactNode, Ref } from "react";

/**
 * Container variants. M3 has no formal "Container" component — Container is
 * a MUI layout primitive that centres content horizontally and clamps it to
 * a breakpoint-sized max-width. The matrix below re-skins it with the same
 * five M3 surface modes the rest of the library uses so the layout shell
 * can also paint a tinted region when needed.
 *
 *   - text     : transparent host, on-surface label (layout default)
 *   - filled   : surface-container-highest, on-surface label
 *   - tonal    : secondary-container, on-secondary-container label
 *   - outlined : transparent + 1dp outline-variant border
 *   - elevated : surface-container-low + elevation-1 host
 */
export type ContainerVariant =
  | "text"
  | "filled"
  | "tonal"
  | "outlined"
  | "elevated";

/**
 * Density. Drives interior padding, gap, and min-height.
 *   sm : 12dp pad / 8dp gap  / 48dp min-height (compact shells)
 *   md : 24dp pad / 12dp gap / 64dp min-height (M3 default)
 *   lg : 40dp pad / 16dp gap / 80dp min-height (spacious sections)
 */
export type ContainerSize = "sm" | "md" | "lg";

/** M3 corner shape token. Default `none` (Container is layout-only). */
export type ContainerShape =
  | "none"
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "full";

/**
 * Breakpoint clamp. Mirrors MUI's Container `maxWidth` prop so the layout
 * shell drops in cleanly. `false` removes the clamp so the Container fills
 * the available width.
 *
 *   xs : 444px   sm : 600px   md : 900px   lg : 1200px   xl : 1536px
 */
export type ContainerMaxWidth =
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | false;

type ContainerOwnKey =
  | "as"
  | "variant"
  | "size"
  | "shape"
  | "maxWidth"
  | "fixed"
  | "disableGutters"
  | "centered"
  | "selected"
  | "disabled"
  | "error"
  | "leadingIcon"
  | "trailingIcon"
  | "label"
  | "children"
  | "aria-label"
  | "ref";

export interface ContainerProps
  extends Omit<HTMLMotionProps<"div">, ContainerOwnKey> {
  /** Polymorphic render element. Defaults to `"main"`. */
  as?: ElementType;
  /** Forwarded ref (typed loosely so polymorphic consumers compile). */
  ref?: Ref<HTMLElement>;
  /** Visual variant. Defaults to `text` (transparent layout host). */
  variant?: ContainerVariant;
  /** Density. Defaults to `md`. */
  size?: ContainerSize;
  /** Corner shape token. Defaults to `none`. */
  shape?: ContainerShape;
  /** Max-width clamp. Mirrors MUI Container `maxWidth`. Defaults to `lg`. */
  maxWidth?: ContainerMaxWidth;
  /** Lock to the breakpoint width (apply `min-width` matching `maxWidth`). */
  fixed?: boolean;
  /** Drop horizontal gutters (mirrors MUI `disableGutters`). */
  disableGutters?: boolean;
  /**
   * Centre the Container horizontally with `margin-inline: auto`. Defaults
   * to `true` so the shell behaves like MUI's Container out of the box.
   */
  centered?: boolean;
  /** Marks the Container as selected (secondary-container fill + aria). */
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
  /** Accessible label override (used as section landmark). */
  "aria-label"?: string;
}
