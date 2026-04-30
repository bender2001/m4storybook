import {
  forwardRef,
  useCallback,
  useMemo,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
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
import { IconAxisContext } from "@/components/MaterialIcons/iconAxisContext";
import {
  anatomy,
  elevatedClasses,
  shapeClasses,
  sizeClasses,
  variantClasses,
} from "./anatomy";
import type { ChipProps } from "./types";

export type { ChipProps, ChipSize, ChipVariant } from "./types";

/**
 * A leading check glyph that filter / input chips show when selected.
 * Always 16dp regardless of chip size — the M3 chip leading icon slot
 * is fixed at 18dp, we use 16dp for crisp rendering at 1x.
 */
const CheckGlyph = () => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    width="100%"
    height="100%"
    fill="currentColor"
  >
    <path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z" />
  </svg>
);

/**
 * Trailing dismiss glyph for input chips. Renders inside a small
 * round button that catches its own pointer events so the chip's
 * onClick doesn't fire.
 */
const DismissGlyph = () => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    width="100%"
    height="100%"
    fill="currentColor"
  >
    <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
  </svg>
);

/**
 * M3 Expressive Chip. Wraps an action / selection / dismissible tag
 * surface, with a shape morph from shape-sm (8dp) to shape-full (pill)
 * when selected. Supports four variants (assist / filter / input /
 * suggestion), three sizes, optional elevated container, leading +
 * trailing icon slots, and a built-in dismiss affordance via
 * `onDelete`.
 */
