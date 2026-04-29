import type { ReactNode } from "react";

export type SliderSize = "xs" | "s" | "m" | "l" | "xl";

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
  /** Step granularity for value updates. */
  step?: number;
  /** Render stop indicators for each step. */
  ticks?: boolean;
  /** Show the floating value indicator while interacting. */
  labeled?: boolean;
  /** Format value indicator text + aria-valuetext. */
  valueLabel?: string | ((value: number) => string);
  /** Track / handle size. */
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
  /** Fires on every value update. */
  onInput?: (value: number) => void;
  /** Fires once when the interaction commits. */
  onChange?: (value: number) => void;
  /** Stable id; auto-generated when omitted. */
  id?: string;
  /** Field name for native form submission. */
  name?: string;
  /** Optional aria-label override; otherwise label is used. */
  "aria-label"?: string;
  /** Custom className passed to the root wrapper. */
  className?: string;
}
