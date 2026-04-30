import type { TextareaHTMLAttributes, ReactNode } from "react";

/**
 * Visual variant. TextareaAutosize is the unstyled MUI primitive
 * (https://mui.com/material-ui/react-textarea-autosize/) that grows
 * a `<textarea>` to fit its content between a `minRows` floor and a
 * `maxRows` ceiling. M3 has no first-class autosize textarea
 * component, so the slice re-skins the surface onto the M3 text-field
 * tokens. Variants paint the tray five ways:
 *
 *   - standard : surface-container-highest + elevation 0 + shape-xs.
 *                Filled M3 text-field default — bottom indicator
 *                grows from on-surface-variant to primary on focus.
 *   - tonal    : secondary-container + elevation 0.
 *   - outlined : transparent fill + 1dp outline border that morphs to
 *                2dp primary on focus and 2dp error on error.
 *   - text     : transparent fill + no border + elevation 0.
 *   - elevated : surface-container-low + elevation 3 (high-emphasis
 *                editor surface that lifts above other content).
 */
export type TextareaAutosizeVariant =
  | "standard"
  | "tonal"
  | "outlined"
  | "text"
  | "elevated";

/**
 * Density preset. Drives padding, gap, type role, and the resting
 * minimum height before autosize kicks in.
 *
 *   - sm : 40dp tray, body-s typography
 *   - md : 56dp tray, body-m typography (M3 default)
 *   - lg : 72dp tray, body-l typography
 */
export type TextareaAutosizeSize = "sm" | "md" | "lg";

/**
 * Corner shape token. Default = `xs` (4dp) — matches the M3
 * text-field surface. Full shape scale is exposed for token bending.
 */
export type TextareaAutosizeShape =
  | "none"
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "full";

type TextareaOwnKey =
  | "value"
  | "defaultValue"
  | "onChange"
  | "size"
  | "rows";

export interface TextareaAutosizeProps
  extends Omit<
    TextareaHTMLAttributes<HTMLTextAreaElement>,
    TextareaOwnKey
  > {
  /** Visual variant. Default `standard` (M3 filled text-field surface). */
  variant?: TextareaAutosizeVariant;
  /** Density / typography preset. Default `md`. */
  size?: TextareaAutosizeSize;
  /** Corner shape token. Default `xs` (4dp per M3 text-field surface). */
  shape?: TextareaAutosizeShape;
  /**
   * Minimum visible row count. The textarea never shrinks below this
   * many text rows. Mirrors MUI TextareaAutosize. Default `1`.
   */
  minRows?: number;
  /**
   * Maximum visible row count. When the content exceeds the ceiling
   * the textarea stops growing and a vertical scrollbar appears.
   * Defaults to unbounded.
   */
  maxRows?: number;
  /** Controlled value. */
  value?: string;
  /** Initial value when uncontrolled. */
  defaultValue?: string;
  /** Fires whenever the textarea value changes (passes the raw string). */
  onChange?: (value: string) => void;
  /** Disable interaction (no keyboard focus, dimmed to 0.38 opacity). */
  disabled?: boolean;
  /** Error treatment: paints the tray in error-container + aria-invalid. */
  error?: boolean;
  /**
   * Mark the surface as the active editor target. Adds aria-selected
   * and paints the secondary-container fill on the standard variant.
   */
  selected?: boolean;
  /** Optional label rendered above the tray as label-l typography. */
  label?: ReactNode;
  /** Optional helper text rendered beneath the tray as body-s. */
  helperText?: ReactNode;
  /** Leading icon slot — rendered to the start of the tray (24dp). */
  leadingIcon?: ReactNode;
  /** Trailing icon slot — rendered to the end of the tray (24dp). */
  trailingIcon?: ReactNode;
  /** Aliased `aria-label`. */
  ariaLabel?: string;
  /** Aliased `aria-labelledby`. */
  ariaLabelledBy?: string;
  /** Aliased `aria-describedby`. Falls back to the helper-text id. */
  ariaDescribedBy?: string;
}
