import {
  forwardRef,
  useCallback,
  useMemo,
  useState,
  type ComponentType,
  type CSSProperties,
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
  columnsClasses,
  columnGapClasses,
  elevationClasses,
  flowClasses,
  gapClasses,
  justifyClasses,
  morphTarget,
  rowGapClasses,
  shapeClasses,
  sizeClasses,
  spacingPixels,
  spanToCss,
  startToCss,
  variantClasses,
} from "./anatomy";
import type { GridItemProps, GridProps } from "./types";

export type {
  GridAlign,
  GridColumns,
  GridElevation,
  GridFlow,
  GridItemProps,
  GridJustify,
  GridProps,
  GridShape,
  GridSize,
  GridSpacing,
  GridSpan,
  GridStart,
  GridVariant,
} from "./types";

/**
 * M3 Grid. Token-aware 12-column layout primitive that re-skins MUI's
 * Grid with the M3 surface / shape / elevation / motion scales.
 * Polymorphic via `as`, supports five surface variants (text / filled /
 * tonal / outlined / elevated), three densities, the full shape token
 * scale, an optional interactive mode that paints the M3 state layer +
 * morphs the corner shape one notch up while hovered/focused/pressed
 * (M3 Expressive shape morph), and a `<GridItem>` child for explicit
 * column / row placement.
 *
 * Layout props (`columns` / `spacing` / `flow` / `align` / `justify`)
 * make Grid useful as a structured layout shell so consumers don't have
 * to reach for raw Tailwind utilities every time.
 */
export const Grid = forwardRef<HTMLElement, GridProps>(function Grid(
  {
    as = "div",
    variant = "text",
    size = "md",
    shape = "none",
    elevation = 0,
    columns = 12,
    spacing,
    rowSpacing,
    columnSpacing,
    flow = "row",
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

  // M3 Expressive shape morph: interactive Grids morph one shape step
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

  const fillClass = error
    ? colors.error
    : selected
      ? colors.selected
      : colors.rest;

  // Spacing: explicit row/column spacing wins; otherwise `spacing`
  // (or the size default) drives both axes via a single `gap-*` class.
  const baseSpacing = spacing ?? sizes.gap;
  const splitGap = rowSpacing !== undefined || columnSpacing !== undefined;
  const rowGapClass = splitGap
    ? rowGapClasses[rowSpacing ?? baseSpacing]
    : null;
  const columnGapClass = splitGap
    ? columnGapClasses[columnSpacing ?? baseSpacing]
    : null;
  const gapClass = splitGap ? null : gapClasses[baseSpacing];

  const role = interactive ? "button" : undefined;
  const tabIndex = interactive && !disabled ? 0 : undefined;

  const showHeader = Boolean(label || leadingIcon || trailingIcon);

  // motion.create() is keyed by the polymorphic element so consumers
  // can render Grid as `<section>`, `<aside>`, etc. while still getting
  // motion/react animation hooks.
  const MotionTag = useMemo(
    () =>
      motion.create(
        as as unknown as "div",
      ) as unknown as ComponentType<HTMLMotionProps<"div">>,
    [as],
  );

  const dataRowSpacing = rowSpacing ?? baseSpacing;
  const dataColumnSpacing = columnSpacing ?? baseSpacing;

  return (
    <MotionTag
      ref={ref as ForwardedRef<HTMLDivElement>}
      role={role}
      aria-label={interactive ? ariaLabel : undefined}
      aria-disabled={interactive && disabled ? true : undefined}
      aria-selected={interactive ? selected || undefined : undefined}
      aria-invalid={error || undefined}
      data-component="grid"
      data-variant={variant}
      data-size={size}
      data-shape={shape}
      data-elevation={
        variant === "elevated" || elevation > 0 ? elevation : undefined
      }
      data-columns={columns}
      data-flow={flow}
      data-row-spacing={dataRowSpacing}
      data-column-spacing={dataColumnSpacing}
      data-row-gap-px={spacingPixels[dataRowSpacing]}
      data-column-gap-px={spacingPixels[dataColumnSpacing]}
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
        "grid",
        columnsClasses[columns],
        flowClasses[flow],
        gapClass,
        rowGapClass,
        columnGapClass,
        sizes.minRow,
        alignClasses[align],
        justifyClasses[justify],
        sizes.pad,
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
      {children}
    </MotionTag>
  );
});

/**
 * GridItem — places a child within a parent `<Grid>`. `span` and
 * `start` map to `grid-column`; `rowSpan` and `rowStart` map to
 * `grid-row`. Inline styles are used for placement so spans up to 12
 * work without depending on Tailwind's default `row-span-*` ceiling.
 *
 * Items can also paint an M3 surface variant + corner shape so a
 * GridItem doubles as a tinted layout cell when needed.
 */
export const GridItem = forwardRef<HTMLElement, GridItemProps>(
  function GridItem(
    {
      as = "div",
      span = "auto",
      start = "auto",
      rowSpan = "auto",
      rowStart = "auto",
      variant = "text",
      shape = "none",
      selected = false,
      disabled = false,
      error = false,
      children,
      className,
      style,
      ...rest
    },
    ref: ForwardedRef<HTMLElement>,
  ) {
    const colors = variantClasses[variant];
    const radius = shapeClasses[shape];
    const fill = error
      ? colors.error
      : selected
        ? colors.selected
        : colors.rest;

    const MotionTag = useMemo(
      () =>
        motion.create(
          as as unknown as "div",
        ) as unknown as ComponentType<HTMLMotionProps<"div">>,
      [as],
    );

    const placement: CSSProperties = {
      gridColumn:
        start === "auto"
          ? spanToCss(span)
          : `${startToCss(start)} / ${
              span === "auto"
                ? "auto"
                : span === "full"
                  ? "-1"
                  : `span ${span}`
            }`,
      gridRow:
        rowStart === "auto"
          ? spanToCss(rowSpan)
          : `${startToCss(rowStart)} / ${
              rowSpan === "auto"
                ? "auto"
                : rowSpan === "full"
                  ? "-1"
                  : `span ${rowSpan}`
            }`,
    };

    return (
      <MotionTag
        ref={ref as ForwardedRef<HTMLDivElement>}
        data-component="grid-item"
        data-span={String(span)}
        data-start={String(start)}
        data-row-span={String(rowSpan)}
        data-row-start={String(rowStart)}
        data-variant={variant}
        data-shape={shape}
        data-selected={selected || undefined}
        data-error={error || undefined}
        data-disabled={disabled || undefined}
        aria-disabled={disabled || undefined}
        aria-selected={selected || undefined}
        aria-invalid={error || undefined}
        className={cn(
          anatomy.cell,
          radius,
          fill,
          colors.border,
          disabled && anatomy.cellDisabled,
          className,
        )}
        style={{ ...placement, ...style }}
        {...rest}
      >
        {children}
      </MotionTag>
    );
  },
);
