import { forwardRef, useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { bouncyPress, shapeMorphTransition, springs } from "@/motion/presets";
import { cn } from "@/lib/cn";
import { stateLayerOpacity } from "@/tokens/motion";
import { IconAxisContext } from "@/components/MaterialIcons/iconAxisContext";
import {
  anatomy,
  defaultColorClasses,
  paddingClasses,
  radiusPx,
  sizeClasses,
  stateLayerClasses,
  toggleColorClasses,
  toggleSelectedStateLayerClasses,
  toggleStateLayerClasses,
} from "./anatomy";
import type { ButtonProps, ButtonToggleColor } from "./types";

export type {
  ButtonColor,
  ButtonProps,
  ButtonSize,
  ButtonToggleColor,
  ButtonVariant,
} from "./types";

const resolveToggleColor = (color: ButtonProps["color"]): ButtonToggleColor =>
  color === "text" || color === undefined ? "filled" : color;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = "default",
      color = "filled",
      size = "md",
      startIcon,
      endIcon,
      className,
      children,
      disabled,
      softDisabled,
      selected,
      type = "button",
      onClick,
      onKeyDown,
      onKeyUp,
      onPointerEnter,
      onPointerLeave,
      onPointerDown,
      onPointerUp,
      onPointerCancel,
      onFocus,
      onBlur,
      ...rest
    },
    ref,
  ) {
    const reduced = useReducedMotion();
    const isDisabled = disabled || softDisabled;
    const isToggle = variant === "toggle";
    const isSelected = isToggle && Boolean(selected);
    const toggleColor = resolveToggleColor(color);
    const resolvedColor = isToggle ? toggleColor : color;
    const [hovered, setHovered] = useState(false);
    const [focused, setFocused] = useState(false);
    const [pressed, setPressed] = useState(false);

    const stateLayer = isDisabled
      ? 0
      : pressed
        ? stateLayerOpacity.pressed
        : focused
          ? stateLayerOpacity.focus
          : hovered
            ? stateLayerOpacity.hover
            : 0;

    const colorClass = isToggle
      ? toggleColorClasses[toggleColor][isSelected ? "selected" : "unselected"]
      : defaultColorClasses[color];
    const stateLayerClass = isToggle
      ? isSelected
        ? toggleSelectedStateLayerClasses[toggleColor]
        : toggleStateLayerClasses[toggleColor]
      : stateLayerClasses[color];
    const radius = pressed
      ? radiusPx[size].pressed
      : isSelected
        ? radiusPx[size].toggle
        : radiusPx[size].default;

    const hasStartIcon = startIcon !== undefined && startIcon !== null;
    const hasEndIcon = endIcon !== undefined && endIcon !== null;
    const hasLabel = children !== undefined && children !== null;
    const iconPlacement =
      hasStartIcon && hasEndIcon
        ? "bothIcons"
        : hasStartIcon
          ? "leadingIcon"
          : hasEndIcon
            ? "trailingIcon"
            : "labelOnly";

    // M3 Expressive variable-icon axis hints: hover/pressed → FILL 1,
    // selected → wght 700. Stable identity so MaterialIcon children
    // don't re-mount their motion values when unrelated state flips.
    const axisHints = useMemo(
      () => ({
        hovered: !isDisabled && (hovered || pressed),
        selected: !isDisabled && isSelected,
      }),
      [isDisabled, hovered, isSelected, pressed],
    );

    return (
      <motion.button
        ref={ref}
        type={type}
        disabled={disabled}
        aria-disabled={softDisabled || undefined}
        aria-pressed={isToggle ? isSelected : undefined}
        data-disabled={isDisabled || undefined}
        data-variant={variant}
        data-color={resolvedColor}
        data-size={size}
        initial={false}
        animate={{ borderRadius: radius }}
        whileTap={isDisabled || reduced ? undefined : { scale: 0.97 }}
        transition={
          reduced
            ? { duration: 0 }
            : {
                default: springs.springy,
                borderRadius: shapeMorphTransition,
                scale: bouncyPress,
              }
        }
        onClick={(e) => {
          if (softDisabled) {
            e.preventDefault();
            e.stopPropagation();
            return;
          }
          onClick?.(e);
        }}
        onKeyDown={(e) => {
          onKeyDown?.(e);
          if (e.defaultPrevented) return;
          if (softDisabled && (e.key === " " || e.key === "Enter")) {
            e.preventDefault();
            return;
          }
          if (!isDisabled && (e.key === " " || e.key === "Enter")) {
            setPressed(true);
          }
        }}
        onKeyUp={(e) => {
          setPressed(false);
          onKeyUp?.(e);
        }}
        onPointerEnter={(e) => {
          if (!isDisabled) setHovered(true);
          onPointerEnter?.(e);
        }}
        onPointerLeave={(e) => {
          setHovered(false);
          setPressed(false);
          onPointerLeave?.(e);
        }}
        onPointerDown={(e) => {
          if (!isDisabled) setPressed(true);
          onPointerDown?.(e);
        }}
        onPointerUp={(e) => {
          setPressed(false);
          onPointerUp?.(e);
        }}
        onPointerCancel={(e) => {
          setPressed(false);
          onPointerCancel?.(e);
        }}
        onFocus={(e) => {
          if (!isDisabled) setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          setPressed(false);
          onBlur?.(e);
        }}
        className={cn(
          anatomy.root,
          colorClass,
          sizeClasses[size],
          paddingClasses[resolvedColor][size][iconPlacement],
          className,
        )}
        {...rest}
      >
        <span
          aria-hidden
          data-state-layer
          className={cn(anatomy.stateLayer, stateLayerClass)}
          style={{ opacity: stateLayer }}
        />
        <IconAxisContext.Provider value={axisHints}>
          {hasStartIcon ? (
            <span aria-hidden data-slot="leading-icon" className={anatomy.icon}>
              {startIcon}
            </span>
          ) : null}
          {hasLabel ? (
            <span data-slot="label" className={anatomy.label}>
              {children}
            </span>
          ) : null}
          {hasEndIcon ? (
            <span aria-hidden data-slot="trailing-icon" className={anatomy.icon}>
              {endIcon}
            </span>
          ) : null}
        </IconAxisContext.Provider>
      </motion.button>
    );
  },
);
