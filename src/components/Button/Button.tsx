import { forwardRef, type ReactNode } from "react";
import { motion, type HTMLMotionProps } from "motion/react";
import { cn } from "@/lib/cn";
import { springs } from "@/motion/presets";

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
  children?: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  filled:
    "bg-primary text-on-primary shadow-elevation-0 hover:shadow-elevation-1 disabled:bg-on-surface/[0.12] disabled:text-on-surface/[0.38] disabled:shadow-elevation-0",
  tonal:
    "bg-secondary-container text-on-secondary-container shadow-elevation-0 hover:shadow-elevation-1 disabled:bg-on-surface/[0.12] disabled:text-on-surface/[0.38] disabled:shadow-elevation-0",
  outlined:
    "bg-transparent text-primary border border-outline hover:border-primary disabled:text-on-surface/[0.38] disabled:border-on-surface/[0.12]",
  text: "bg-transparent text-primary disabled:text-on-surface/[0.38]",
  elevated:
    "bg-surface-container-low text-primary shadow-elevation-1 hover:shadow-elevation-2 disabled:bg-on-surface/[0.12] disabled:text-on-surface/[0.38] disabled:shadow-elevation-0",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-label-m gap-1.5",
  md: "h-10 px-6 text-label-l gap-2",
  lg: "h-14 px-8 text-title-m gap-2.5",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = "filled",
      size = "md",
      startIcon,
      endIcon,
      className,
      children,
      disabled,
      type = "button",
      ...rest
    },
    ref,
  ) {
    return (
      <motion.button
        ref={ref}
        type={type}
        disabled={disabled}
        whileHover={disabled ? undefined : { scale: 1.02 }}
        whileTap={disabled ? undefined : { scale: 0.97 }}
        transition={springs.springy}
        className={cn(
          "relative inline-flex select-none items-center justify-center rounded-shape-full font-medium",
          "outline-none transition-[box-shadow,background-color,border-color] duration-medium2 ease-emphasized",
          "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
          "disabled:cursor-not-allowed",
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...rest}
      >
        {startIcon ? (
          <span aria-hidden className="inline-flex items-center">
            {startIcon}
          </span>
        ) : null}
        <span>{children}</span>
        {endIcon ? (
          <span aria-hidden className="inline-flex items-center">
            {endIcon}
          </span>
        ) : null}
      </motion.button>
    );
  },
);
