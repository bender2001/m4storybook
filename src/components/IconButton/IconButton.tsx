import { forwardRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";
import { springs } from "@/motion/presets";
import { stateLayerOpacity } from "@/tokens/motion";
import {
  anatomy,
  disabledClasses,
  disabledFilledClasses,
  sizeClasses,
  variantClasses,
} from "./anatomy";
import type { IconButtonProps } from "./types";

export type {
  IconButtonProps,
  IconButtonSize,
  IconButtonVariant,
} from "./types";

/**
 * M3 Expressive Icon Button. Spec lives at
 * https://m3.material.io/components/icon-buttons/specs.
 *
 * - 4 variants: filled / tonal / outlined / standard.
 * - 3 sizes: sm (32dp / 18dp icon), md (40dp / 24dp), lg (56dp / 28dp).
 * - State-layer opacities: hover 0.08, focus/pressed 0.10.
 * - Toggleable: when `selected` is defined, exposes `aria-pressed` and
 *   morphs the corner radius from circular (rest) to a squircle
 *   (selected) per M3 Expressive shape-morph spec.
 * - Motion: springy press scale via motion/react (collapses under
 *   reduced motion).
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    {
      variant = "standard",
      size = "md",
      icon,
      selected,
      disabled = false,
      type = "button",
      className,
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

    const stateLayer = disabled
      ? 0
      : pressed
        ? stateLayerOpacity.pressed
        : focused
          ? stateLayerOpacity.focus
          : hovered
            ? stateLayerOpacity.hover
            : 0;

    const variantStyles = variantClasses[variant];
    const sizes = sizeClasses[size];

    const isToggle = selected !== undefined;
    const isSelected = selected === true;

    const containerStyles = isSelected
      ? variantStyles.selected
      : variantStyles.rest;

    const stateLayerStyles = isSelected
      ? variantStyles.selectedStateLayer
      : variantStyles.stateLayer;

    // Disabled treatment differs by variant — filled/tonal keep a
    // visible container; outlined/standard fade to transparent.
    const disabledTreatment =
      variant === "filled" || variant === "tonal"
        ? disabledFilledClasses
        : disabledClasses;

    // Shape morph: rest = circle (shape-full), selected = squircle.
    // Outlined toggles to inverse-surface so its squircle "fills"
    // visually on selection.
    const radius = isSelected ? sizes.selectedRadius : "rounded-shape-full";

    return (
      <motion.button
        ref={ref}
        type={type}
        disabled={disabled}
        aria-pressed={isToggle ? isSelected : undefined}
        data-icon-button
        data-variant={variant}
        data-size={size}
        data-toggle={isToggle || undefined}
        data-selected={isSelected || undefined}
        data-disabled={disabled || undefined}
        whileHover={disabled || reduced ? undefined : { scale: 1.06 }}
        whileTap={disabled || reduced ? undefined : { scale: 0.92 }}
        transition={reduced ? { duration: 0 } : springs.springy}
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
          setPressed(false);
          onBlur?.(e);
        }}
        className={cn(
          anatomy.root,
          radius,
          sizes.container,
          disabled ? disabledTreatment : containerStyles,
          className,
        )}
        {...rest}
      >
        <span
          aria-hidden
          data-state-layer
          className={cn(anatomy.stateLayer, stateLayerStyles)}
          style={{ opacity: stateLayer }}
        />
        <span
          aria-hidden
          data-icon-button-icon
          className={cn(anatomy.icon, sizes.icon)}
        >
          {icon}
        </span>
      </motion.button>
    );
  },
);
