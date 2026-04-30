import { forwardRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";
import {
  shapeMorphTransition,
  shapePressedStep,
  shapePx,
  springs,
} from "@/motion/presets";
import { stateLayerOpacity } from "@/tokens/motion";
import type { ShapeRole } from "@/tokens/shape";
import {
  anatomy,
  disabledClasses,
  elevationClasses,
  sizeClasses,
  variantClasses,
} from "./anatomy";
import type { FabProps } from "./types";

export type { FabProps, FabSize, FabVariant } from "./types";

/**
 * M3 Expressive Floating Action Button. Spec lives at
 * https://m3.material.io/components/floating-action-button/specs.
 *
 * - 4 color variants: surface (low-emphasis) / primary / secondary
 *   / tertiary, mapped to the matching container roles.
 * - 3 sizes: sm (40dp), md (56dp), lg (96dp); icon scales 24/24/36dp
 *   and corner radius scales 12/16/28dp.
 * - Extended FAB: when `label` is set with size="md", the FAB
 *   becomes a rectangular pill with leading icon + label-l text.
 * - Elevation: rest=3, hover=4, press=3 (or 1/2/1 when `lowered`).
 * - State-layer opacities: hover 0.08, focus/pressed 0.10.
 * - Motion: springy press scale via motion/react (collapses to 0
 *   under reduced motion).
 */
export const Fab = forwardRef<HTMLButtonElement, FabProps>(function Fab(
  {
    variant = "primary",
    size = "md",
    icon,
    label,
    lowered = false,
    disabled = false,
    type = "button",
    className,
    onPointerEnter,
    onPointerLeave,
    onPointerDown,
    onPointerUp,
    onFocus,
    onBlur,
    "aria-label": ariaLabel,
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

  // Extended FAB only applies on the default (md) size — M3 doesn't
  // define small/large extended treatments.
  const extended = size === "md" && label !== undefined && label !== null;
  const dimensions = extended ? sizes.extended : sizes.container;

  const elevation = disabled
    ? ""
    : lowered
      ? elevationClasses.lowered
      : elevationClasses.default;

  // When extended, fall back to the explicit label as the accessible name.
  const computedAriaLabel =
    ariaLabel ?? (extended ? undefined : typeof label === "string" ? label : undefined);

  // M3 Expressive shape morph on press: corners step down one shape
  // notch (size sm md→sm, md lg→md, lg xl→lg) so the press feels
  // springy and tactile. Driven through motion/react so the radius
  // overshoots on release with the spatial expressive spring.
  const restShape: ShapeRole =
    size === "sm" ? "md" : size === "md" ? "lg" : "xl";
  const radius = pressed
    ? shapePx[shapePressedStep[restShape]]
    : shapePx[restShape];

  return (
    <motion.button
      ref={ref}
      type={type}
      disabled={disabled}
      aria-label={computedAriaLabel}
      data-fab
      data-variant={variant}
      data-size={size}
      data-extended={extended || undefined}
      data-lowered={lowered || undefined}
      data-disabled={disabled || undefined}
      initial={false}
      animate={{ borderRadius: radius }}
      whileHover={disabled || reduced ? undefined : { scale: 1.04 }}
      whileTap={disabled || reduced ? undefined : { scale: 0.94 }}
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
        setPressed(false);
        onBlur?.(e);
      }}
      className={cn(
        anatomy.root,
        sizes.radius,
        dimensions,
        disabled ? disabledClasses : variantStyles.container,
        !disabled && elevation,
        className,
      )}
      {...rest}
    >
      <span
        aria-hidden
        data-state-layer
        className={cn(anatomy.stateLayer, variantStyles.stateLayer)}
        style={{ opacity: stateLayer }}
      />
      <span
        aria-hidden
        data-fab-icon
        className={cn(anatomy.icon, sizes.icon)}
      >
        {icon}
      </span>
      {extended ? (
        <span data-fab-label className={anatomy.label}>
          {label}
        </span>
      ) : null}
    </motion.button>
  );
});
