import {
  Children,
  Fragment,
  cloneElement,
  forwardRef,
  isValidElement,
  useCallback,
  useMemo,
  useState,
  type ComponentType,
  type ForwardedRef,
  type KeyboardEvent,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
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
  elevationClasses,
  justifyClasses,
  morphTarget,
  orientationFor,
  shapeClasses,
  sizeClasses,
  spacingClasses,
  spacingPixels,
  variantClasses,
  wrapClasses,
} from "./anatomy";
import type { StackProps } from "./types";

export type {
  StackAlign,
  StackDirection,
  StackElevation,
  StackJustify,
  StackProps,
  StackShape,
  StackSize,
  StackSpacing,
  StackVariant,
  StackWrap,
} from "./types";

/**
 * M3 Stack. Token-aware single-axis flex layout primitive that
 * re-skins MUI's Stack with the M3 surface / shape / elevation /
 * motion scales. Polymorphic via `as`, supports five surface variants
 * (text / filled / tonal / outlined / elevated), three densities,
 * the full shape token scale, an optional interactive mode that
 * paints the M3 state layer + morphs the corner shape one notch up
 * while hovered/focused/pressed (M3 Expressive shape morph), and an
 * optional `divider` slot rendered between every pair of stacked
 * children.
 *
 * Layout props (`direction` / `spacing` / `align` / `justify` /
 * `wrap`) make Stack useful as a structured layout shell so consumers
 * don't have to reach for raw Tailwind utilities every time.
 */
export const Stack = forwardRef<HTMLElement, StackProps>(function Stack(
  {
    as = "div",
    variant = "text",
    size = "md",
    shape = "none",
    elevation = 0,
    direction = "column",
    spacing,
    align = "stretch",
    justify = "start",
    wrap = "nowrap",
    divider,
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

  // M3 Expressive shape morph: interactive Stacks morph one shape
  // step up while hovered/focused/pressed.
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

  const baseSpacing = spacing ?? sizes.gap;
  const spacingClass = spacingClasses[baseSpacing];

  const role = interactive ? "button" : undefined;
  const tabIndex = interactive && !disabled ? 0 : undefined;

  const showHeader = Boolean(label || leadingIcon || trailingIcon);

  // motion.create() is keyed by the polymorphic element so consumers
  // can render Stack as `<section>`, `<aside>`, etc. while still
  // getting motion/react animation hooks.
  const MotionTag = useMemo(
    () =>
      motion.create(
        as as unknown as "div",
      ) as unknown as ComponentType<HTMLMotionProps<"div">>,
    [as],
  );

  // MUI parity: when `divider` is provided, intersperse a separator
  // between every pair of stacked children. Each rendered separator
  // is wrapped so it stretches across the cross-axis regardless of
  // the consumer's chosen divider node.
  const trackChildren = useMemo<ReactNode>(() => {
    if (!divider) return children;
    const items = Children.toArray(children);
    if (items.length <= 1) return items;
    const out: ReactNode[] = [];
    items.forEach((child, idx) => {
      out.push(child);
      if (idx < items.length - 1) {
        const isElement = isValidElement(divider);
        const dividerNode: ReactNode = isElement
          ? cloneElement(divider as ReactElement<{ "aria-hidden"?: boolean }>, {
              "aria-hidden": true,
            })
          : divider;
        out.push(
          <span
            key={`stack-divider-${idx}`}
            data-slot="divider"
            aria-hidden
            role="presentation"
            className={anatomy.divider}
          >
            {dividerNode}
          </span>,
        );
      }
    });
    return <Fragment>{out}</Fragment>;
  }, [children, divider]);

  return (
    <MotionTag
      ref={ref as ForwardedRef<HTMLDivElement>}
      role={role}
      aria-label={interactive ? ariaLabel : undefined}
      aria-disabled={interactive && disabled ? true : undefined}
      aria-selected={interactive ? selected || undefined : undefined}
      aria-invalid={error || undefined}
      aria-orientation={divider ? orientationFor[direction] : undefined}
      data-component="stack"
      data-variant={variant}
      data-size={size}
      data-shape={shape}
      data-elevation={
        variant === "elevated" || elevation > 0 ? elevation : undefined
      }
      data-direction={direction}
      data-spacing={baseSpacing}
      data-spacing-px={spacingPixels[baseSpacing]}
      data-wrap={wrap}
      data-has-divider={divider ? "true" : undefined}
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
        "flex flex-col",
        sizes.minCross,
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
        <span data-slot="header" className={cn(anatomy.header, "mb-3")}>
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
        data-slot="track"
        data-direction={direction}
        className={cn(
          anatomy.track,
          directionClasses[direction],
          spacingClass,
          alignClasses[align],
          justifyClasses[justify],
          wrapClasses[wrap],
          // The track grows to fill the host so align/justify work as
          // consumers expect when the host is taller/wider than the
          // children.
          "w-full flex-1",
        )}
      >
        {trackChildren}
      </div>
    </MotionTag>
  );
});
