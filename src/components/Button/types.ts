import type { ReactNode } from "react";
import type { HTMLMotionProps } from "motion/react";

export type ButtonVariant = "default" | "toggle";

export type ButtonColor =
  | "filled"
  | "tonal"
  | "outlined"
  | "text"
  | "elevated";

export type ButtonToggleColor = Exclude<ButtonColor, "text">;

export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps
  extends Omit<HTMLMotionProps<"button">, "ref" | "children" | "color"> {
  variant?: ButtonVariant;
  color?: ButtonColor;
  size?: ButtonSize;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  /**
   * Renders disabled styling and aria-disabled while keeping the button
   * focusable for discoverable disabled toolbar actions.
   */
  softDisabled?: boolean;
  /**
   * When `variant="toggle"`, renders the selected treatment and exposes
   * pressed semantics.
   */
  selected?: boolean;
  children?: ReactNode;
}
