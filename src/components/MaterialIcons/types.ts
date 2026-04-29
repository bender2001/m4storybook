import type { HTMLMotionProps } from "motion/react";
import type { ReactNode } from "react";

/**
 * M3 Material Symbols. Variable-font icon wrapper that paints a glyph
 * from Google's Material Symbols font (FILL / wght / GRAD / opsz axes).
 * Distinct from `Icon` — that wrapper paints inline SVG, this one
 * paints a font ligature so the same glyph can morph between filled /
 * weight / grade / optical-size states without swapping the source.
 *
 * https://m3.material.io/styles/icons/applying-icons
 *
 * Style axis (font-family):
 *  - outlined : default M3 outlined treatment
 *  - rounded  : softer, brand-friendly geometry
 *  - sharp    : sharper, technical geometry
 *
 * Color treatment (mirrors Icon):
 *  - standard  : on-surface
 *  - primary   : primary
 *  - filled    : primary-container fill + on-primary-container glyph
 *  - tonal    : secondary-container fill + on-secondary-container glyph
 *  - outlined-box : transparent + 1dp outline + on-surface glyph
 *  - error    : error role
 */
export type MaterialIconStyle = "outlined" | "rounded" | "sharp";

export type MaterialIconVariant =
  | "standard"
  | "primary"
  | "filled"
  | "tonal"
  | "outlined-box"
  | "error";

/**
 * Size scale. Each size maps the M3 optical-size axis to the right
 * dp value so the glyph keeps its drawn weight instead of being
 * naively scaled.
 *
 *  - sm = 20dp glyph in a 24dp box (opsz 20)
 *  - md = 24dp glyph in a 24dp box (opsz 24, M3 default)
 *  - lg = 40dp glyph in a 48dp box (opsz 40)
 */
export type MaterialIconSize = "sm" | "md" | "lg";

/**
 * Visual state. `selected` paints the on-secondary-container role and
 * automatically toggles the FILL axis to 1 (M3 selected glyphs are
 * filled). `disabled` fades to opacity 0.38. `error` swaps the glyph
 * color to the error role.
 */
export type MaterialIconState = "default" | "selected" | "disabled" | "error";

type OwnKey =
  | "name"
  | "style"
  | "fontStyle"
  | "iconStyle"
  | "variant"
  | "size"
  | "state"
  | "fill"
  | "weight"
  | "grade"
  | "label"
  | "decorative"
  | "selected"
  | "disabled"
  | "leadingLabel"
  | "trailingLabel"
  | "interactive"
  | "onActivate"
  | "children"
  | "aria-label"
  | "aria-pressed";

export interface MaterialIconProps
  extends Omit<HTMLMotionProps<"span">, "ref" | OwnKey> {
  /** Symbol name (font ligature). e.g. "favorite", "home", "search". */
  name: string;
  /** Font-family axis. Defaults to `outlined`. */
  iconStyle?: MaterialIconStyle;
  variant?: MaterialIconVariant;
  size?: MaterialIconSize;
  /** Visual state. */
  state?: MaterialIconState;
  /** FILL axis 0 (outlined glyph) or 1 (filled glyph). Defaults to 0. */
  fill?: 0 | 1;
  /** Weight axis. M3 supports 100..700, defaults to 400. */
  weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700;
  /** Grade axis. M3 supports -25 (light) ..0 .. 200 (dark). Defaults to 0. */
  grade?: -25 | 0 | 200;
  /**
   * Accessible label. When set, the icon is announced as `role="img"`
   * with `aria-label`. When unset, the icon is treated as decorative
   * (`aria-hidden="true"`) and the ligature text is hidden from AT.
   */
  label?: string;
  /** Force decorative even when `label` is set. */
  decorative?: boolean;
  /** Inline label rendered to the left of the glyph (label-l type). */
  leadingLabel?: ReactNode;
  /** Inline label rendered to the right of the glyph (label-l type). */
  trailingLabel?: ReactNode;
  /**
   * Promotes the wrapper to a focusable, keyboard-activatable affordance.
   * Used in toolbar slots where the glyph is the only affordance but a
   * full IconButton would be too heavy.
   */
  interactive?: boolean;
  /** Selected state. Implies `state="selected"` if not explicitly set. */
  selected?: boolean;
  /** Disabled state. Implies `state="disabled"` if not explicitly set. */
  disabled?: boolean;
  /** Activation handler (Enter/Space/click). Fires only when interactive. */
  onActivate?: () => void;
}
