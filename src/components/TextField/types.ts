import type { InputHTMLAttributes, ReactNode } from "react";

/**
 * M3 Text Field variants. The two M3 specs are `filled` (default,
 * surface-container-highest tray with a bottom indicator) and
 * `outlined` (transparent tray with a 1dp outline that morphs to
 * 2dp primary on focus + cuts through the floating label).
 */
export type TextFieldVariant = "filled" | "outlined";

/**
 * Density:
 *  - sm  = 40dp  (compact, e.g. inline filters / data tables)
 *  - md  = 56dp  (M3 default)
 *  - lg  = 72dp  (comfortable, e.g. forms on wide marketing pages)
 */
export type TextFieldSize = "sm" | "md" | "lg";

export interface TextFieldProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "size" | "value" | "defaultValue" | "onChange"
  > {
  /** Floating label (also used as the control's accessible name). */
  label?: string;
  /** Controlled value. */
  value?: string;
  /** Initial value when uncontrolled. */
  defaultValue?: string;
  /** Fires whenever the input value changes. */
  onChange?: (value: string) => void;
  /** `filled` (M3 default) or `outlined`. */
  variant?: TextFieldVariant;
  /** Visual size / density. */
  size?: TextFieldSize;
  /** Disabled state. Suppresses interaction + state-layer. */
  disabled?: boolean;
  /** Error state. Swaps role colors to the error palette. */
  error?: boolean;
  /** Helper text rendered beneath the field. */
  helperText?: ReactNode;
  /** Optional leading icon (24dp slot). */
  leadingIcon?: ReactNode;
  /** Optional trailing icon (24dp slot). */
  trailingIcon?: ReactNode;
  /** Stable id; auto-generated when omitted. */
  id?: string;
  /** Custom className passed to the root wrapper. */
  className?: string;
}
