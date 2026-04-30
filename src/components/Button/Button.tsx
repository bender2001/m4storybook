import { forwardRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";
import { shapeMorphTransition, shapePx, springs } from "@/motion/presets";
import { stateLayerOpacity } from "@/tokens/motion";
import { anatomy, variantClasses, stateLayerClasses, sizeClasses } from "./anatomy";
import type { ButtonProps } from "./types";

export type { ButtonProps, ButtonVariant, ButtonSize } from "./types";

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
      selected,
      type = "button",
      onPointerEnter,
      onPointerLeave,
      onPointerDown,
      onPointerUp,
      onFocus,
      onBlur,
      ...rest
    },
    ref,
  ) {
    const reduced = useReducedMotion();
    const [hovered, setHovered] = useState(false);
    const [focused, setFocused] = useState(false);
    const [pressed, setPressed] = useState(false);

    const stateLayer =
      pressed
        ? stateLayerOpacity.pressed
        : focused
          ? stateLayerOpacity.focus
          : hovered
            ? stateLayerOpacity.hover
            : 0;

    // M3 Expressive shape morph: container squares up one shape step
    // when pressed (full pill → shape-lg). Driven by motion/react so
    // the corner spring-overshoots on release, matching the spec.
    const radius = pressed ? shapePx.lg : shapePx.full;

    return (
      <motion.button
        ref={ref}
        type={type}
        disabled={disabled}
        aria-pressed={selected}
        initial={false}
        animate={{ borderRadius: radius }}
        whileHover={disabled || reduced ? undefined : { scale: 1.02 }}
        whileTap={disabled || reduced ? undefined : { scale: 0.97 }}
        transition={
          reduced
            ? { duration: 0 }
            : { default: springs.springy, borderRadius: shapeMorphTransition }
        }
        onPointerEnter={(e) => {
          setHovered(true);
          onPointerEnter?.(e);
        }}
        onPointerLeave={(e) => {
          setHovered(false);
          setPressed(false);
          onPointerLeave?.(e);
        }}
        onPointerDown={(e) => {
          setPressed(true);
          onPointerDown?.(e);
        }}
        onPointerUp={(e) => {
          setPressed(false);
          onPointerUp?.(e);
        }}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        className={cn(
          anatomy.root,
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...rest}
      >
        <span
          aria-hidden
          data-state-layer
          className={cn(anatomy.stateLayer, stateLayerClasses[variant])}
          style={{ opacity: disabled ? 0 : stateLayer }}
        />
        {startIcon ? (
          <span aria-hidden className={anatomy.icon}>
            {startIcon}
          </span>
        ) : null}
        <span className={anatomy.label}>{children}</span>
        {endIcon ? (
          <span aria-hidden className={anatomy.icon}>
            {endIcon}
          </span>
        ) : null}
      </motion.button>
    );
  },
);