export const Chip = forwardRef<HTMLButtonElement, ChipProps>(function Chip(
  {
    variant = "assist",
    size = "md",
    label,
    leadingIcon,
    trailingIcon,
    selected = false,
    disabled = false,
    elevated = false,
    onDelete,
    deleteLabel = "Remove",
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
    type,
    ...rest
  },
  ref,
) {
  const reduced = useReducedMotion();
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [pressed, setPressed] = useState(false);

  // Filter/input chips show a leading check glyph when selected,
  // unless a custom leadingIcon was supplied.
  const wantsAutoCheck =
    selected && !leadingIcon && (variant === "filter" || variant === "input");
  const resolvedLeading = wantsAutoCheck ? <CheckGlyph /> : leadingIcon;

  const styles = variantClasses[variant];
  const sizes = sizeClasses[size];
  const colorClass = selected
    ? styles.selected
    : elevated
      ? elevatedClasses[variant]
      : styles.rest;
  const shape = selected ? shapeClasses.selected : shapeClasses.rest;

  // Padding gets tightened on the side that has an icon so the
  // overall touch target matches the M3 chip spec.
  const trailingSlot = onDelete ? <DismissGlyph /> : trailingIcon;
  const hasLeading = Boolean(resolvedLeading);
  const hasTrailing = Boolean(trailingSlot);
  const padding =
    hasLeading && hasTrailing
      ? `pl-2 pr-1`
      : hasLeading
        ? sizes.paddingXWithLeading
        : hasTrailing
          ? sizes.paddingXWithTrailing
          : sizes.paddingX;

  const stateLayer = disabled
    ? 0
    : pressed
      ? stateLayerOpacity.pressed
      : focused
        ? stateLayerOpacity.focus
        : hovered
          ? stateLayerOpacity.hover
          : 0;

  // M3 Expressive shape morph: chip rest = shape-sm (8dp), selected
  // = pill (full). Pressed nudges one step squarer in either state so
  // the press feels tactile. Driven by motion/react with the spatial
  // expressive spring so the corner overshoots on release.
  const baseRadius = selected ? shapePx.full : shapePx.sm;
  const pressedRadius = selected ? shapePx.lg : shapePx.xs;
  const radius = pressed ? pressedRadius : baseRadius;

  const isToggle = variant === "filter";
  const role = isToggle ? "button" : undefined;

  // M3 Expressive variable-icon axis hints for the chip's leading slot.
  const leadingAxisHints = useMemo(
    () => ({
      hovered: !disabled && (hovered || pressed),
      selected: !disabled && selected,
    }),
    [disabled, hovered, pressed, selected],
  );

  const handleClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      if (disabled) return;
      onClick?.(event);
    },
    [disabled, onClick],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>) => {
      onKeyDown?.(event);
      if (disabled) return;
      if (event.defaultPrevented) return;
      if (event.key === " ") setPressed(true);
    },
    [disabled, onKeyDown],
  );

  const handleDeleteClick = useCallback(
    (event: MouseEvent<HTMLSpanElement>) => {
      event.stopPropagation();
      if (disabled) return;
      onDelete?.();
    },
    [disabled, onDelete],
  );

  const handleDeleteKeyDown = useCallback(
    (event: KeyboardEvent<HTMLSpanElement>) => {
      if (disabled) return;
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        event.stopPropagation();
        onDelete?.();
      }
      // Backspace + Delete on the chip also dismiss it (MUI parity).
      if (event.key === "Backspace" || event.key === "Delete") {
        event.preventDefault();
        event.stopPropagation();
        onDelete?.();
      }
    },
    [disabled, onDelete],
  );

  return (
    <motion.button
      ref={ref}
      type={type ?? "button"}
      role={role}
      aria-label={ariaLabel}
      aria-pressed={isToggle ? selected : undefined}
      aria-disabled={disabled || undefined}
      disabled={disabled}
      data-variant={variant}
      data-size={size}
      data-selected={selected || undefined}
      data-elevated={elevated || undefined}
      data-disabled={disabled || undefined}
      initial={false}
      animate={{ borderRadius: radius }}
      whileHover={!disabled && !reduced ? { scale: 1.02 } : undefined}
      whileTap={!disabled && !reduced ? { scale: 0.97 } : undefined}
      transition={
        reduced
          ? { duration: 0 }
          : {
              default: springs.springy,
              borderRadius: shapeMorphTransition,
              scale: bouncyPress,
            }
      }
      onPointerEnter={(e: PointerEvent<HTMLButtonElement>) => {
        setHovered(true);
        onPointerEnter?.(e);
      }}
      onPointerLeave={(e: PointerEvent<HTMLButtonElement>) => {
        setHovered(false);
        setPressed(false);
        onPointerLeave?.(e);
      }}
      onPointerDown={(e: PointerEvent<HTMLButtonElement>) => {
        if (!disabled) setPressed(true);
        onPointerDown?.(e);
      }}
      onPointerUp={(e: PointerEvent<HTMLButtonElement>) => {
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
        sizes.container,
        sizes.text,
        sizes.gap,
        padding,
        shape,
        colorClass,
        disabled && anatomy.disabled,
        className,
      )}
      {...rest}
    >
      {resolvedLeading ? (
        <span
          aria-hidden
          data-slot="leading"
          className={cn(anatomy.iconLeading, sizes.iconBox)}
        >
          <IconAxisContext.Provider value={leadingAxisHints}>
            {resolvedLeading}
          </IconAxisContext.Provider>
        </span>
      ) : null}
      <span data-slot="label" className={anatomy.label}>
        {label ?? children}
      </span>
      {trailingSlot ? (
        onDelete ? (
          <span
            role="button"
            aria-label={deleteLabel}
            tabIndex={disabled ? -1 : 0}
            data-slot="delete"
            className={cn(anatomy.deleteButton, sizes.deleteBox)}
            onClick={handleDeleteClick}
            onKeyDown={handleDeleteKeyDown}
            onPointerDown={(e) => e.stopPropagation()}
          >
            {trailingSlot}
          </span>
        ) : (
          <span
            aria-hidden
            data-slot="trailing"
            className={cn(anatomy.iconTrailing, sizes.iconBox)}
          >
            {trailingSlot}
          </span>
        )
      ) : null}
      <span
        aria-hidden
        data-state-layer
        className={cn(anatomy.stateLayer, styles.stateLayer)}
        style={{ opacity: stateLayer }}
      />
    </motion.button>
  );
});
