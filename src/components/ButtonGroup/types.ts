import type { HTMLAttributes, ReactNode } from "react";
import type { ButtonSize, ButtonVariant } from "../Button/types";

export type ButtonGroupVariant = Extract<
  ButtonVariant,
  "filled" | "tonal" | "outlined" | "text" | "elevated"
>;

export type ButtonGroupSize = ButtonSize;

export type ButtonGroupOrientation = "horizontal" | "vertical";

export interface ButtonGroupOption {
  value: string;
  label: ReactNode;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  disabled?: boolean;
  /** Optional override for the button's accessible name. */
  ariaLabel?: string;
}

export interface ButtonGroupProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  /** Connected segmented buttons. */
  options: ButtonGroupOption[];
  /** When `single`, exactly one option may be selected; when `multi`, any subset. */
  selectionMode?: "single" | "multi";
  /** Controlled selected value(s). string for single, string[] for multi. */
  value?: string | string[] | null;
  /** Uncontrolled initial value. */
  defaultValue?: string | string[] | null;
  /** Fires whenever the selected value(s) change. */
  onChange?: (next: string | string[] | null) => void;
  variant?: ButtonGroupVariant;
  size?: ButtonGroupSize;
  orientation?: ButtonGroupOrientation;
  disabled?: boolean;
  /** Accessible name for the group itself (rendered as `aria-label`). */
  "aria-label"?: string;
}
