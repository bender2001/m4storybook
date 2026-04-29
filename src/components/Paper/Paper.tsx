import {
  forwardRef,
  useCallback,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";
import { springs } from "@/motion/presets";
import { stateLayerOpacity } from "@/tokens/motion";
import {
  anatomy,
  elevationClasses,
  morphTarget,
  shapeClasses,
  sizeClasses,
  variantClasses,
} from "./anatomy";
import type { PaperProps } from "./types";

export type {
  PaperElevation,
  PaperProps,
  PaperShape,
  PaperSize,
  PaperVariant,
} from "./types";

/**
 * M3 Surface primitive. Three primary M3 variants (elevated / filled /
 * outlined) plus an MUI-style tonal variant mapped to the secondary-
 * container role. Optional interactive mode exposes a focusable
 * surface with state layer + Expressive shape morph + elevation lift
 * on hover. Composes underneath Card / AppBar / Dialog / Menu.
 */
export const Paper = forwardRef<HTMLDivElement, PaperProps>(function Paper(
  {
    variant = "elevated",
    size = "md",
    shape = "md",
    elevation = 1,
    interactive: interactiveProp,
    selected = false,
    disabled = false,
    leadingIcon,
    trailingIcon,
    label,
    children,
    className,
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
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [pressed, setPressed] = useState(false);

  const interactive = interactiveProp ?? Boolean(onClick);
  const styles = variantClasses[variant];
  const sizes = sizeClasses[size];

  // M3 Expressive shape morph: interactive papers morph one shape
  // step up while hovered/focused/pressed. Static surfaces keep their
  // assigned shape.
  const morph = interactive && !disabled && (hovered || focused || pressed);
  const radiusClass = morph ? morphTarget[shape] : shapeClasses[shape];

  const stateLayer =
    !interactive || disabled
      ? 0
      : pressed
        ? stateLayerOpacity.pressed
        : focused
          ? stateLayerOpacity.focus
          : hovered
            ? stateLayerOpacity.hover
            : 0;

  const handleClick = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      if (disabled) return;
      onClick?.(event);
    },
    [disabled, onClick],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(event);
      if (!interactive || disabled) return;
      if (event.defaultPrevented) return;
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        (event.currentTarget as HTMLDivElement).click();
        if (event.key === " ") setPressed(true);
      }
    },
    [disabled, interactive, onKeyDown],
  );

  // Elevation paints only on the elevated variant. Selected surfaces
  // hold their resting elevation (M3 selected-state guidance).
  const elevationClass =
    variant === "elevated" ? elevationClasses[elevation] : undefined;

  // Selected fill overrides the resting variant fill but keeps the
  // surface's shape + elevation behavior.
  const fillClass = selected ? styles.selected : styles.rest;

  const role = interactive ? "button" : undefined;
  const tabIndex = interactive && !disabled ? 0 : undefined;

  const showHeader = Boolean(label || leadingIcon || trailingIcon);

  return (
    <motion.div
      ref={ref}
      role={role}
      aria-label={interactive ? ariaLabel : undefined}
      aria-disabled={interactive && disabled ? true : undefined}
      aria-selected={interactive ? selected || undefined : undefined}
      data-variant={variant}
      data-size={size}
      data-shape={shape}
      data-elevation={variant === "elevated" ? elevation : undefined}
      data-interactive={interactive || undefined}
      data-selected={selected || undefined}
      data-disabled={disabled || undefined}
      data-state-layer-opacity={interactive ? stateLayer : undefined}
      tabIndex={tabIndex}
      whileHover={
        interactive && !disabled && !reduced ? { y: -1 } : undefined
      }
      whileTap={
        interactive && !disabled && !reduced ? { y: 0, scale: 0.99 } : undefined
      }
      transition={reduced ? { duration: 0 } : springs.gentle}
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
        if (interactive && !disabled) setPressed(true);
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
        anatomy.rootBlock,
        radiusClass,
        fillClass,
        elevationClass,
        sizes.padding,
        sizes.gap,
        sizes.minHeight,
        interactive && !disabled && anatomy.rootInteractive,
        interactive && !disabled && styles.hover,
        disabled && anatomy.rootDisabled,
        className,
      )}
      {...rest}
    >
      {interactive ? (
        <span
          aria-hidden
          data-slot="state-layer"
          className={cn(anatomy.stateLayer, styles.stateLayer)}
          style={{ opacity: stateLayer }}
        />
      ) : null}
      {showHeader ? (
        <div data-slot="header" className={anatomy.header}>
          {leadingIcon ? (
            <span aria-hidden data-slot="leading-icon" className={anatomy.icon}>
              {leadingIcon}
            </span>
          ) : null}
          {label ? <span data-slot="label">{label}</span> : null}
          {trailingIcon ? (
            <span
              aria-hidden
              data-slot="trailing-icon"
              className={cn(anatomy.icon, "ml-auto")}
            >
              {trailingIcon}
            </span>
          ) : null}
        </div>
      ) : null}
      {children ? (
        <div data-slot="body" className={anatomy.body}>
          {children}
        </div>
      ) : null}
    </motion.div>
  );
});
