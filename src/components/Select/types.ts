import type { ReactNode } from "react";

export type SelectVariant = "filled" | "outlined";
export type SelectSize = "sm" | "md" | "lg";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  /** Floating label rendered above the field when filled or focused. */
  label?: string;
  /** Available options. */
  options: SelectOption[];
  /** Controlled selected value. */
  value?: string | null;
  /** Initial value when uncontrolled. */
  defaultValue?: string | null;
  /** Fires whenever a different option is committed. */
  onChange?: (value: string | null, option: SelectOption | null) => void;
  /** M3 Text Field variant — `filled` (default) or `outlined`. */
  variant?: SelectVariant;
  /** Container size / density. */
  size?: SelectSize;
  /** Disabled state. Suppresses interaction + state-layer. */
  disabled?: boolean;
  /** Error state. Swaps role colors to the error palette. */
  error?: boolean;
  /** Helper text rendered under the field. */
  helperText?: ReactNode;
  /** Optional leading icon (e.g. country flag). */
  leadingIcon?: ReactNode;
  /** Placeholder text shown when no option is selected. */
  placeholder?: string;
  /** Stable id; auto-generated when omitted. */
  id?: string;
  /** Field name for native form submission. */
  name?: string;
  /** Optional aria-label override; otherwise label is used. */
  "aria-label"?: string;
  /** Custom className passed to the root wrapper. */
  className?: string;
}
