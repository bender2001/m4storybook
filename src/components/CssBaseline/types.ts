import type { HTMLMotionProps } from "motion/react";
import type { ElementType, ReactNode, Ref } from "react";

/**
 * CSS Baseline variants. MUI's `<CssBaseline />` is a global reset that
 * paints the document with `theme.palette.background.default` and resets
 * margins / box-sizing / typography. M3 has no equivalent component, so
 * we re-skin it with the same five surface modes the rest of the library
 * uses; the variant chooses which M3 surface role acts as the baseline
 * background under the reset.
 *
 *   - text     : transparent host, on-surface text (scoped reset only)
 *   - filled   : surface, on-surface text (M3 default — matches body bg)
 *   - tonal    : secondary-container, on-secondary-container text
 *   - outlined : transparent + 1dp outline-variant border
 *   - elevated : surface-container-low + elevation-1 host
 */
export type CssBaselineVariant =
  | "text"
  | "filled"
  | "tonal"
  | "outlined"
  | "elevated";

/**
 * Density. MUI's CssBaseline applies a single baseline; we expose three
 * densities so the same shell can drive a compact, default, or spacious
 * type rhythm via the M3 type scale.
 *
 *   sm : body-s (12px) / 1.43 line-height / compact
 *   md : body-m (14px) / 1.5  line-height / M3 default
 *   lg : body-l (16px) / 1.5  line-height / spacious
 */
export type CssBaselineSize = "sm" | "md" | "lg";

/** M3 corner shape token. Default `none` (CSS Baseline is a layout reset). */
export type CssBaselineShape =
  | "none"
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "full";

type CssBaselineOwnKey =
  | "as"
  | "variant"
  | "size"
  | "shape"
  | "scoped"
  | "enableColorScheme"
  | "selected"
  | "disabled"
  | "error"
  | "leadingIcon"
  | "trailingIcon"
  | "label"
  | "children"
  | "aria-label"
  | "ref";

export interface CssBaselineProps
  extends Omit<HTMLMotionProps<"div">, CssBaselineOwnKey> {
  /** Polymorphic render element. Defaults to `"section"`. */
  as?: ElementType;
  /** Forwarded ref (typed loosely so polymorphic consumers compile). */
  ref?: Ref<HTMLElement>;
  /** Visual variant. Defaults to `filled` (M3 surface baseline). */
  variant?: CssBaselineVariant;
  /** Density. Defaults to `md`. */
  size?: CssBaselineSize;
  /** Corner shape token. Defaults to `none`. */
  shape?: CssBaselineShape;
  /**
   * Scope the baseline reset to this subtree only. Defaults to `true` —
   * the storybook deliverable does not own the document body, so the
   * reset is applied locally and inherited by descendants.
   */
  scoped?: boolean;
  /**
   * Mirror MUI's `enableColorScheme` prop: when true, the host writes
   * the matching `color-scheme` value so native form controls + scrollbars
   * paint the right palette under the active theme.
   */
  enableColorScheme?: boolean;
  /** Marks the baseline shell as selected (secondary-container fill). */
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
  /** Body content. The reset cascades to descendants of this slot. */
  children?: ReactNode;
  /** Accessible label override. */
  "aria-label"?: string;
}
