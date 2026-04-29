import { forwardRef } from "react";
import { cn } from "@/lib/cn";
import {
  anatomy,
  shapeClasses,
  sizeClasses,
  variantClasses,
} from "./anatomy";
import type { AppBarProps } from "./types";

export type {
  AppBarProps,
  AppBarShape,
  AppBarSize,
  AppBarVariant,
} from "./types";

/**
 * M3 Expressive App Bar.
 *
 * Implements the four M3 Top App Bar variants (small / center-aligned
 * / medium / large) plus a Bottom App Bar variant per
 * https://m3.material.io/components/top-app-bar and
 * https://m3.material.io/components/bottom-app-bar.
 *
 * Surface fill swaps from `surface` to `surface-container` when
 * `scrolled` is true (M3 on-scroll guidance). Setting `elevated`
 * additionally lifts the bar to elevation-2 — used by docked /
 * contextual app bars and by the Bottom App Bar.
 *
 * The component is layout-only — wire `scrolled` from your scroll
 * container or use the IntersectionObserver in your shell.
 */
export const AppBar = forwardRef<HTMLElement, AppBarProps>(function AppBar(
  {
    variant = "small",
    size = "md",
    shape = "none",
    title,
    leading,
    trailing,
    scrolled = false,
    elevated = false,
    disabled = false,
    children,
    className,
    role: roleProp,
    ...rest
  },
  ref,
) {
  const styles = variantClasses[variant];
  const sizes = sizeClasses[size];
  const Element = styles.element;
  const role = roleProp ?? styles.role;
  const totalHeight = styles.height[size];
  const topRowHeight = variantClasses.small.height[size];

  return (
    <Element
      // forwardRef on a polymorphic union — React's typings demand the
      // cast because `header | footer` doesn't widen in JSX.
      ref={ref as React.Ref<HTMLElement & HTMLDivElement>}
      role={role}
      data-component="app-bar"
      data-variant={variant}
      data-size={size}
      data-shape={shape}
      data-scrolled={scrolled || undefined}
      data-elevated={elevated || undefined}
      data-disabled={disabled || undefined}
      className={cn(
        anatomy.root,
        shapeClasses[shape],
        scrolled ? styles.scrolled : styles.rest,
        elevated && styles.elevation,
        disabled && anatomy.disabled,
        className,
      )}
      style={{ minHeight: totalHeight }}
      {...rest}
    >
      <div
        data-slot="top-row"
        className={cn(anatomy.topRow, sizes.gutter, sizes.gap)}
        style={{ minHeight: topRowHeight }}
      >
        {leading ? (
          <span
            data-slot="leading"
            className={cn(anatomy.leading, sizes.iconSize)}
          >
            {leading}
          </span>
        ) : null}
        {styles.layout === "single-row" && title ? (
          <span
            data-slot="title-wrap"
            className={cn(anatomy.titleSmall, styles.titleAlign)}
          >
            <span data-slot="title" className={cn(anatomy.title, styles.titleType)}>
              {title}
            </span>
          </span>
        ) : null}
        {styles.layout === "two-row" && !title ? (
          <span data-slot="title-spacer" className="flex-1" />
        ) : null}
        {styles.layout === "two-row" && title ? (
          <span data-slot="title-spacer" className="flex-1" />
        ) : null}
        {trailing ? (
          <span
            data-slot="trailing"
            className={cn(anatomy.trailing, sizes.gap)}
          >
            {trailing}
          </span>
        ) : null}
      </div>
      {styles.layout === "two-row" && (title || children) ? (
        <div
          data-slot="title-row"
          className={cn(anatomy.titleRow, sizes.gutter)}
          style={{ minHeight: totalHeight - topRowHeight }}
        >
          {title ? (
            <span data-slot="title" className={cn(anatomy.title, styles.titleType)}>
              {title}
            </span>
          ) : null}
          {children}
        </div>
      ) : null}
      {styles.layout === "single-row" && children ? (
        <div data-slot="extras" className={cn(sizes.gutter, "pb-2")}>
          {children}
        </div>
      ) : null}
    </Element>
  );
});
