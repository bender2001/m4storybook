import {
  forwardRef,
  useCallback,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";
import {
  bouncyPress,
  shapeMorphTransition,
  shapePx,
  springs,
} from "@/motion/presets";
import { stateLayerOpacity } from "@/tokens/motion";
import {
  anatomy,
  shapeClasses,
  sizeClasses,
  variantClasses,
} from "./anatomy";
import type { ToggleButtonProps } from "./types";

export type {
  ToggleButtonProps,
  ToggleButtonSize,
  ToggleButtonVariant,
} from "./types";

export const ToggleButton = forwardRef<HTMLButtonElement, ToggleButtonProps>(
  function ToggleButton(
    {
      variant = "outlined",
      size = "md",
      selected,
      defaultSelected = false,
      onChange,
      value,
      startIcon,
      endIcon,
      children,
      className,
      disabled,
      type = "button",
      onClick,
      onKeyDown,
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

    const isControlled = selected !== undefined;
    const [internalSelected, setInternalSelected] =
      useState<boolean>(defaultSelected);
    const isSelected = isControlled ? !!selected : internalSelected;

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
            : isSelected
              ? stateLayerOpacity.hover
              : 0;

    const commit = useCallback(
      (next: boolean) => {
        if (!isControlled) setInternalSelected(next);
        onChange?.(next);
      },
      [isControlled, onChange],
    );

    const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
      if (disabled) return;
      onClick?.(event);
      if (event.defaultPrevented) return;
      commit(!isSelected);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented) return;
      // Native <button> already commits on Space/Enter via click; keep
      // explicit press feedback for Space so the state-layer matches the
      // M3 pressed treatment during the keypress window.
      if (event.key === " ") setPressed(true);
    };

    const styles = variantClasses[variant];

    // M3 Expressive shape morph: rest = full pill, selected = shape-md
    // (12dp), pressed nudges one step squarer in either state. Driven
    // through motion/react so the spatial spring overshoots on release.
    const baseRadius = isSelected ? shapePx.md : shapePx.full;
    const pressedRadius = isSelected ? shapePx.sm : shapePx.lg;
    const radius = pressed ? pressedRadius : baseRadius;

    return (
      <motion.button
        ref={ref}
        type={type}
        role="button"
        aria-pressed={isSelected}
        aria-disabled={disabled || undefined}
        aria-label={ariaLabel}
        disabled={disabled}
        data-selected={isSelected || undefined}
        data-variant={variant}
        data-size={size}
        data-value={value}
        initial={false}
        animate={{ borderRadius: radius }}
        whileHover={disabled || reduced ? undefined : { scale: 1.02 }}
        whileTap={disabled || reduced ? undefined : { scale: 0.95 }}
        transition={
          reduced
            ? { duration: 0 }
            : {
                default: springs.springy,
                borderRadius: shapeMorphTransition,
                scale: bouncyPress,
              }
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
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onKeyUp={() => setPressed(false)}
        className={cn(
          anatomy.root,
          sizeClasses[size],
          isSelected ? shapeClasses.selected : shapeClasses.rest,
          isSelected ? styles.selected : styles.rest,
          className,
        )}
        {...rest}
      >
        <span
          aria-hidden
          data-state-layer
          className={cn(anatomy.stateLayer, styles.stateLayer)}
          style={{ opacity: stateLayer }}
        />
        {startIcon ? (
          <span aria-hidden className={anatomy.icon}>
            {startIcon}
          </span>
        ) : null}
        {children !== undefined ? (
          <span className={anatomy.label}>{children}</span>
        ) : null}
        {endIcon ? (
          <span aria-hidden className={anatomy.icon}>
            {endIcon}
          </span>
        ) : null}
      </motion.button>
    );
  },
);
