import type { InputHTMLAttributes, ReactNode } from "react";

export type SwitchSize = "sm" | "md" | "lg";

/**
 * M3 Switch ships a single Expressive treatment, but we expose a
 * `variant` prop so the component library mirrors the rest of the
 * Inputs alphabet. `filled` is the default M3 Expressive treatment
 * (filled track that swaps roles when selected). `outlined` keeps
 * the unselected track transparent with an outline so it reads as
 * lower-emphasis on dense surfaces.
 */
export type SwitchVariant = "filled" | "outlined";

export interface SwitchProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "size" | "type" | "onChange" | "checked" | "defaultChecked"
  > {
  /** Controlled checked state. */
  checked?: boolean;
  /** Uncontrolled initial checked state. */
  defaultChecked?: boolean;
  /** Fires whenever the switch toggles. */
  onChange?: (next: boolean) => void;
  /** Visual size. */
  size?: SwitchSize;
  /** `filled` (default) or `outlined`. */
  variant?: SwitchVariant;
  /** Optional label rendered next to the track. */
  label?: ReactNode;
  /** Renders the label on the left side of the track. */
  labelPlacement?: "start" | "end";
  /** Helper text rendered beneath the label. */
  helperText?: ReactNode;
  /** Icon shown inside the handle when the switch is on. */
  selectedIcon?: ReactNode;
  /** Icon shown inside the handle when the switch is off. */
  unselectedIcon?: ReactNode;
  /** Error state. Swaps role colors to the error palette. */
  error?: boolean;
}
