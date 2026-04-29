import type { ReactNode } from "react";

export type SliderVariant = "continuous" | "discrete";
export type SliderSize = "sm" | "md" | "lg";

export interface SliderProps {
  /** Optional label rendered above the slider. */
  label?: string;
  /** Controlled value. */
  value?: number;
  /** Initial value when uncontrolled. */
  defaultValue?: number;
  /** Inclusive minimum. */
  min?: number;
  /** Inclusive maximum. */
  max?: number;
  /** Step granularity. Used by both continuous and discrete variants. */
  step?: number;
  /** Continuous (default) or discrete with tick stops. */
  variant?: SliderVariant;
  /** Track / handle density. */
  size?: SliderSize;
  /** Disabled state. Suppresses interaction + state-layer. */
  disabled?: boolean;
  /** Error state. Swaps role colors to the error palette. */
  error?: boolean;
  /** Helper text rendered under the track. */
  helperText?: ReactNode;
  /** Optional leading content (e.g. icon or min indicator). */
  leadingIcon?: ReactNode;
  /** Optional trailing content (e.g. icon or max indicator). */
  trailingIcon?: ReactNode;
  /** Show the value bubble above the handle when active. */
  showValueLabel?: boolean;
  /** Format value for the bubble + aria-valuetext. */
  formatValue?: (value: number) => string;
  /** Fires on every step change. */
  onChange?: (value: number) => void;
  /** Fires once at pointer release (commit). */
  onChangeCommitted?: (value: number) => void;
  /** Stable id; auto-generated when omitted. */
  id?: string;
  /** Field name for native form submission. */
  name?: string;
  /** Optional aria-label override; otherwise label is used. */
  "aria-label"?: string;
  /** Custom className passed to the root wrapper. */
  className?: string;
}
