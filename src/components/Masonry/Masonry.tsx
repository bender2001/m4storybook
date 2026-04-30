import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useMemo,
  useState,
  type CSSProperties,
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
  anatomy,
  elevationClasses,
  morphTarget,
  packingDescription,
  shapeClasses,
  sizeClasses,
  spacingPixels,
  variantClasses,
} from "./anatomy";
import type {
  MasonryItemProps,
  MasonryProps,
  MasonryShape,
} from "./types";

export type {
  MasonryElevation,
  MasonryItemProps,
  MasonryPacking,
  MasonryProps,
  MasonryShape,
  MasonrySize,
  MasonrySpacing,
  MasonryVariant,
} from "./types";

/**
 * Context that lets MasonryItem read the host shape token without
 * forcing consumers to plumb props down. Packing strategy is exposed
 * via the `data-packing` attribute on the host so descendant CSS can
 * adjust column-span per packing without React having to walk the
 * child tree.
 */
const MasonryContext = createContext<{ shape: MasonryShape }>({
  shape: "md",
});

/**
 * M3 Masonry. Token-aware Pinterest-style multi-column layout that
 * re-skins MUI's Masonry with the M3 surface / shape / elevation /
 * motion scales. Polymorphic via `as`, supports balanced and
 * sequential packing on top of five M3 surface variants, three
 * densities, the full shape token scale, and an optional header
 * (label + leading/trailing icon slots).
 *
 * Tile children are typically `<MasonryItem>` instances that may
 * paint the M3 state-layer + morph the corner shape one notch up
 * while hovered/focused/pressed (M3 Expressive shape morph). Tiles
 * flow at their natural height inside CSS multi-columns and never
 * split across columns thanks to `break-inside: avoid`.
 */
export const Masonry = forwardRef<HTMLElement, MasonryProps>(
  function Masonry(
    {
      as = "div",
      variant = "text",
      size = "md",
      shape = "md",
      elevation = 0,
      columns,
      spacing,
      packing = "balanced",
      selected = false,
      disabled = false,
      error = false,
      leadingIcon,
      trailingIcon,
      label,
      children,
      className,
      style,
      "aria-label": ariaLabel,
      ...rest
    },
    ref: ForwardedRef<HTMLElement>,
  ) {
    const reduced = useReducedMotion();
    const colors = variantClasses[variant];
    const sizes = sizeClasses[size];

    const baseSpacing = spacing ?? sizes.gap;
    const gapPx = spacingPixels[baseSpacing];

    const colCount = columns ?? 3;

    const elevationClass =
      variant === "elevated"
        ? elevationClasses[elevation === 0 ? 1 : elevation]
        : elevation > 0
          ? elevationClasses[elevation]
          : colors.elevation;

    const fillClass = error
      ? colors.error
      : selected
        ? colors.selected
        : colors.rest;

    const hostShape = shapeClasses[shape];

    const layoutStyle: CSSProperties = {
      columnCount: colCount,
      columnGap: `${gapPx}px`,
      columnFill: packing === "sequential" ? "auto" : "balance",
      ["--masonry-row-gap" as string]: `${gapPx}px`,
    };

    const showHeader = Boolean(label || leadingIcon || trailingIcon);

    const MotionTag = useMemo(
      () =>
        motion.create(
          as as unknown as "div",
        ) as unknown as ComponentType<HTMLMotionProps<"div">>,
      [as],
    );

    const ctx = useMemo(() => ({ shape }), [shape]);

    return (
      <MasonryContext.Provider value={ctx}>
        <MotionTag
          ref={ref as ForwardedRef<HTMLDivElement>}
          role="list"
          aria-label={ariaLabel}
          aria-roledescription={packingDescription[packing]}
          aria-disabled={disabled || undefined}
          aria-selected={selected || undefined}
          aria-invalid={error || undefined}
          data-component="masonry"
          data-variant={variant}
          data-packing={packing}
          data-size={size}
          data-shape={shape}
          data-elevation={
            variant === "elevated" || elevation > 0 ? elevation : undefined
          }
          data-columns={colCount}
          data-spacing={baseSpacing}
          data-spacing-px={gapPx}
          data-selected={selected || undefined}
          data-error={error || undefined}
          data-disabled={disabled || undefined}
          transition={reduced ? { duration: 0 } : springs.gentle}
          className={cn(
            anatomy.root,
            sizes.pad,
            hostShape,
            fillClass,
            colors.border,
            elevationClass,
            disabled && anatomy.rootDisabled,
            className,
          )}
          style={style}
          {...rest}
        >
          {showHeader ? (
            <span data-slot="header" className={anatomy.header}>
              {leadingIcon ? (
                <span
                  aria-hidden
                  data-slot="leading-icon"
                  className={anatomy.icon}
                >
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
          <div
            data-slot="layout"
            data-packing={packing}
            className={anatomy.layout}
            style={layoutStyle}
          >
            {children}
          </div>
        </MotionTag>
      </MasonryContext.Provider>
    );
  },
);

/**
 * MasonryItem — a single tile inside a `<Masonry>`. Tiles flow at
 * their natural height inside the parent's CSS multi-columns and
 * never split across columns. Interactive tiles paint the M3 state
 * layer and morph the corner shape on hover / focus / press.
 */
export const MasonryItem = forwardRef<HTMLElement, MasonryItemProps>(
  function MasonryItem(
    {
      as = "div",
      shape: shapeProp,
      selected = false,
      disabled = false,
      interactive: interactiveProp,
      children,
      className,
      style,
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
    const ctx = useContext(MasonryContext);
    const shape = shapeProp ?? ctx.shape;
    const [hovered, setHovered] = useState(false);
    const [focused, setFocused] = useState(false);
    const [pressed, setPressed] = useState(false);

    const interactive = interactiveProp ?? Boolean(onClick);

    const morph = interactive && !disabled && (hovered || focused || pressed);
    const radiusClass = morph ? morphTarget[shape] : shapeClasses[shape];

    const layer =
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

    const MotionTag = useMemo(
      () =>
        motion.create(
          as as unknown as "div",
        ) as unknown as ComponentType<HTMLMotionProps<"div">>,
      [as],
    );

    const role = interactive ? "button" : "listitem";
    const tabIndex = interactive && !disabled ? 0 : undefined;

    const fillClass = selected ? anatomy.tileSelected : anatomy.tileRest;

    return (
      <MotionTag
        ref={ref as ForwardedRef<HTMLDivElement>}
        role={role}
        aria-label={interactive ? ariaLabel : undefined}
        aria-disabled={interactive && disabled ? true : undefined}
        aria-selected={interactive ? selected || undefined : undefined}
        data-component="masonry-item"
        data-shape={shape}
        data-interactive={interactive || undefined}
        data-selected={selected || undefined}
        data-disabled={disabled || undefined}
        data-state-layer-opacity={interactive ? layer : undefined}
        tabIndex={tabIndex}
        whileHover={
          interactive && !disabled && !reduced ? { y: -1 } : undefined
        }
        whileTap={
          interactive && !disabled && !reduced
            ? { y: 0, scale: 0.98 }
            : undefined
        }
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
          anatomy.tile,
          fillClass,
          radiusClass,
          interactive && !disabled && anatomy.tileInteractive,
          disabled && anatomy.tileDisabled,
          className,
        )}
        style={style}
        {...rest}
      >
        {children}
        {interactive ? (
          <span
            aria-hidden
            data-slot="state-layer"
            className={anatomy.tileStateLayer}
            style={{ opacity: layer }}
          />
        ) : null}
      </MotionTag>
    );
  },
);
(MasonryItem as { displayName?: string }).displayName = "MasonryItem";
