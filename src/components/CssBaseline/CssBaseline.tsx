import {
  forwardRef,
  useMemo,
  type ComponentType,
  type CSSProperties,
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
  shapeClasses,
  sizeClasses,
  variantClasses,
} from "./anatomy";
import type { CssBaselineProps } from "./types";

export type {
  CssBaselineProps,
  CssBaselineShape,
  CssBaselineSize,
  CssBaselineVariant,
} from "./types";

/**
 * M3-tokenized CSS Baseline.
 *
 * MUI's `<CssBaseline />` is a global reset that aligns the document
 * with the active theme: body margin -> 0, background -> surface,
 * color -> on-surface, antialiased font smoothing, and
 * `* { box-sizing: border-box }`. M3 has no equivalent component, so
 * we re-skin it with the M3 token layer:
 *
 *   - Polymorphic via `as` (default `<section>` so the reset reads as
 *     a labelled scoped landmark rather than the global landmark).
 *   - Five surface variants (text / filled / tonal / outlined / elevated).
 *   - Three densities driving padding, gap, min-height, and the body
 *     type role used as the baseline reset.
 *   - Full M3 7-token shape scale (default `none` so the shell behaves
 *     as a plain reset host).
 *   - `scoped` (default true) keeps the reset local to the subtree so
 *     Storybook iframes do not clobber the global document.
 *   - `enableColorScheme` mirrors MUI's prop: when true the host writes
 *     `color-scheme: light dark` so native form controls / scrollbars
 *     follow the active palette.
 *   - States: selected / disabled / error.
 *   - CSS Baseline transitions ride the M3 standard tween (`medium2` /
 *     `emphasized`) so theme + surface changes animate fluidly.
 */
export const CssBaseline = forwardRef<HTMLElement, CssBaselineProps>(
  function CssBaseline(
    {
      as = "section",
      variant = "filled",
      size = "md",
      shape = "none",
      scoped = true,
      enableColorScheme = false,
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
    const radius = shapeClasses[shape];

    const fillClass = error
      ? colors.error
      : selected
        ? colors.selected
        : colors.rest;

    const showHeader = Boolean(label || leadingIcon || trailingIcon);

    const MotionTag = useMemo(
      () =>
        motion.create(
          as as unknown as "div",
        ) as unknown as ComponentType<HTMLMotionProps<"div">>,
      [as],
    );

    const mergedStyle: CSSProperties | undefined = enableColorScheme
      ? { colorScheme: "light dark", ...(style as CSSProperties | undefined) }
      : (style as CSSProperties | undefined);

    return (
      <MotionTag
        ref={ref as ForwardedRef<HTMLDivElement>}
        role={as === "section" ? "region" : undefined}
        aria-label={ariaLabel}
        aria-disabled={disabled || undefined}
        aria-invalid={error || undefined}
        aria-selected={selected || undefined}
        data-component="css-baseline"
        data-variant={variant}
        data-size={size}
        data-shape={shape}
        data-scoped={scoped || undefined}
        data-enable-color-scheme={enableColorScheme || undefined}
        data-selected={selected || undefined}
        data-error={error || undefined}
        data-disabled={disabled || undefined}
        // Animate opacity through `animate` so the disabled wash beats
        // motion/react's inline-style cascade (recorded in feedback memory).
        initial={{ opacity: disabled ? 0.38 : 1 }}
        animate={{ opacity: disabled ? 0.38 : 1 }}
        transition={reduced ? { duration: 0 } : tweens.standard}
        style={mergedStyle}
        className={cn(
          anatomy.root,
          sizes.pad,
          sizes.gap,
          sizes.minH,
          sizes.bodyType,
          radius,
          fillClass,
          colors.border,
          colors.elevation,
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
