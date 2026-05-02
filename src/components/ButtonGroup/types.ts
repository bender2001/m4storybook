import type { HTMLAttributes, ReactNode } from "react";
import type { ButtonColor } from "../Button/types";

export type ButtonGroupVariant = "standard" | "connected";
export type ButtonGroupButtonColor = Extract<
  ButtonColor,
  "filled" | "tonal" | "outlined" | "elevated"
>;
export type ButtonGroupButtonVariant = ButtonGroupButtonColor;
export type ButtonGroupSize = "xs" | "s" | "m" | "l" | "xl";
export type ButtonGroupShape = "round" | "square";
export type ButtonGroupSelectionMode = "none" | "single" | "multi";
export type ButtonGroupWidth = "narrow" | "default" | "wide";

export interface ButtonGroupOption {
  value: string;
  label?: ReactNode;
  icon?: ReactNode;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  disabled?: boolean;
  /** Button/toggle-button color style used by this option. */
  buttonColor?: ButtonGroupButtonColor;
  /** @deprecated Use `buttonColor`. */
  buttonVariant?: ButtonGroupButtonColor;
  width?: ButtonGroupWidth;
  /** Required when an icon-only option has no visible label. */
  ariaLabel?: string;
}

export interface ButtonGroupProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  /** Buttons or icon buttons in the group. */
  options: ButtonGroupOption[];
  /** Material group variant. */
  variant?: ButtonGroupVariant;
  /** Default button/toggle-button color style for options. */
  buttonColor?: ButtonGroupButtonColor;
  /** @deprecated Use `buttonColor`. */
  buttonVariant?: ButtonGroupButtonColor;
  /** Action-only, single-select, multi-select, or selection-required behavior. */
  selectionMode?: ButtonGroupSelectionMode;
  selectionRequired?: boolean;
  /** Controlled selected value(s). string for single, string[] for multi. */
  value?: string | string[] | null;
  /** Uncontrolled initial value. */
  defaultValue?: string | string[] | null;
  /** Fires whenever the selected value(s) change. */
  onChange?: (next: string | string[] | null) => void;
  size?: ButtonGroupSize;
  shape?: ButtonGroupShape;
  disabled?: boolean;
  /** Accessible name for the group itself (rendered as `aria-label`). */
  "aria-label"?: string;
}
