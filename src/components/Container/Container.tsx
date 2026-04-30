import {
  forwardRef,
  useMemo,
  type ComponentType,
  type ForwardedRef,
} from "react";
import {
  motion,
  useReducedMotion,
  type HTMLMotionProps,
} from "motion/react";
import { cn } from "@/lib/cn";
import { tweens } from "@/motion/presets";
import {
  anatomy,
  fixedClasses,
  gutterClasses,
  maxWidthClasses,
  shapeClasses,
  sizeClasses,
  variantClasses,
} from "./anatomy";
import type { ContainerProps } from "./types";

export type {
  ContainerMaxWidth,
  ContainerProps,
  ContainerShape,
  ContainerSize,
  ContainerVariant,
} from "./types";

/**
 * M3-tokenized Container.
 *
 * MUI's Container has no direct M3 spec — it is a layout primitive that
 * centres content horizontally and clamps it to a breakpoint-sized
 * max-width. We re-skin it with the same M3 surface roles, shape scale,
 * elevation tokens, and motion envelope as the rest of the library so
 * the layout shell is a token-aware section landmark.
 *
 *   - Polymorphic via `as` (default `<main>` — Container reads as the
 *     primary section landmark).
 *   - Five surface variants (text / filled / tonal / outlined / elevated).
 *   - Three densities driving vertical padding, gap, min-height, and
 *     header type role.
 *   - Full M3 7-token shape scale (default `none` so the shell behaves
 *     as a plain layout host).
 *   - `maxWidth` mirrors MUI's breakpoint clamp (xs..xl plus `false`).
 *   - `fixed` pins `min-width` to the same breakpoint (matches MUI).
 *   - `disableGutters` drops horizontal padding while keeping the
 *     vertical rhythm intact.
 *   - `centered` centres the Container with `margin-inline: auto`
 *     (default `true`).
 *   - States: selected / disabled / error.
 *   - Container transitions ride the M3 standard tween (`medium2` /
 *     `emphasized`) so surface/shape/elevation changes animate fluidly.
 */
export const Container = forwardRef<HTMLElement, ContainerProps>(
  function Container(
    {
      as = "main",
      variant = "text",
      size = "md",
      shape = "none",
      maxWidth = "lg",
      fixed = false,
      disableGutters = false,
      centered = true,
      selected = false,
      disabled = false,
      error = false,
      leadingIcon,
      trailingIcon,
      label,
      children,
      className,
      "aria-label": ariaLabel,
      ...rest
    },
    ref: ForwardedRef<HTMLElement>,
  ) {
    const reduced = useReducedMotion();
    const colors = variantClasses[variant];
    const sizes = sizeClasses[size];
    const radius = shapeClasses[shape];

    const fillClass = error
      ? colors.error
      : selected
        ? colors.selected
        : colors.rest;

    const showHeader = Boolean(label || leadingIcon || trailingIcon);

    // motion.create() is keyed by the polymorphic element so consumers
    // can render Container as `<section>`, `<aside>`, etc. while still
    // getting motion/react animation hooks. The result is cast to the
    // div-shaped motion type so the JSX prop union does not explode
    // into every possible intrinsic element.
    const MotionTag = useMemo(
      () =>
        motion.create(
          as as unknown as "div",
        ) as unknown as ComponentType<HTMLMotionProps<"div">>,
      [as],
    );

    const widthClass = maxWidth === false ? "max-w-none" : maxWidthClasses[maxWidth];
    const fixedClass = fixed && maxWidth !== false ? fixedClasses[maxWidth] : null;
    const gutterClass = disableGutters ? null : gutterClasses[size];

    return (
      <MotionTag
        ref={ref as ForwardedRef<HTMLDivElement>}
        role={as === "main" ? undefined : "region"}
        aria-label={ariaLabel}
        aria-disabled={disabled || undefined}
        aria-invalid={error || undefined}
        aria-selected={selected || undefined}
        data-component="container"
        data-variant={variant}
        data-size={size}
        data-shape={shape}
        data-max-width={maxWidth === false ? "none" : maxWidth}
        data-fixed={fixed || undefined}
        data-disable-gutters={disableGutters || undefined}
        data-centered={centered || undefined}
        data-selected={selected || undefined}
        data-error={error || undefined}
        data-disabled={disabled || undefined}
        // Animate opacity through `animate` so the disabled wash beats
        // motion/react's inline-style cascade (recorded in feedback memory).
        // `initial` mirrors `animate` so the first paint locks in the
        // resting opacity without an in-flight tween.
        initial={{ opacity: disabled ? 0.38 : 1 }}
        animate={{ opacity: disabled ? 0.38 : 1 }}
        transition={reduced ? { duration: 0 } : tweens.standard}
        className={cn(
          anatomy.root,
          sizes.padY,
          sizes.gap,
          sizes.minH,
          gutterClass,
          radius,
          fillClass,
          colors.border,
          colors.elevation,
          widthClass,
          fixedClass,
          centered && "mx-auto",
          disabled && anatomy.disabled,
          className,
        )}
        {...rest}
      >
        {showHeader ? (
          <div data-slot="header" className={cn(anatomy.header, sizes.headerType)}>
            {leadingIcon ? (
              <span
                aria-hidden
                data-slot="icon-leading"
                className={cn(anatomy.icon, colors.iconColor)}
              >
                {leadingIcon}
              </span>
            ) : null}
            {label ? <span data-slot="label">{label}</span> : null}
            {trailingIcon ? (
              <span
                aria-hidden
                data-slot="icon-trailing"
                className={cn(anatomy.icon, colors.iconColor, "ml-auto")}
              >
                {trailingIcon}
              </span>
            ) : null}
          </div>
        ) : null}
        {children !== undefined && children !== null ? (
          <div data-slot="body" className={anatomy.body}>
            {children}
          </div>
        ) : null}
      </MotionTag>
    );
  },
);
