import type { InputHTMLAttributes, ReactNode } from "react";

export type CheckboxSize = "sm" | "md" | "lg";

/**
 * M3 Checkbox specifies a single visual treatment (filled-when-selected,
 * outline-when-rest), but we expose a `variant` prop so the component
 * library mirrors the rest of the Inputs alphabet. `error` paints the
 * outline + selected fill in the error role.
 */
export type CheckboxVariant = "default" | "error";

export interface CheckboxProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "size" | "type" | "onChange" | "checked" | "defaultChecked"
  > {
  /** Controlled checked state. Pass `"indeterminate"` for the mixed state. */
  checked?: boolean | "indeterminate";
  /** Uncontrolled initial checked state. */
  defaultChecked?: boolean | "indeterminate";
  /** Fires whenever the checkbox toggles. */
  onChange?: (next: boolean) => void;
  /** Visual size. M3 keeps the box at 18dp but the hit target scales. */
  size?: CheckboxSize;
  /** `error` paints the outline + fill in the error role. */
  variant?: CheckboxVariant;
  /** Optional label rendered next to the box. */
  label?: ReactNode;
  /** Renders the label on the left side of the box. */
  labelPlacement?: "start" | "end";
  /** Helper text rendered beneath the label. */
  helperText?: ReactNode;
  /** Optional leading icon before the label. */
  startIcon?: ReactNode;
  /** Optional trailing icon after the label. */
  endIcon?: ReactNode;
}
