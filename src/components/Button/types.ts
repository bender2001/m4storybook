import type { ReactNode } from "react";
import type { HTMLMotionProps } from "motion/react";

export type ButtonVariant =
  | "filled"
  | "tonal"
  | "outlined"
  | "text"
  | "elevated";

export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps
  extends Omit<HTMLMotionProps<"button">, "ref" | "children"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  /**
   * When true, renders as the selected variant of the button (slightly
   * darker container, used by ButtonGroup and Toggle Button).
   */
  selected?: boolean;
  children?: ReactNode;
}
