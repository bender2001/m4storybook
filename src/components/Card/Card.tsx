import {
  forwardRef,
  useCallback,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";
import { shapeMorphTransition, shapePx, springs } from "@/motion/presets";
import { stateLayerOpacity } from "@/tokens/motion";
import type { ShapeRole } from "@/tokens/shape";
import {
  anatomy,
  elevationClasses,
  morphTarget,
  shapeClasses,
  sizeClasses,
  variantClasses,
} from "./anatomy";
import type { CardProps, CardShape } from "./types";

export type {
  CardElevation,
  CardProps,
  CardShape,
  CardSize,
  CardVariant,
} from "./types";

/**
 * M3 Expressive Card. Three M3 variants (elevated / filled /
 * outlined), six elevation levels, seven shape steps, three density
 * sizes, and a complete header / media / body / actions slot
 * matrix. Interactive cards expose a state layer + Expressive shape
 * morph + elevation lift on hover/focus per the M3 Card spec
 * (https://m3.material.io/components/cards/specs).
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  {
    variant = "elevated",
    size = "md",
    shape = "md",
    elevation = 1,
    interactive: interactiveProp,
    selected = false,
    disabled = false,
    error = false,
    media,
    avatar,
    title,
    subhead,
    headerTrailing,
    actions,
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

  const morph = interactive && !disabled && (hovered || focused || pressed);
  const radiusClass = morph ? morphTarget[shape] : shapeClasses[shape];
  // M3 Expressive shape morph driven by motion/react so the corner
  // springs (with the spatial preset's overshoot) instead of tweening
  // linearly. The Tailwind class above stays as a fallback for
  // pre-hydration paint.
  const morphTargetPxMap: Record<CardShape, ShapeRole> = {
    none: "none",
    xs: "sm",
    sm: "md",
    md: "lg",
    lg: "xl",
    xl: "xl",
    full: "full",
  };
  const radiusPx = morph
    ? shapePx[morphTargetPxMap[shape]]
    : shapePx[shape as ShapeRole];

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

  // Elevation paints only on the elevated variant. Selected cards
  // hold their resting elevation per M3 selected-state guidance.
  const elevationClass =
    variant === "elevated" ? elevationClasses[elevation] : undefined;

  // Resolution priority: error > selected > variant resting fill.
  const fillClass = error
    ? styles.error
    : selected
      ? styles.selected
      : styles.rest;

  const role = interactive ? "button" : undefined;
  const tabIndex = interactive && !disabled ? 0 : undefined;

  const showHeader = Boolean(avatar || title || subhead || headerTrailing);
  const showActions = Boolean(actions);
  const showMedia = Boolean(media);
  const showBody = Boolean(children);

  return (
    <motion.div
      ref={ref}
      role={role}
      aria-label={interactive ? ariaLabel : undefined}
      aria-disabled={interactive && disabled ? true : undefined}
      aria-selected={interactive ? selected || undefined : undefined}
      aria-invalid={error || undefined}
      data-variant={variant}
      data-size={size}
      data-shape={shape}
      data-elevation={variant === "elevated" ? elevation : undefined}
      data-interactive={interactive || undefined}
      data-selected={selected || undefined}
      data-disabled={disabled || undefined}
      data-error={error || undefined}
      data-state-layer-opacity={interactive ? stateLayer : undefined}
      tabIndex={tabIndex}
      initial={false}
      animate={{ borderRadius: radiusPx }}
      whileHover={
        interactive && !disabled && !reduced ? { y: -1 } : undefined
      }
      whileTap={
        interactive && !disabled && !reduced ? { y: 0, scale: 0.99 } : undefined
      }
      transition={
        reduced
          ? { duration: 0 }
          : { default: springs.gentle, borderRadius: shapeMorphTransition }
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
        radiusClass,
        fillClass,
        elevationClass,
        sizes.gap,
        "overflow-hidden",
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

      {showMedia ? (
        <div data-slot="media" className={anatomy.media}>
          {media}
        </div>
      ) : null}

      <div
        data-slot="content"
        className={cn("flex flex-col", sizes.padding, sizes.gap)}
      >
        {showHeader ? (
          <div data-slot="header" className={cn(anatomy.header, sizes.titleGap)}>
            {avatar ? (
              <span data-slot="avatar" className={anatomy.avatar}>
                {avatar}
              </span>
            ) : null}
            {(title || subhead) ? (
              <div data-slot="header-text" className={anatomy.headerText}>
                {title ? (
                  <span data-slot="title" className={anatomy.title}>
                    {title}
                  </span>
                ) : null}
                {subhead ? (
                  <span data-slot="subhead" className={anatomy.subhead}>
                    {subhead}
                  </span>
                ) : null}
              </div>
            ) : null}
            {headerTrailing ? (
              <span data-slot="header-trailing" className={anatomy.trailing}>
                {headerTrailing}
              </span>
            ) : null}
          </div>
        ) : null}

        {showBody ? (
          <div data-slot="body" className={anatomy.body}>
            {children}
          </div>
        ) : null}

        {showActions ? (
          <div data-slot="actions" className={anatomy.actions}>
            {actions}
          </div>
        ) : null}
      </div>
    </motion.div>
  );
});
