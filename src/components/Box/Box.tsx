import {
  forwardRef,
  useCallback,
  useMemo,
  useState,
  type ComponentType,
  type ForwardedRef,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import {
  motion,
  useReducedMotion,
  type HTMLMotionProps,
} from "motion/react";
import { cn } from "@/lib/cn";
import { springs } from "@/motion/presets";
import { stateLayerOpacity } from "@/tokens/motion";
import {
  alignClasses,
  anatomy,
  directionClasses,
  displayClasses,
  elevationClasses,
  justifyClasses,
  morphTarget,
  shapeClasses,
  sizeClasses,
  variantClasses,
} from "./anatomy";
import type { BoxProps } from "./types";

export type {
  BoxAlign,
  BoxDirection,
  BoxDisplay,
  BoxElevation,
  BoxJustify,
  BoxProps,
  BoxShape,
  BoxSize,
  BoxVariant,
} from "./types";

/**
 * M3 Box. Token-aware layout primitive that re-skins MUI's Box with
 * the M3 surface / shape / elevation / motion scales. Polymorphic via
 * `as`, supports five surface variants (text / filled / tonal /
 * outlined / elevated), three densities, the full shape token scale,
 * and an optional interactive mode that paints the M3 state layer +
 * morphs the corner shape one notch up while hovered/focused/pressed
 * (M3 Expressive shape morph).
 *
 * Layout props (`display` / `direction` / `align` / `justify`) make
 * the Box useful as a generic layout shell so consumers don't have
 * to reach for raw Tailwind utilities every time.
 */
export const Box = forwardRef<HTMLElement, BoxProps>(function Box(
  {
    as = "div",
    variant = "text",
    size = "md",
    shape = "none",
    elevation = 0,
    display = "block",
    direction = "row",
    align = "stretch",
    justify = "start",
    interactive: interactiveProp,
    selected = false,
    disabled = false,
    error = false,
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
  ref: ForwardedRef<HTMLElement>,
) {
  const reduced = useReducedMotion();
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [pressed, setPressed] = useState(false);

  const interactive = interactiveProp ?? Boolean(onClick);
  const colors = variantClasses[variant];
  const sizes = sizeClasses[size];

  // M3 Expressive shape morph: interactive Boxes morph one shape step
  // up while hovered/focused/pressed.
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
        (event.currentTarget as HTMLElement).click();
        if (event.key === " ") setPressed(true);
      }
    },
    [disabled, interactive, onKeyDown],
  );

  const elevationClass =
    variant === "elevated"
      ? elevationClasses[elevation === 0 ? 1 : elevation]
      : elevation > 0
        ? elevationClasses[elevation]
        : colors.elevation;

  // Selected / error precedence: error > selected > resting.
  const fillClass = error
    ? colors.error
    : selected
      ? colors.selected
      : colors.rest;

  const role = interactive ? "button" : undefined;
  const tabIndex = interactive && !disabled ? 0 : undefined;

  const showHeader = Boolean(label || leadingIcon || trailingIcon);
  const isFlexLike =
    display === "flex" ||
    display === "inline-flex" ||
    display === "grid" ||
    display === "inline-grid";

  // motion.create() is keyed by the polymorphic element so consumers
  // can render Box as `<section>`, `<aside>`, etc. while still getting
  // motion/react animation hooks. The result is cast to the div-shaped
  // motion type so the JSX prop union doesn't explode into every
  // possible intrinsic element.
  const MotionTag = useMemo(
    () =>
      motion.create(
        as as unknown as "div",
      ) as unknown as ComponentType<HTMLMotionProps<"div">>,
    [as],
  );

  return (
    <MotionTag
      ref={ref as ForwardedRef<HTMLDivElement>}
      role={role}
      aria-label={interactive ? ariaLabel : undefined}
      aria-disabled={interactive && disabled ? true : undefined}
      aria-selected={interactive ? selected || undefined : undefined}
      aria-invalid={error || undefined}
      data-component="box"
      data-variant={variant}
      data-size={size}
      data-shape={shape}
      data-elevation={
        variant === "elevated" || elevation > 0 ? elevation : undefined
      }
      data-display={display}
      data-direction={isFlexLike ? direction : undefined}
      data-interactive={interactive || undefined}
      data-selected={selected || undefined}
      data-error={error || undefined}
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
        displayClasses[display],
        isFlexLike && directionClasses[direction],
        isFlexLike && alignClasses[align],
        isFlexLike && justifyClasses[justify],
        sizes.pad,
        sizes.gap,
        sizes.minH,
        radiusClass,
        fillClass,
        colors.border,
        elevationClass,
        interactive && !disabled && anatomy.rootInteractive,
        disabled && anatomy.rootDisabled,
        className,
      )}
      {...rest}
    >
      {interactive ? (
        <span
          aria-hidden
          data-slot="state-layer"
          className={cn(anatomy.stateLayer, colors.stateLayer)}
          style={{ opacity: stateLayer }}
        />
      ) : null}
      {showHeader ? (
        <span data-slot="header" className={anatomy.header}>
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
        </span>
      ) : null}
      {children !== undefined && children !== null ? (
        <span data-slot="body" className={anatomy.body}>
          {children}
        </span>
      ) : null}
    </MotionTag>
  );
});
