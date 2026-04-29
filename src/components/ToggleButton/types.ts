import type { ReactNode } from "react";
import type { HTMLMotionProps } from "motion/react";
import type { ButtonSize, ButtonVariant } from "../Button/types";

/**
 * Toggle Button variants follow the standard M3 Button surface roles.
 * M3 Expressive Toggle Buttons morph from a fully-rounded shape at rest
 * to a more squared (shape-md) container when selected, paired with the
 * secondary-container role for tonal emphasis.
 */
export type ToggleButtonVariant = Extract<
  ButtonVariant,
  "filled" | "tonal" | "outlined" | "text" | "elevated"
>;

export type ToggleButtonSize = ButtonSize;

export interface ToggleButtonProps
  extends Omit<
    HTMLMotionProps<"button">,
    "ref" | "children" | "onChange" | "value" | "defaultValue"
  > {
  variant?: ToggleButtonVariant;
  size?: ToggleButtonSize;
  /** Controlled selection state. */
  selected?: boolean;
  /** Uncontrolled initial selection state. */
  defaultSelected?: boolean;
  /** Fires when the toggle state changes. */
  onChange?: (selected: boolean) => void;
  /** Optional value associated with the toggle, surfaced via data-value. */
  value?: string;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  children?: ReactNode;
}
